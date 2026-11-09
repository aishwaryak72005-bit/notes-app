import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import CodeBlock from '../../components/notes/CodeBlock';
import Loader from '../../components/common/Loader';
import ZipUploaderModal from '../../components/trainer/ZipUploaderModal';
import {
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
  Code2,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  FileText,
  FileArchive,
} from 'lucide-react';

const ManageNotesPage = () => {
  const [searchParams] = useSearchParams();
  const initialConceptId = searchParams.get('concept_id');

  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(initialConceptId || '');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [noteForm, setNoteForm] = useState({
    id: null,
    concept: '',
    title: '',
    definition: '',
    explanation: '',
    real_world_analogy: '',
    syntax: '',
    code_example: '',
    code_language: 'python',
    expected_output: '',
    common_mistakes: '',
    important_points: '',
    interview_questions: '',
    resource_url: '',
    is_published: true,
  });


  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const techs = await contentService.getTechnologies();
        setTechnologies(techs);
        if (techs.length > 0) {
          setSelectedTech(techs[0].slug);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  useEffect(() => {
    const fetchMods = async () => {
      if (!selectedTech) return;
      try {
        const mods = await contentService.getModules(selectedTech);
        setModules(mods);
        if (mods.length > 0) {
          setSelectedModule(mods[0].id);
        } else {
          setSelectedModule('');
          setConcepts([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMods();
  }, [selectedTech]);

  useEffect(() => {
    const fetchConcs = async () => {
      if (!selectedModule) return;
      try {
        const concs = await contentService.getConcepts({ module_id: selectedModule });
        setConcepts(concs);
        if (concs.length > 0 && !initialConceptId) {
          setSelectedConcept(concs[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchConcs();
  }, [selectedModule]);

  useEffect(() => {
    const loadNote = async () => {
      if (!selectedConcept) return;
      setSuccess('');
      setError('');
      try {
        const notes = await contentService.getNotes(selectedConcept);
        if (notes.length > 0) {
          const n = notes[0];
          setNoteForm({
            id: n.id,
            concept: selectedConcept,
            title: n.title,
            definition: n.definition || '',
            explanation: n.explanation || '',
            real_world_analogy: n.real_world_analogy || '',
            syntax: n.syntax || '',
            code_example: n.code_example || '',
            code_language: n.code_language || 'python',
            expected_output: n.expected_output || '',
            common_mistakes: n.common_mistakes || '',
            important_points: n.important_points || '',
            interview_questions: n.interview_questions || '',
            resource_url: n.resource_url || '',
            is_published: n.is_published,
          });
        } else {
          const conc = concepts.find((c) => String(c.id) === String(selectedConcept));
          setNoteForm({
            id: null,
            concept: selectedConcept,
            title: conc ? `${conc.title} Concept Notes` : '',
            definition: '',
            explanation: '',
            real_world_analogy: '',
            syntax: '',
            code_example: '',
            code_language: 'python',
            expected_output: '',
            common_mistakes: '',
            important_points: '',
            interview_questions: '',
            resource_url: '',
            is_published: true,
          });
        }

      } catch (err) {
        console.error(err);
      }
    };

    loadNote();
  }, [selectedConcept]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteForm({
      ...noteForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const payload = { ...noteForm, concept: selectedConcept };
      const res = await contentService.saveNote(payload);
      setNoteForm((prev) => ({ ...prev, id: res.id }));
      setSuccess('Notes successfully saved and synchronized!');
    } catch (err) {
      console.error(err);
      setError('Failed to save notes. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Opening Notes Management Studio..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Concept Notes Editor</h1>
          <p className="text-xs text-muted mt-0.5">Author comprehensive structured notes, code snippets, and analogies.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setZipModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-2xl flex items-center space-x-1.5 shadow-md transition-all"
          >
            <FileArchive className="w-4 h-4 text-amber-200" />
            <span>📦 Upload Course ZIP</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 bg-white border border-sage/60 hover:bg-sage/20 text-forest text-xs font-semibold rounded-2xl flex items-center space-x-1.5 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'Return to Editor' : 'Preview Student View'}</span>
          </button>
        </div>
      </div>

      {/* Target Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-sage/40 shadow-card">
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
            Technology Track
          </label>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
          >
            {technologies.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
            Module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                #{m.order}: {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
            Concept
          </label>
          <select
            value={selectedConcept}
            onChange={(e) => setSelectedConcept(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
          >
            {concepts.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.order}: {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {previewMode ? (
        /* Preview Student Mode */
        <div className="bg-white rounded-3xl p-8 shadow-card border border-sage/40 space-y-6">
          <div className="pb-4 border-b border-sage/30 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sage/40 text-forest uppercase tracking-wider">
              Student View Preview
            </span>
            <span className="text-xs text-muted">Previewing live layout</span>
          </div>

          <h1 className="text-2xl font-extrabold text-charcoal">{noteForm.title}</h1>

          {noteForm.definition && (
            <div className="p-4 rounded-2xl bg-sage/20 border border-sage/60">
              <h2 className="text-xs font-bold uppercase tracking-wider text-forest mb-1">Definition</h2>
              <p className="text-sm font-medium text-charcoal leading-relaxed">{noteForm.definition}</p>
            </div>
          )}

          {noteForm.syntax && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Syntax</h2>
              <div className="p-3.5 rounded-2xl bg-lightgrey/60 border border-sage/60 font-mono text-sm text-forest-dark font-semibold">
                <code>{noteForm.syntax}</code>
              </div>
            </div>
          )}

          {noteForm.code_example && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Code Example</h2>
              <CodeBlock code={noteForm.code_example} language={noteForm.code_language} />
              {noteForm.expected_output && (
                <div className="mt-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-1">Expected Output</h3>
                  <div className="p-3.5 rounded-2xl bg-forest-deep text-sage-light font-mono text-xs border border-forest-border/40 whitespace-pre">
                    {noteForm.expected_output}
                  </div>
                </div>
              )}
            </div>
          )}

          {noteForm.explanation && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Detailed Explanation</h2>
              <div
                className="text-sm text-charcoal leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: noteForm.explanation }}
              />
            </div>
          )}

          {noteForm.real_world_analogy && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">Real-World Analogy</h2>
                <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">{noteForm.real_world_analogy}</p>
              </div>
            </div>
          )}

          {noteForm.interview_questions && (
            <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900 uppercase">
                  Interview Corner
                </span>
                <span className="text-xs font-bold text-purple-900">Top Technical Interview Questions</span>
              </div>
              <div className="text-xs sm:text-sm text-purple-950 whitespace-pre-line leading-relaxed font-sans">
                {noteForm.interview_questions}
              </div>
            </div>
          )}

          {noteForm.resource_url && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-teal-900 block">Downloadable Study Resource</span>
                <span className="text-[11px] text-teal-700">{noteForm.resource_url}</span>
              </div>
              <a
                href={noteForm.resource_url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-teal-700 text-white text-xs font-semibold rounded-xl hover:bg-teal-800 transition-colors"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      ) : (

        /* Edit Form */
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage/40 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                Note Title
              </label>
              <input
                type="text"
                required
                name="title"
                value={noteForm.title}
                onChange={handleChange}
                placeholder="e.g. Python – Variables"
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                Programming Language
              </label>
              <select
                name="code_language"
                value={noteForm.code_language}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest font-semibold"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="jsx">React (JSX)</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
              1. Simple Definition (1-2 sentences)
            </label>
            <textarea
              name="definition"
              rows="2"
              required
              value={noteForm.definition}
              onChange={handleChange}
              placeholder="A variable is a name used to store a value in memory."
              className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
              2. Syntax Template
            </label>
            <input
              type="text"
              name="syntax"
              value={noteForm.syntax}
              onChange={handleChange}
              placeholder="variable_name = value"
              className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                3. Code Example Snippet
              </label>
              <textarea
                name="code_example"
                rows="6"
                value={noteForm.code_example}
                onChange={handleChange}
                placeholder={`name = "Aishwarya"\nage = 21\nprint(name)\nprint(age)`}
                className="w-full px-3.5 py-2.5 bg-forest-dark text-sage-light border border-forest-border rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sage resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                4. Expected Execution Output
              </label>
              <textarea
                name="expected_output"
                rows="6"
                value={noteForm.expected_output}
                onChange={handleChange}
                placeholder={`Aishwarya\n21`}
                className="w-full px-3.5 py-2.5 bg-forest-deep text-sage-light border border-forest-border rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-sage resize-none"
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
              5. Detailed Explanation (Supports HTML formatting)
            </label>
            <textarea
              name="explanation"
              rows="4"
              value={noteForm.explanation}
              onChange={handleChange}
              placeholder="<p>Detailed technical explanation of memory allocation, scoping, and evaluation...</p>"
              className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
              6. Real-World Analogy
            </label>
            <textarea
              name="real_world_analogy"
              rows="2"
              value={noteForm.real_world_analogy}
              onChange={handleChange}
              placeholder="Think of a variable as a labeled storage box..."
              className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                7. Common Mistakes to Avoid
              </label>
              <textarea
                name="common_mistakes"
                rows="3"
                value={noteForm.common_mistakes}
                onChange={handleChange}
                placeholder="1. Variable names starting with digits&#10;2. Using reserved keywords"
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                8. Key Takeaways & Best Practices
              </label>
              <textarea
                name="important_points"
                rows="3"
                value={noteForm.important_points}
                onChange={handleChange}
                placeholder="• Variables in Python are dynamically typed&#10;• Use snake_case naming style"
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
              ></textarea>
            </div>
          </div>

          {/* 9. Interview Corner & 10. Resource URL */}
          <div className="space-y-4 pt-2 border-t border-sage/30">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase">
                  Interview Corner
                </span>
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  9. Top Technical Interview Questions & Model Answers
                </label>
              </div>
              <textarea
                name="interview_questions"
                rows="4"
                value={noteForm.interview_questions}
                onChange={handleChange}
                placeholder={`Q1: What is the difference between mutable and immutable types in Python?\nA1: Mutable objects (like lists, dicts) can be modified in place, whereas immutable objects (like ints, strings, tuples) cannot be altered after creation.`}
                className="w-full px-3.5 py-2.5 bg-purple-50/40 border border-purple-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                10. Downloadable Resource / Cheat Sheet / Jupyter Notebook Link (.ipynb / .pdf)
              </label>
              <input
                type="text"
                name="resource_url"
                value={noteForm.resource_url}
                onChange={handleChange}
                placeholder="https://example.com/materials/python_basics.ipynb or /static/downloads/cheatsheet.pdf"
                className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-sage/30">

            <label className="flex items-center space-x-2 text-xs font-semibold text-charcoal cursor-pointer">
              <input
                type="checkbox"
                name="is_published"
                checked={noteForm.is_published}
                onChange={handleChange}
                className="rounded text-forest focus:ring-forest"
              />
              <span>Published & Accessible by Students</span>
            </label>

            <button
              type="submit"
              disabled={saving || !selectedConcept}
              className="px-6 py-2.5 bg-forest hover:bg-forest-dark text-ivory rounded-xl text-xs font-semibold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Notes...' : 'Save & Publish Notes'}</span>
            </button>
          </div>
        </form>
      )}
      {/* 1-Click ZIP Course Upload Modal */}
      <ZipUploaderModal
        isOpen={zipModalOpen}
        onClose={() => setZipModalOpen(false)}
        onSuccess={() => {
          if (selectedTech) {
            contentService.getModules(selectedTech).then(setModules);
          }
        }}
        technologies={technologies}
      />
    </div>
  );
};

export default ManageNotesPage;
