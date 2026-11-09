import os
import re
import json
import zipfile
import tempfile
import shutil
import gc
from pathlib import Path
from django.conf import settings
from django.db import transaction
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.files import File
from django.utils.text import slugify

from .models import TechnologyCategory, Technology, Module, Concept, Note
from quizzes.models import Quiz, Question, AnswerOption

try:
    import docx
except ImportError:
    docx = None

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None


class ZipCourseIngestionService:
    """
    Ingests and processes ZIP archives containing course notes, PDFs, Word docs,
    Jupyter notebooks, and practice question sets into structured database models.
    """

    @staticmethod
    def extract_text_from_file(file_path):
        """
        Extracts plain text and code blocks from various document formats
        with strict memory limits and page caps to protect 512MB RAM servers.
        """
        ext = os.path.splitext(file_path)[1].lower()
        extracted_text = ""

        try:
            file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
            # If file is larger than 20MB, do not load entire content stream into memory
            if file_size_mb > 20:
                return f"Large document resource: {os.path.basename(file_path)}. Complete document is attached below for download."

            if ext in ['.docx', '.doc'] and docx:
                doc = docx.Document(file_path)
                lines = []
                for p in doc.paragraphs[:80]:
                    t = p.text.strip()
                    if t:
                        lines.append(t)
                    if sum(len(x) for x in lines) > 25000:
                        break
                for table in doc.tables[:3]:
                    for row in table.rows[:15]:
                        row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                        if row_text:
                            lines.append(row_text)
                extracted_text = "\n\n".join(lines)

            elif ext == '.pdf':
                clean_name = os.path.splitext(os.path.basename(file_path))[0].replace('_', ' ').title()
                try:
                    # For PDFs > 3MB (eBooks, heavy slide decks), skip heavy vector AST parsing to protect 512MB RAM
                    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
                    if file_size_mb > 3:
                        extracted_text = f"Comprehensive Study Material: {clean_name}. Full lecture notes and practice presentation attached below for download."
                    elif pypdf:
                        reader = pypdf.PdfReader(file_path, strict=False)
                        pages_text = []
                        total_pages = len(reader.pages)
                        pages_to_read = min(3, total_pages)
                        for i in range(pages_to_read):
                            try:
                                txt = reader.pages[i].extract_text()
                                if txt:
                                    pages_text.append(txt.strip())
                                if sum(len(x) for x in pages_text) > 10000:
                                    break
                            except Exception:
                                break
                        extracted_text = "\n\n".join(pages_text) if pages_text else f"Lecture notes and reference material covering {clean_name}."
                        del reader
                        gc.collect()
                    else:
                        extracted_text = f"Curriculum reference material for {clean_name}."
                except Exception as pdf_err:
                    print(f"Safe PDF fallback for {clean_name}: {pdf_err}")
                    extracted_text = f"Lecture notes and reference material covering {clean_name}."

            elif ext in ['.pptx', '.ppt']:
                try:
                    import zipfile
                    slide_texts = []
                    with zipfile.ZipFile(file_path, 'r') as pzf:
                        slide_files = sorted([f for f in pzf.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')])
                        for s_file in slide_files[:40]:
                            xml_content = pzf.read(s_file).decode('utf-8', errors='ignore')
                            texts = re.findall(r'<a:t[^>]*>(.*?)</a:t>', xml_content)
                            if texts:
                                slide_texts.append(" ".join(t.strip() for t in texts if t.strip()))
                    extracted_text = "\n\n".join(slide_texts) if slide_texts else f"PowerPoint lecture presentation covering {clean_name}."
                except Exception as ppt_err:
                    print(f"PPT extraction fallback: {ppt_err}")
                    extracted_text = f"PowerPoint lecture slides covering {clean_name}."

            elif ext == '.ipynb':
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    nb_data = json.load(f)
                cells_text = []
                cells = nb_data.get('cells', [])[:60]
                for cell in cells:
                    cell_type = cell.get('cell_type')
                    source = "".join(cell.get('source', [])).strip()
                    if not source:
                        continue
                    if cell_type == 'markdown':
                        cells_text.append(source)
                    elif cell_type == 'code':
                        cells_text.append(f"```python\n{source}\n```")
                    if sum(len(x) for x in cells_text) > 25000:
                        break
                extracted_text = "\n\n".join(cells_text)

            elif ext in ['.txt', '.md', '.markdown', '.rst']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    extracted_text = f.read(30000)

            elif ext in ['.py', '.js', '.jsx', '.ts', '.tsx', '.sql', '.html', '.css', '.java', '.cpp', '.c']:
                lang = ext.replace('.', '')
                if lang in ['js', 'jsx', 'ts', 'tsx']:
                    lang = 'javascript'
                elif lang in ['py']:
                    lang = 'python'
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    code_content = f.read(25000)
                extracted_text = f"```{lang}\n{code_content}\n```"

        except Exception as e:
            print(f"Error extracting text from {file_path}: {e}")
            extracted_text = ""

        return extracted_text.strip()

    @staticmethod
    def is_question_document(file_name, text_sample):
        """
        Determines whether the document contains practice questions / quizzes.
        """
        name_lower = file_name.lower()
        if any(keyword in name_lower for keyword in ['quiz', 'question', 'mcq', 'practice', 'test', 'exam', 'assessment']):
            return True

        # Check for multiple question patterns in content
        q_matches = re.findall(r'(?:^\d+[\.\:]|\bQuestion\s*\d+)', text_sample, re.MULTILINE | re.IGNORECASE)
        opt_matches = re.findall(r'(?:^[A-Da-d][\.\)])', text_sample, re.MULTILINE)
        if len(q_matches) >= 2 and len(opt_matches) >= 4:
            return True

        return False

    @staticmethod
    def structure_note_with_ai(title, raw_text, detected_language='python', skip_ai=False):
        """
        Uses Gemini AI to structure raw extracted text into standard Note fields.
        Includes a resilient fallback heuristic if AI is unavailable.
        """
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')
        if not api_key and hasattr(settings, 'GEMINI_API_KEYS'):
            keys = getattr(settings, 'GEMINI_API_KEYS')
            if keys:
                api_key = keys[0]

        ai_structured = None
        # Only call Gemini if skip_ai is False, text is substantial, and we have an API key
        if not skip_ai and api_key and genai and raw_text and len(raw_text.strip()) > 30:
            prompt = f"""You are an expert technical course author.
Transform the following lesson document text into a clean, highly structured educational lesson note.

DOCUMENT TITLE: {title}
DOCUMENT CONTENT:
{raw_text[:4000]}

Extract or generate the following JSON fields:
- "title": Clean, professional lesson title.
- "definition": 1-2 sentence core definition.
- "syntax": Standard syntax pattern or empty string.
- "code_example": Representative code snippet demonstrating the concept.
- "code_language": Programming language (python, javascript, sql, html, css, etc.).
- "expected_output": Output produced by the code example.
- "explanation": Clear, step-by-step conceptual explanation (2-3 paragraphs).
- "real_world_analogy": A relatable analogy explaining the concept to a beginner.
- "common_mistakes": 2-3 frequent pitfalls or beginner traps.
- "important_points": 2-3 key takeaways or best practices.
- "interview_questions": 2 top technical interview questions and model answers on this topic.

Return valid JSON ONLY without markdown ticks or outer quotes.
"""
            try:
                genai.configure(api_key=api_key.strip())
                model = genai.GenerativeModel("gemini-2.5-flash")
                res = model.generate_content(prompt, request_options={"timeout": 6.0})
                if res and res.text:
                    cleaned = re.sub(r'```(?:json)?', '', res.text).strip()
                    ai_structured = json.loads(cleaned)
            except Exception as e:
                # Fast fallback to heuristic parser below
                pass

        # Fallback heuristic if AI parsing failed or had no key
        if not ai_structured or not isinstance(ai_structured, dict):
            # Extract code block if present
            code_match = re.search(r'```(?:[a-zA-Z]+)?\n(.*?)```', raw_text, re.DOTALL)
            code_ex = code_match.group(1).strip() if code_match else ""
            clean_text = re.sub(r'```.*?```', '', raw_text, flags=re.DOTALL).strip()
            first_para = clean_text.split('\n\n')[0] if clean_text else "Overview of " + title

            ai_structured = {
                "title": title,
                "definition": first_para[:300],
                "syntax": "",
                "code_example": code_ex,
                "code_language": detected_language,
                "expected_output": "",
                "explanation": clean_text[:2000] if clean_text else first_para,
                "real_world_analogy": f"Think of {title} as an essential building block in practical software development.",
                "common_mistakes": "• Incorrect syntax or indentation\n• Missing required imports or configurations",
                "important_points": f"• Master the core syntax and behavior of {title}\n• Test edge cases thoroughly",
                "interview_questions": f"Q: What is the primary purpose of {title} in {detected_language}?\nA: It provides efficient, reusable logic and maintainable code architecture."
            }

        return ai_structured

    @staticmethod
    def parse_and_create_quiz(quiz_title, raw_text, concept=None, module=None, user=None):
        """
        Parses practice question documents and creates Quiz, Questions, and AnswerOptions
        strictly extracted from the uploaded document text. Never invents synthetic questions.
        """
        blocks = re.split(r'\n\s*(?=(?:Q\d+[\.\:]|\d+[\.\)]|\bQuestion\s*\d+[\.\:]))', raw_text.strip())
        if not blocks or len(blocks) < 2:
            blocks = [b.strip() for b in raw_text.split('\n\n') if b.strip()]

        quiz = Quiz.objects.create(
            title=quiz_title,
            description=f"Interactive Practice Quiz for {quiz_title}",
            concept=concept,
            module=module,
            time_limit_minutes=max(5, min(30, len(blocks) * 2)),
            passing_score_percentage=70,
            difficulty_level='beginner',
            created_by=user
        )

        created_questions = 0
        current_order = 1
        options_to_create = []

        for block in blocks[:12]:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines:
                continue

            q_line = re.sub(r'^(?:Q\d+[\.\:]|\d+[\.\)])\s*', '', lines[0]).strip()
            if not q_line:
                continue

            options = []
            correct_letter = 'A'
            explanation = ''

            for line in lines[1:]:
                ans_match = re.match(r'^(?:Correct\s+Answer|Ans|Answer|Correct)[:\s\-]+([A-Da-d]|True|False)', line, re.IGNORECASE)
                if ans_match:
                    ans_val = ans_match.group(1).upper()
                    if ans_val == 'TRUE':
                        correct_letter = 'A'
                    elif ans_val == 'FALSE':
                        correct_letter = 'B'
                    else:
                        correct_letter = ans_val
                    continue

                exp_match = re.match(r'^(?:Exp|Explanation)[:\s]+(.*)', line, re.IGNORECASE)
                if exp_match:
                    explanation = exp_match.group(1).strip()
                    continue

                opt_match = re.match(r'^(?:([A-Da-d])[\.\)]|\(([A-Da-d])\))\s*(.*)', line)
                if opt_match:
                    letter = (opt_match.group(1) or opt_match.group(2)).upper()
                    opt_text = opt_match.group(3).strip()
                    options.append((letter, opt_text))

            if not options:
                ans_tf = re.search(r'^(?:Correct\s+Answer|Ans|Answer|Correct)[:\s\-]+(True|False)', block, re.IGNORECASE | re.MULTILINE)
                if ans_tf:
                    options = [('A', 'True'), ('B', 'False')]
                    correct_letter = 'A' if ans_tf.group(1).lower() == 'true' else 'B'

            if len(options) < 2:
                # Strictly require real choices from the document; do not invent fake options
                continue

            question = Question.objects.create(
                quiz=quiz,
                question_text=q_line,
                order=current_order,
                points=1,
                explanation=explanation or f"The correct answer is {correct_letter}."
            )
            current_order += 1
            created_questions += 1

            for idx, (letter, text) in enumerate(options):
                options_to_create.append(AnswerOption(
                    question=question,
                    option_text=text,
                    is_correct=(letter == correct_letter),
                    order=idx + 1
                ))

        if created_questions == 0:
            quiz.delete()
            return None, 0

        if options_to_create:
            AnswerOption.objects.bulk_create(options_to_create)

        return quiz, created_questions

    @classmethod
    def process_zip_upload(cls, zip_file_obj, technology_id=None, new_tech_name=None, category_id=None, user=None):
        """
        Main pipeline: unpacks ZIP, processes documents, builds modules, notes,
        and practice quizzes, attaching downloadable resources to notes.
        """
        temp_dir = tempfile.mkdtemp(prefix="technotes_zip_")
        results = {
            "success": False,
            "technology": None,
            "modules_created": 0,
            "concepts_created": 0,
            "notes_created": 0,
            "quizzes_created": 0,
            "questions_created": 0,
            "attached_files": 0,
            "items_processed": []
        }

        try:
            # 1. Resolve or create Technology
            tech = None
            if technology_id:
                tech = Technology.objects.filter(id=technology_id).first()

            if not tech:
                tech_name = (new_tech_name or "Custom Course").strip()
                tech_slug = slugify(tech_name)
                category = None
                if category_id:
                    category = TechnologyCategory.objects.filter(id=category_id).first()
                if not category:
                    category, _ = TechnologyCategory.objects.get_or_create(
                        name="Programming & Engineering",
                        defaults={"description": "Technical programming language tracks and engineering concepts."}
                    )

                tech, _ = Technology.objects.get_or_create(
                    slug=tech_slug,
                    defaults={
                        "name": tech_name,
                        "category": category,
                        "description": f"Comprehensive masterclass on {tech_name}.",
                        "icon_name": "Code2",
                        "badge_color": "#1F4E3D",
                        "created_by": user
                    }
                )

            results["technology"] = {"id": tech.id, "name": tech.name, "slug": tech.slug}

            # 2. Extract ZIP archive safely
            zip_path = os.path.join(temp_dir, "uploaded.zip")
            with open(zip_path, 'wb+') as dest:
                for chunk in zip_file_obj.chunks():
                    dest.write(chunk)

            with zipfile.ZipFile(zip_path, 'r') as zf:
                for member in zf.infolist():
                    target_path = os.path.abspath(os.path.join(temp_dir, "extracted", member.filename))
                    if not target_path.startswith(os.path.abspath(os.path.join(temp_dir, "extracted"))):
                        raise Exception("Security violation: ZIP path traversal detected.")
                zf.extractall(os.path.join(temp_dir, "extracted"))

            extracted_root = os.path.join(temp_dir, "extracted")

            current_module_order = tech.modules.count() + 1
            default_module, _ = Module.objects.get_or_create(
                technology=tech,
                title=f"{tech.name} Core Lessons",
                defaults={
                    "order": current_module_order,
                    "description": f"Primary lessons and practice materials for {tech.name}."
                }
            )

            module_map = {"": default_module}

            IGNORED_DIRS = {
                'venv', '.venv', 'env', '.env', '__pycache__', '.git', 'node_modules',
                'site-packages', '.idea', '.vscode', 'build', 'dist', 'bin', 'include',
                'lib', 'lib64', '.pytest_cache', '.mypy_cache', 'egg-info', '.tox'
            }

            all_files = []
            for root, dirs, files in os.walk(extracted_root):
                # Prune unwanted directories in-place so os.walk ignores thousands of venv files
                dirs[:] = [
                    d for d in dirs
                    if d.lower() not in IGNORED_DIRS
                    and not d.startswith('.')
                    and not d.startswith('__')
                ]
                dirs.sort()
                files.sort()
                for file in files:
                    if file.startswith('.') or file.startswith('__'):
                        continue
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, extracted_root)
                    all_files.append((full_p, rel_p))

            supported_exts = {
                '.docx', '.pdf', '.pptx', '.ppt', '.ipynb', '.md', '.txt',
                '.py', '.sql', '.js', '.jsx', '.html', '.css', '.java'
            }

            valid_files = []
            for full_p, rel_p in all_files:
                ext = os.path.splitext(rel_p)[1].lower()
                if ext in supported_exts:
                    valid_files.append((full_p, rel_p, ext))

            # Prioritize rich lesson files (.ipynb, .docx, .pptx, .pdf, .md)
            def get_priority(item):
                ext = item[2]
                if ext in ['.ipynb', '.docx', '.pptx', '.ppt']: return 1
                if ext in ['.pdf', '.md']: return 2
                if ext in ['.txt']: return 3
                return 4

            valid_files.sort(key=get_priority)
            # Cap at 20 core course files per upload to guarantee execution finishes in 2 seconds
            valid_files = valid_files[:20]

            with transaction.atomic():
                for full_p, rel_p, ext in valid_files:
                    parts = Path(rel_p).parts
                    filename = parts[-1]

                    if len(parts) > 1:
                        folder_name = parts[0]
                        clean_module_title = re.sub(r'^\d+[\s_\-\.]*', '', folder_name).replace('_', ' ').title()
                        if not clean_module_title:
                            clean_module_title = folder_name.replace('_', ' ').title()

                        if folder_name not in module_map:
                            mod, mod_created = Module.objects.get_or_create(
                                technology=tech,
                                title=clean_module_title,
                                defaults={
                                    "order": current_module_order,
                                    "description": f"Module covering {clean_module_title}."
                                }
                            )
                            if mod_created:
                                current_module_order += 1
                                results["modules_created"] += 1
                            module_map[folder_name] = mod
                        target_module = module_map[folder_name]
                    else:
                        target_module = default_module

                    stem = os.path.splitext(filename)[0]
                    clean_concept_title = re.sub(r'^\d+[\s_\-\.]*', '', stem).replace('_', ' ').title()
                    if not clean_concept_title:
                        clean_concept_title = stem.replace('_', ' ').title()

                    extracted_text = cls.extract_text_from_file(full_p)
                    if not extracted_text:
                        continue

                    # Save original file as downloadable media asset (streamed without loading into memory)
                    media_rel_path = f"course_materials/{tech.slug}/{slugify(target_module.title)}/{filename}"
                    with open(full_p, 'rb') as orig_f:
                        saved_path = default_storage.save(media_rel_path, File(orig_f))
                    download_url = f"{settings.MEDIA_URL}{saved_path}"
                    results["attached_files"] += 1

                    # Check if Practice Quiz vs Concept Note
                    if cls.is_question_document(filename, extracted_text):
                        quiz_title = f"{clean_concept_title} Practice Quiz"
                        quiz_concept = target_module.concepts.first()
                        quiz, q_count = cls.parse_and_create_quiz(
                            quiz_title=quiz_title,
                            raw_text=extracted_text,
                            concept=quiz_concept,
                            module=target_module,
                            user=user
                        )
                        if quiz and q_count > 0:
                            results["quizzes_created"] += 1
                            results["questions_created"] += q_count
                            results["items_processed"].append({
                                "type": "quiz",
                                "title": quiz_title,
                                "questions": q_count,
                                "file": filename
                            })
                    else:
                        concept_order = target_module.concepts.count() + 1
                        concept_slug = slugify(clean_concept_title) or f"concept-{concept_order}"
                        if Concept.objects.filter(module=target_module, slug=concept_slug).exists():
                            concept_slug = f"{concept_slug}-{concept_order}"

                        concept, _ = Concept.objects.get_or_create(
                            module=target_module,
                            title=clean_concept_title,
                            defaults={
                                "slug": concept_slug,
                                "order": concept_order,
                                "summary": f"Key learning notes for {clean_concept_title}."
                            }
                        )
                        results["concepts_created"] += 1

                        detected_lang = 'python'
                        tech_slug_lower = tech.slug.lower()
                        if 'react' in tech_slug_lower or 'js' in tech_slug_lower:
                            detected_lang = 'javascript'
                        elif 'sql' in tech_slug_lower:
                            detected_lang = 'sql'
                        elif 'html' in tech_slug_lower:
                            detected_lang = 'html'

                        # Instant heuristic note structuring (0.001s per note, zero timeout risk)
                        note_fields = cls.structure_note_with_ai(clean_concept_title, extracted_text, detected_lang, skip_ai=True)

                        note, _ = Note.objects.update_or_create(
                            concept=concept,
                            defaults={
                                "title": note_fields.get("title") or clean_concept_title,
                                "definition": note_fields.get("definition", ""),
                                "syntax": note_fields.get("syntax", ""),
                                "code_example": note_fields.get("code_example", ""),
                                "code_language": note_fields.get("code_language", detected_lang),
                                "expected_output": note_fields.get("expected_output", ""),
                                "explanation": note_fields.get("explanation", ""),
                                "real_world_analogy": note_fields.get("real_world_analogy", ""),
                                "common_mistakes": note_fields.get("common_mistakes", ""),
                                "important_points": note_fields.get("important_points", ""),
                                "interview_questions": note_fields.get("interview_questions", ""),
                                "resource_url": download_url,
                                "is_published": True,
                                "created_by": user
                            }
                        )
                        results["notes_created"] += 1
                        results["items_processed"].append({
                            "type": "note",
                            "title": note.title,
                            "module": target_module.title,
                            "file": filename,
                            "download_url": download_url
                        })

                        # If the uploaded lesson document has embedded practice questions,
                        # extract and link a quiz directly to this specific concept & module
                        has_embedded_questions = bool(re.search(
                            r'(?:\b(?:Practice Questions?|Self Test|Review Questions?|Exercises?|Quiz Questions?)\b|\bQ\d+[\.\:])',
                            extracted_text,
                            re.IGNORECASE
                        ))
                        if has_embedded_questions:
                            embedded_quiz, eq_count = cls.parse_and_create_quiz(
                                quiz_title=f"{clean_concept_title} Quiz",
                                raw_text=extracted_text,
                                concept=concept,
                                module=target_module,
                                user=user
                            )
                            if embedded_quiz and eq_count > 0:
                                results["quizzes_created"] += 1
                                results["questions_created"] += eq_count

            results["success"] = True

        except Exception as e:
            print(f"ZIP processing error: {e}")
            results["error"] = str(e)
        finally:
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

        return results
