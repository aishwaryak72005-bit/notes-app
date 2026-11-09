import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from content.models import TechnologyCategory, Technology, Module, Concept, Note
from quizzes.models import Quiz, Question, AnswerOption, QuizAttempt, StudentAnswer
from progress.models import StudentProgress, Bookmark
from django.utils import timezone

User = get_user_model()

def seed():
    print("[INFO] Starting TechNotes Database Seeding...")

    # 1. Create Users
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@technotes.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'role': User.ROLE_ADMIN,
            'is_staff': True,
            'is_superuser': True,
            'is_approved_teacher': True,
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()

    teacher_user, _ = User.objects.get_or_create(
        username='teacher_sarah',
        defaults={
            'email': 'sarah@technotes.com',
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'role': User.ROLE_TEACHER,
            'is_staff': False,
            'is_approved_teacher': True,
            'bio': 'Senior Software Architect and Technical Educator specializing in Python, React, and Machine Learning.'
        }
    )
    teacher_user.set_password('teacher123')
    teacher_user.save()

    student_user, _ = User.objects.get_or_create(
        username='learner_aishu',
        defaults={
            'email': 'aishwarya@student.technotes.com',
            'first_name': 'Aishwarya',
            'last_name': 'Sharma',
            'role': User.ROLE_STUDENT,
            'bio': 'Aspiring Full-Stack Software Developer passionate about Python, modern web technologies and AI.'
        }
    )
    student_user.set_password('student123')
    student_user.save()
    print("[OK] Created Users (admin, teacher_sarah, learner_aishu)")

    # 2. Categories
    categories_data = [
        {'name': 'Programming', 'slug': 'programming', 'order': 1, 'icon': 'code', 'desc': 'Core programming languages & foundations'},
        {'name': 'Frontend', 'slug': 'frontend', 'order': 2, 'icon': 'layout', 'desc': 'Modern web client technologies & frameworks'},
        {'name': 'Backend', 'slug': 'backend', 'order': 3, 'icon': 'server', 'desc': 'Server-side architectures, APIs & microservices'},
        {'name': 'Database', 'slug': 'database', 'order': 4, 'icon': 'database', 'desc': 'Relational & NoSQL data storage engines'},
        {'name': 'Advanced Technologies', 'slug': 'advanced-technologies', 'order': 5, 'icon': 'cpu', 'desc': 'Artificial Intelligence, Machine Learning & LLMs'},
    ]

    cat_map = {}
    for c in categories_data:
        cat, _ = TechnologyCategory.objects.get_or_create(
            name=c['name'],
            defaults={'slug': c['slug'], 'order': c['order'], 'icon': c['icon'], 'description': c['desc']}
        )
        cat_map[c['name']] = cat

    print("[OK] Created Categories")

    # 3. Technologies
    technologies_data = [
        # Programming
        {'name': 'Python', 'cat': 'Programming', 'slug': 'python', 'badge': '#3776AB', 'popular': True, 'icon': 'terminal', 'desc': 'High-level, versatile programming language renowned for clean syntax, data science, and web development.'},
        {'name': 'JavaScript', 'cat': 'Programming', 'slug': 'javascript', 'badge': '#F7DF1E', 'popular': True, 'icon': 'file-code', 'desc': 'The ubiquitous programming language of the web, powering frontend interactives and backend Node.js runtimes.'},
        {'name': 'Java', 'cat': 'Programming', 'slug': 'java', 'badge': '#ED8B00', 'popular': False, 'icon': 'coffee', 'desc': 'Robust, object-oriented enterprise language known for "write once, run anywhere" JVM reliability.'},

        # Frontend
        {'name': 'React', 'cat': 'Frontend', 'slug': 'react', 'badge': '#61DAFB', 'popular': True, 'icon': 'atom', 'desc': 'Declarative, component-driven JavaScript library for building scalable interactive user interfaces.'},
        {'name': 'Angular', 'cat': 'Frontend', 'slug': 'angular', 'badge': '#DD0031', 'popular': False, 'icon': 'shield', 'desc': 'Full-fledged TypeScript enterprise framework with dependency injection and two-way binding.'},
        {'name': 'HTML', 'cat': 'Frontend', 'slug': 'html', 'badge': '#E34F26', 'popular': False, 'icon': 'code', 'desc': 'Standard markup language structure for building web documents.'},
        {'name': 'CSS', 'cat': 'Frontend', 'slug': 'css', 'badge': '#1572B6', 'popular': False, 'icon': 'palette', 'desc': 'Cascading Style Sheets for presentation, layouts, Flexbox, Grid, and responsive styling.'},

        # Backend
        {'name': 'Django', 'cat': 'Backend', 'slug': 'django', 'badge': '#092E20', 'popular': True, 'icon': 'server', 'desc': 'The web framework for perfectionists with deadlines. Batteries-included Python framework.'},
        {'name': 'Node.js', 'cat': 'Backend', 'slug': 'node-js', 'badge': '#339933', 'popular': True, 'icon': 'cpu', 'desc': 'V8 JavaScript runtime built for fast, scalable event-driven network applications.'},

        # Database
        {'name': 'SQL', 'cat': 'Database', 'slug': 'sql', 'badge': '#00758F', 'popular': True, 'icon': 'database', 'desc': 'Structured Query Language standard for defining, querying, and updating relational databases.'},
        {'name': 'MySQL', 'cat': 'Database', 'slug': 'mysql', 'badge': '#4479A1', 'popular': True, 'icon': 'database', 'desc': 'The world’s most popular open-source relational database management system.'},
        {'name': 'PostgreSQL', 'cat': 'Database', 'slug': 'postgresql', 'badge': '#336791', 'popular': False, 'icon': 'database', 'desc': 'Advanced open-source object-relational database emphasizing extensibility and SQL compliance.'},

        # Advanced
        {'name': 'Machine Learning', 'cat': 'Advanced Technologies', 'slug': 'machine-learning', 'badge': '#8E44AD', 'popular': True, 'icon': 'brain', 'desc': 'Supervised, unsupervised algorithms and predictive modeling systems.'},
        {'name': 'Deep Learning', 'cat': 'Advanced Technologies', 'slug': 'deep-learning', 'badge': '#9B59B6', 'popular': False, 'icon': 'network', 'desc': 'Multi-layered neural networks, convolutional networks, and backpropagation.'},
        {'name': 'NLP', 'cat': 'Advanced Technologies', 'slug': 'nlp', 'badge': '#2980B9', 'popular': False, 'icon': 'message-square', 'desc': 'Natural Language Processing techniques for text parsing, tokenization, and transformers.'},
        {'name': 'LLM', 'cat': 'Advanced Technologies', 'slug': 'llm', 'badge': '#6C3483', 'popular': True, 'icon': 'sparkles', 'desc': 'Large Language Models, prompt engineering, RAG pipelines, fine-tuning and agent workflows.'},
    ]

    tech_map = {}
    for t in technologies_data:
        tech, _ = Technology.objects.get_or_create(
            name=t['name'],
            defaults={
                'category': cat_map[t['cat']],
                'slug': t['slug'],
                'badge_color': t['badge'],
                'is_popular': t['popular'],
                'icon_name': t['icon'],
                'description': t['desc'],
                'created_by': teacher_user
            }
        )
        tech_map[t['name']] = tech

    print("[OK] Created Technologies (16 Technologies across 5 Categories)")

    # 4. Modules & Concepts for Python (matching user specification)
    python_modules_data = [
        {
            'title': 'Python Basics',
            'order': 1,
            'desc': 'Core fundamental concepts of Python syntax, variables, data types, and operators.',
            'concepts': [
                {'title': 'Introduction', 'order': 1, 'level': 'beginner', 'min': 8, 'summary': 'What is Python, key features, and environment setup.'},
                {'title': 'Variables', 'order': 2, 'level': 'beginner', 'min': 10, 'summary': 'Memory reference names, naming rules, and dynamic typing.'},
                {'title': 'Data Types', 'order': 3, 'level': 'beginner', 'min': 15, 'summary': 'Integers, Floats, Strings, Booleans, and NoneType.'},
                {'title': 'Operators', 'order': 4, 'level': 'beginner', 'min': 12, 'summary': 'Arithmetic, relational, logical, assignment, and membership operators.'},
                {'title': 'Input and Output', 'order': 5, 'level': 'beginner', 'min': 10, 'summary': 'Reading user input with input() and formatted printing with f-strings.'},
                {'title': 'Type Conversion', 'order': 6, 'level': 'beginner', 'min': 10, 'summary': 'Implicit vs Explicit type casting in Python.'},
            ]
        },
        {
            'title': 'Data Structures',
            'order': 2,
            'desc': 'Built-in container collections: Lists, Tuples, Sets, and Dictionaries.',
            'concepts': [
                {'title': 'Lists & Operations', 'order': 1, 'level': 'beginner', 'min': 15, 'summary': 'Mutable ordered sequences, slicing, and list methods.'},
                {'title': 'Tuples', 'order': 2, 'level': 'beginner', 'min': 10, 'summary': 'Immutable sequences and tuple unpacking.'},
                {'title': 'Dictionaries', 'order': 3, 'level': 'intermediate', 'min': 15, 'summary': 'Key-value associative mappings and dictionary comprehensions.'},
                {'title': 'Sets & Set Operations', 'order': 4, 'level': 'intermediate', 'min': 12, 'summary': 'Unique collections, unions, intersections, and set math.'},
            ]
        },
        {
            'title': 'Control Statements',
            'order': 3,
            'desc': 'Conditional branching and looping constructs.',
            'concepts': [
                {'title': 'If-Else Conditionals', 'order': 1, 'level': 'beginner', 'min': 10, 'summary': 'Decision making using if, elif, and else.'},
                {'title': 'For Loops & Range', 'order': 2, 'level': 'beginner', 'min': 12, 'summary': 'Iterating through sequences and generator ranges.'},
                {'title': 'While Loops', 'order': 3, 'level': 'beginner', 'min': 10, 'summary': 'Condition-based repetition and preventing infinite loops.'},
                {'title': 'Break, Continue & Pass', 'order': 4, 'level': 'beginner', 'min': 8, 'summary': 'Loop control jump statements.'},
            ]
        },
        {
            'title': 'Functions',
            'order': 4,
            'desc': 'Reusable code blocks, parameter passing, and lambda expressions.',
            'concepts': [
                {'title': 'Defining Functions', 'order': 1, 'level': 'beginner', 'min': 12, 'summary': 'def syntax, return statements, and docstrings.'},
                {'title': 'Arguments & *args **kwargs', 'order': 2, 'level': 'intermediate', 'min': 15, 'summary': 'Positional, keyword, default, and variable-length arguments.'},
                {'title': 'Lambda Functions', 'order': 3, 'level': 'intermediate', 'min': 10, 'summary': 'Anonymous single-line functions.'},
                {'title': 'Scope & Closures', 'order': 4, 'level': 'advanced', 'min': 18, 'summary': 'LEGB rule, global and nonlocal variables.'},
            ]
        },
        {
            'title': 'Object-Oriented Programming',
            'order': 5,
            'desc': 'Classes, objects, inheritance, encapsulation, and polymorphism.',
            'concepts': [
                {'title': 'Classes and Objects', 'order': 1, 'level': 'intermediate', 'min': 15, 'summary': 'Creating classes, instantiating objects, and the self parameter.'},
                {'title': 'Constructors (__init__)', 'order': 2, 'level': 'intermediate', 'min': 12, 'summary': 'Instance initialization and attributes.'},
                {'title': 'Inheritance', 'order': 3, 'level': 'intermediate', 'min': 15, 'summary': 'Single, multiple, and multi-level class inheritance with super().'},
                {'title': 'Encapsulation & Polymorphism', 'order': 4, 'level': 'advanced', 'min': 15, 'summary': 'Private attributes, getters/setters, and method overriding.'},
            ]
        },
        {
            'title': 'File Handling',
            'order': 6,
            'desc': 'Reading and writing files on disk safely.',
            'concepts': [
                {'title': 'Reading & Writing Files', 'order': 1, 'level': 'intermediate', 'min': 12, 'summary': 'open(), read(), write(), and append modes.'},
                {'title': 'Context Managers (with)', 'order': 2, 'level': 'intermediate', 'min': 10, 'summary': 'Automatic file closure and resource safety.'},
            ]
        },
        {
            'title': 'Exception Handling',
            'order': 7,
            'desc': 'Handling runtime errors gracefully.',
            'concepts': [
                {'title': 'Try-Except Blocks', 'order': 1, 'level': 'beginner', 'min': 12, 'summary': 'Catching errors and preventing program crashes.'},
                {'title': 'Finally & Custom Exceptions', 'order': 2, 'level': 'intermediate', 'min': 12, 'summary': 'Clean-up actions and raising user-defined exceptions.'},
            ]
        },
        {
            'title': 'Advanced Python',
            'order': 8,
            'desc': 'Decorators, generators, and iterators.',
            'concepts': [
                {'title': 'Decorators', 'order': 1, 'level': 'advanced', 'min': 20, 'summary': 'Higher-order functions modifying function behaviors.'},
                {'title': 'Generators & Yield', 'order': 2, 'level': 'advanced', 'min': 15, 'summary': 'Memory-efficient lazy stream evaluation.'},
            ]
        }
    ]

    python_tech = tech_map['Python']
    concept_map = {}

    for m_data in python_modules_data:
        mod, _ = Module.objects.get_or_create(
            technology=python_tech,
            title=m_data['title'],
            defaults={
                'order': m_data['order'],
                'description': m_data['desc'],
                'created_by': teacher_user
            }
        )
        for c_data in m_data['concepts']:
            conc, _ = Concept.objects.get_or_create(
                module=mod,
                title=c_data['title'],
                defaults={
                    'order': c_data['order'],
                    'difficulty_level': c_data['level'],
                    'estimated_minutes': c_data['min'],
                    'summary': c_data['summary']
                }
            )
            concept_map[f"{m_data['title']}_{c_data['title']}"] = conc

    print(f"[OK] Created 8 Python Modules with {len(concept_map)} Concepts")

    # 5. Populate Modules & Concepts for other technologies (Django, React, SQL, Machine Learning)
    # Django
    django_tech = tech_map['Django']
    dj_mod, _ = Module.objects.get_or_create(technology=django_tech, title='Django Architecture', defaults={'order': 1, 'description': 'MVT pattern, settings, and routing', 'created_by': teacher_user})
    Concept.objects.get_or_create(module=dj_mod, title='MVT Pattern', defaults={'order': 1, 'difficulty_level': 'intermediate', 'estimated_minutes': 15, 'summary': 'Model-View-Template architectural pattern.'})
    Concept.objects.get_or_create(module=dj_mod, title='Django ORM', defaults={'order': 2, 'difficulty_level': 'intermediate', 'estimated_minutes': 20, 'summary': 'QuerySets, migrations, and relationship lookups.'})

    # React
    react_tech = tech_map['React']
    react_mod, _ = Module.objects.get_or_create(technology=react_tech, title='React Fundamentals', defaults={'order': 1, 'description': 'JSX, Components, and Hooks', 'created_by': teacher_user})
    Concept.objects.get_or_create(module=react_mod, title='Components & Props', defaults={'order': 1, 'difficulty_level': 'beginner', 'estimated_minutes': 12, 'summary': 'Building functional UI blocks.'})
    Concept.objects.get_or_create(module=react_mod, title='useState Hook', defaults={'order': 2, 'difficulty_level': 'beginner', 'estimated_minutes': 15, 'summary': 'Stateful logic in functional components.'})

    # SQL
    sql_tech = tech_map['SQL']
    sql_mod, _ = Module.objects.get_or_create(technology=sql_tech, title='SQL Queries', defaults={'order': 1, 'description': 'DML, DDL, and aggregate functions', 'created_by': teacher_user})
    Concept.objects.get_or_create(module=sql_mod, title='SELECT and WHERE', defaults={'order': 1, 'difficulty_level': 'beginner', 'estimated_minutes': 10, 'summary': 'Filtering rows and selecting specific columns.'})
    Concept.objects.get_or_create(module=sql_mod, title='JOIN Operations', defaults={'order': 2, 'difficulty_level': 'intermediate', 'estimated_minutes': 18, 'summary': 'INNER, LEFT, RIGHT, and FULL joins.'})

    # Machine Learning
    ml_tech = tech_map['Machine Learning']
    ml_mod, _ = Module.objects.get_or_create(technology=ml_tech, title='Supervised Learning', defaults={'order': 1, 'description': 'Regression and Classification models', 'created_by': teacher_user})
    Concept.objects.get_or_create(module=ml_mod, title='Linear Regression', defaults={'order': 1, 'difficulty_level': 'intermediate', 'estimated_minutes': 20, 'summary': 'Cost function, gradient descent, and slope prediction.'})

    # 6. Detailed Rich Note for "Python - Variables" (Exact Match to User Reference Screenshot)
    var_concept = concept_map.get('Python Basics_Variables')
    if var_concept:
        note_title = "Python – Variables"
        note_def = "A variable is a name used to store a value in memory."
        note_exp = """<p>In Python, variables are created the moment you first assign a value to them. Python has no command for declaring a variable with an explicit type; it is dynamically typed.</p>
<p>Behind the scenes, Python allocates memory for the value object (for instance, the string <code>"Aishwarya"</code> or the integer <code>21</code>) and binds the variable name as an active reference tag pointing to that memory address.</p>
<p>If you reassign a variable to another value or even another data type, Python simply updates the reference to point to the new object in heap memory.</p>"""
        
        note_analogy = "Think of a variable like a sticky label placed on a container. The container holds the actual content (such as fruit, juice, or books). When you write 'Aishwarya' or '21' on the label, you can easily access or change what the label points to at any time."
        note_syntax = "variable_name = value"
        note_code = """name = "Aishwarya"
age = 21
print(name)   # Output: Aishwarya
print(age)    # Output: 21"""
        note_output = """Aishwarya
21"""
        note_mistakes = """1. Starting variable names with numbers (e.g. 1name = 'John' will cause SyntaxError).
2. Using Python reserved keywords (like class, def, return, for, if).
3. Using hyphens instead of underscores (my-var is treated as subtraction).
4. Expecting variables to maintain previous types without casting."""
        
        note_points = """• Python variable names are case-sensitive (Age and age are distinct).
• Variable names must start with a letter (a-z, A-Z) or an underscore (_).
• Variables can be reassigned to different data types anytime (Dynamic typing).
• Python uses snake_case convention for variable naming (e.g., student_id, total_marks)."""

        Note.objects.update_or_create(
            concept=var_concept,
            defaults={
                'title': note_title,
                'definition': note_def,
                'explanation': note_exp,
                'real_world_analogy': note_analogy,
                'syntax': note_syntax,
                'code_example': note_code,
                'code_language': 'python',
                'expected_output': note_output,
                'common_mistakes': note_mistakes,
                'important_points': note_points,
                'is_published': True,
                'created_by': teacher_user
            }
        )
        print("[OK] Created Rich Note for 'Python - Variables'")

    # Also add note for Python Introduction
    intro_concept = concept_map.get('Python Basics_Introduction')
    if intro_concept:
        Note.objects.update_or_create(
            concept=intro_concept,
            defaults={
                'title': 'Python – Introduction',
                'definition': 'Python is an interpreted, high-level, dynamically-typed programming language emphasizing code readability.',
                'explanation': '<p>Created by Guido van Rossum and released in 1991, Python emphasizes clean syntax and developer productivity. It is widely used in Web Development, Machine Learning, Data Science, and Automation.</p>',
                'real_world_analogy': 'Python is like modern English among programming languages: it avoids cryptic symbols and reads almost like plain pseudocode sentences.',
                'syntax': 'print("Hello, TechNotes!")',
                'code_example': 'print("Welcome to TechNotes Platform!")',
                'code_language': 'python',
                'expected_output': 'Welcome to TechNotes Platform!',
                'common_mistakes': 'Indentation errors: Python uses whitespace/indentation instead of curly brackets { } to denote blocks of code.',
                'important_points': '• Python is cross-platform (runs on Windows, Mac, Linux).\n• Huge standard library and package ecosystem (PyPI).\n• Interpreted language: executes code line by line.',
                'is_published': True,
                'created_by': teacher_user
            }
        )
        print("[OK] Created Rich Note for 'Python - Introduction'")

    # 7. Interactive Concept Quiz for "Python - Variables" (Matching User Screenshot)
    if var_concept:
        quiz, _ = Quiz.objects.get_or_create(
            concept=var_concept,
            defaults={
                'title': 'Variables & Memory Reference Quiz',
                'description': 'Test your comprehension of variable assignment, reference model, and naming rules.',
                'time_limit_minutes': 5,
                'passing_score_percentage': 70,
                'difficulty_level': 'beginner',
                'is_published': True,
                'created_by': teacher_user
            }
        )

        # Question 1 (From reference screenshot):
        q1, _ = Question.objects.get_or_create(
            quiz=quiz,
            order=1,
            defaults={
                'question_type': Question.TYPE_MCQ,
                'question_text': 'What is a variable in Python?',
                'explanation': 'A variable is a name that refers to a value in memory.',
                'points': 1,
            }
        )
        AnswerOption.objects.get_or_create(question=q1, order=1, defaults={'option_text': 'A function', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=q1, order=2, defaults={'option_text': 'A named reference used to store a value', 'is_correct': True})
        AnswerOption.objects.get_or_create(question=q1, order=3, defaults={'option_text': 'A loop', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=q1, order=4, defaults={'option_text': 'A Python module', 'is_correct': False})

        # Question 2 (Predict the output):
        q2, _ = Question.objects.get_or_create(
            quiz=quiz,
            order=2,
            defaults={
                'question_type': Question.TYPE_PREDICT_OUTPUT,
                'question_text': 'Predict the output of the following code snippet:',
                'code_snippet': """x = 15\ny = x\nx = 30\nprint(y)""",
                'explanation': 'When y = x is run, y references the integer object 15. When x is later updated to 30, y remains referencing 15 because integers in Python are immutable.',
                'points': 1,
            }
        )
        AnswerOption.objects.get_or_create(question=q2, order=1, defaults={'option_text': '15', 'is_correct': True})
        AnswerOption.objects.get_or_create(question=q2, order=2, defaults={'option_text': '30', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=q2, order=3, defaults={'option_text': 'None', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=q2, order=4, defaults={'option_text': 'SyntaxError', 'is_correct': False})

        # Question 3 (Find the error):
        q3, _ = Question.objects.get_or_create(
            quiz=quiz,
            order=3,
            defaults={
                'question_type': Question.TYPE_FIND_ERROR,
                'question_text': 'Which of the following lines will raise a SyntaxError in Python?',
                'code_snippet': """Option A: user_score = 95\nOption B: _total = 100\nOption C: 2nd_user = 'Aishwarya'\nOption D: userTwo = 'Sarah'""",
                'explanation': 'Variable names cannot begin with numeric digits (0-9). Line Option C raises a SyntaxError: invalid decimal literal.',
                'points': 1,
            }
        )
        AnswerOption.objects.get_or_create(question=q3, order=1, defaults={'option_text': 'user_score = 95', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=q3, order=2, defaults={'option_text': '_total = 100', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=q3, order=3, defaults={'option_text': "2nd_user = 'Aishwarya'", 'is_correct': True})
        AnswerOption.objects.get_or_create(question=q3, order=4, defaults={'option_text': "userTwo = 'Sarah'", 'is_correct': False})

        # Question 4 (True/False):
        q4, _ = Question.objects.get_or_create(
            quiz=quiz,
            order=4,
            defaults={
                'question_type': Question.TYPE_TRUE_FALSE,
                'question_text': 'In Python, variables must be explicitly declared with their data type (e.g., int x = 5) before assigning a value.',
                'explanation': 'False. Python is dynamically typed. The interpreter automatically detects and manages the type based on the value assigned.',
                'points': 1,
            }
        )
        AnswerOption.objects.get_or_create(question=q4, order=1, defaults={'option_text': 'True', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=q4, order=2, defaults={'option_text': 'False', 'is_correct': True})

        print("[OK] Created Interactive Quiz with 4 Questions for 'Python - Variables'")

        # 8. Create Student Progress & Bookmark for student_user
        # Mark Introduction as completed, Variables as in-progress
        if intro_concept:
            StudentProgress.objects.update_or_create(
                student=student_user,
                concept=intro_concept,
                defaults={'is_completed': True, 'completed_at': timezone.now()}
            )
        StudentProgress.objects.update_or_create(
            student=student_user,
            concept=var_concept,
            defaults={'is_completed': False, 'last_accessed_at': timezone.now()}
        )

        # Bookmark Variables concept
        Bookmark.objects.get_or_create(student=student_user, concept=var_concept)

        # Create a sample completed QuizAttempt for student_user (score 78% matching mockup!)
        attempt, _ = QuizAttempt.objects.get_or_create(
            student=student_user,
            quiz=quiz,
            defaults={
                'score_percentage': 78.0,
                'total_questions': 4,
                'correct_answers': 3,
                'incorrect_answers': 1,
                'passed': True,
                'time_taken_seconds': 142,
            }
        )
        print("[OK] Created Sample Student Progress, Bookmark, and Quiz Attempt (78% score)")

    try:
        from seed_all_technologies import seed_all_curriculums
        seed_all_curriculums()
    except Exception as e:
        print(f"[WARN] Failed to seed extra curriculums: {e}")

    print("[SUCCESS] TechNotes Database Seeding Completed Successfully!")

if __name__ == '__main__':
    seed()
