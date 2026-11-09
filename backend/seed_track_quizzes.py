import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from content.models import Concept
from quizzes.models import Quiz, Question, AnswerOption
from django.contrib.auth import get_user_model

User = get_user_model()
admin_user = User.objects.filter(is_superuser=True).first() or User.objects.first()

QUIZ_DATA = {
    # JavaScript
    'let, const, and Scope': {
        'title': 'JavaScript Variables & Scope Assessment',
        'questions': [
            {
                'text': 'What happens if you try to reassign a variable declared with `const` in JavaScript?',
                'options': [
                    ('TypeError: Assignment to constant variable', True),
                    ('SyntaxError: Invalid syntax', False),
                    ('The variable silently updates', False),
                    ('undefined', False),
                ],
                'explanation': 'Variables declared with const are read-only references; reassigning them throws a TypeError.'
            },
            {
                'text': 'What is the scope of variables declared with `let`?',
                'options': [
                    ('Block scope', True),
                    ('Function scope only', False),
                    ('Global scope only', False),
                    ('Module scope only', False),
                ],
                'explanation': 'let is block-scoped, meaning it is only accessible within the nearest enclosing { } brackets.'
            },
            {
                'text': 'What does `console.log(typeof NaN)` output in modern JavaScript?',
                'options': [
                    ('"number"', True),
                    ('"NaN"', False),
                    ('"undefined"', False),
                    ('"object"', False),
                ],
                'explanation': 'In JavaScript, NaN (Not-a-Number) is formally classified as a numeric type ("number").'
            }
        ]
    },
    'Async / Await and Promises': {
        'title': 'JavaScript Promises & Async/Await Quiz',
        'questions': [
            {
                'text': 'What does an `async` function always return in JavaScript?',
                'options': [
                    ('A Promise', True),
                    ('The raw resolved value', False),
                    ('A Generator object', False),
                    ('An Observable', False),
                ],
                'explanation': 'An async function always wraps its return value in a resolved Promise.'
            },
            {
                'text': 'What happens if a Promise rejects and there is no `.catch()` or `try/catch` block?',
                'options': [
                    ('An UnhandledPromiseRejection warning/error is thrown', True),
                    ('The script silently continues without any log', False),
                    ('The browser restarts the script', False),
                    ('The promise returns null', False),
                ],
                'explanation': 'Uncaught rejections trigger UnhandledPromiseRejection, which can crash Node.js processes.'
            },
            {
                'text': 'Which Promise method resolves as soon as ANY one promise in an array resolves?',
                'options': [
                    ('Promise.any()', True),
                    ('Promise.all()', False),
                    ('Promise.allSettled()', False),
                    ('Promise.race()', False),
                ],
                'explanation': 'Promise.any() resolves with the first fulfilled promise, ignoring rejections unless all reject.'
            }
        ]
    },

    # Python
    'Lists & Operations': {
        'title': 'Python Lists & Methods Quiz',
        'questions': [
            {
                'text': 'What is the time complexity of appending an element to the end of a Python list using `.append()`?',
                'options': [
                    ('O(1) amortized', True),
                    ('O(n)', False),
                    ('O(log n)', False),
                    ('O(n^2)', False),
                ],
                'explanation': 'Python lists are dynamic arrays, so .append() is an O(1) amortized operation.'
            },
            {
                'text': 'Predict the output: `x = [1, 2, 3]; y = x; y.append(4); print(len(x))`',
                'options': [
                    ('4', True),
                    ('3', False),
                    ('Error: y is not defined', False),
                    ('0', False),
                ],
                'explanation': 'x and y reference the exact same list object in memory, so mutating y mutates x.'
            },
            {
                'text': 'Which slicing expression reverses a Python list `nums` without mutating the original list?',
                'options': [
                    ('nums[::-1]', True),
                    ('nums.reverse()', False),
                    ('nums[-1:]', False),
                    ('nums[::0]', False),
                ],
                'explanation': 'nums[::-1] returns a newly allocated reversed shallow copy of nums.'
            }
        ]
    },
    'Tuples': {
        'title': 'Python Tuples & Immutability Quiz',
        'questions': [
            {
                'text': 'Which syntax correctly creates a single-element tuple in Python?',
                'options': [
                    ('(42,)', True),
                    ('(42)', False),
                    ('tuple(42)', False),
                    ('[42]', False),
                ],
                'explanation': 'A trailing comma (42,) is required to distinguish a single-item tuple from parenthesized arithmetic.'
            },
            {
                'text': 'Can a tuple be used as a key in a Python dictionary?',
                'options': [
                    ('Yes, as long as all elements inside the tuple are hashable/immutable', True),
                    ('No, only strings can be dictionary keys', False),
                    ('Yes, even if the tuple contains lists', False),
                    ('Never, tuples cannot be hashed', False),
                ],
                'explanation': 'Tuples are hashable provided every element within them is also hashable.'
            }
        ]
    },
    'Dictionaries': {
        'title': 'Python Dictionaries & Hash Maps Quiz',
        'questions': [
            {
                'text': 'What happens when accessing a non-existent key using `.get(key, default)`?',
                'options': [
                    ('It returns the default value without raising a KeyError', True),
                    ('It raises a KeyError', False),
                    ('It crashes the program', False),
                    ('It automatically creates the key with value None', False),
                ],
                'explanation': '.get() safely retrieves a value or returns the default value (None by default) instead of throwing KeyError.'
            },
            {
                'text': 'Starting from Python 3.7+, are dictionary insertion orders guaranteed to be preserved?',
                'options': [
                    ('Yes, insertion order is guaranteed by the language specification', True),
                    ('No, dictionaries are always completely unordered', False),
                    ('Only if you use collections.OrderedDict', False),
                    ('Only on 64-bit operating systems', False),
                ],
                'explanation': 'Python 3.7+ officially guarantees insertion order preservation in standard dicts.'
            }
        ]
    },
    'Sets & Set Operations': {
        'title': 'Python Sets & Membership Testing Quiz',
        'questions': [
            {
                'text': 'What is the average time complexity of checking membership (`x in my_set`) in a Python set?',
                'options': [
                    ('O(1)', True),
                    ('O(n)', False),
                    ('O(log n)', False),
                    ('O(n log n)', False),
                ],
                'explanation': 'Sets are implemented using hash tables, giving average O(1) membership lookup.'
            },
            {
                'text': 'What does `set([1, 2, 2, 3, 3, 3])` return?',
                'options': [
                    ('{1, 2, 3}', True),
                    ('[1, 2, 3]', False),
                    ('(1, 2, 3)', False),
                    ('{1, 2, 2, 3, 3, 3}', False),
                ],
                'explanation': 'Sets automatically discard duplicate elements and only store unique values.'
            }
        ]
    },
    'For Loops & Range': {
        'title': 'Python Loops & Iteration Quiz',
        'questions': [
            {
                'text': 'What numbers does `range(2, 8, 2)` generate in Python?',
                'options': [
                    ('2, 4, 6', True),
                    ('2, 4, 6, 8', False),
                    ('2, 3, 4, 5, 6, 7', False),
                    ('0, 2, 4, 6', False),
                ],
                'explanation': 'range(start, stop, step) is exclusive of the stop value (8), producing 2, 4, 6.'
            },
            {
                'text': 'When does the `else` block of a Python `for` loop execute?',
                'options': [
                    ('When the loop completes naturally without encountering a break statement', True),
                    ('Whenever the loop condition is false initially', False),
                    ('Whenever an exception occurs in the loop', False),
                    ('After a break statement is hit', False),
                ],
                'explanation': 'The else clause of a for loop executes only if the loop finishes without hitting a break.'
            }
        ]
    },
    'Defining Functions': {
        'title': 'Python Functions & Scope Assessment',
        'questions': [
            {
                'text': 'What is the default return value of a Python function that does not contain a `return` statement?',
                'options': [
                    ('None', True),
                    ('0', False),
                    ('False', False),
                    ('undefined', False),
                ],
                'explanation': 'In Python, functions without an explicit return statement implicitly return None.'
            },
            {
                'text': 'Why should you avoid using a mutable object (like `def func(items=[])`) as a default argument?',
                'options': [
                    ('The default list is created once at definition time and shared across all subsequent calls', True),
                    ('It causes a SyntaxError', False),
                    ('Python will freeze the list and make it read-only', False),
                    ('It will delete the list after the first call', False),
                ],
                'explanation': 'Default parameter values are evaluated once when the function is defined, causing mutable defaults to persist state.'
            }
        ]
    },
    'Classes and Objects': {
        'title': 'Python OOP & Classes Quiz',
        'questions': [
            {
                'text': 'What is the explicit first parameter of all regular instance methods in Python classes?',
                'options': [
                    ('self', True),
                    ('this', False),
                    ('cls', False),
                    ('instance', False),
                ],
                'explanation': 'Python requires the first parameter of instance methods to explicitly refer to the instance (conventionally named self).'
            },
            {
                'text': 'Which method serves as the constructor to initialize new objects in Python?',
                'options': [
                    ('__init__', True),
                    ('__new__', False),
                    ('constructor', False),
                    ('__construct__', False),
                ],
                'explanation': '__init__ initializes instance attributes after the object is allocated.'
            }
        ]
    },
    'Try-Except Blocks': {
        'title': 'Python Exception Handling Quiz',
        'questions': [
            {
                'text': 'Which block in a try-except structure ALWAYS executes, regardless of whether an error was raised?',
                'options': [
                    ('finally', True),
                    ('else', False),
                    ('catch', False),
                    ('except', False),
                ],
                'explanation': 'The finally block is guaranteed to run for resource cleanup (e.g. closing files or sockets).'
            },
            {
                'text': 'Which keyword is used to manually trigger or raise an exception in Python?',
                'options': [
                    ('raise', True),
                    ('throw', False),
                    ('except', False),
                    ('trigger', False),
                ],
                'explanation': 'In Python, the `raise` keyword raises exceptions (unlike JavaScript or Java which use `throw`).'
            }
        ]
    },

    # React
    'Components & Props': {
        'title': 'React Components & Props Mastery Quiz',
        'questions': [
            {
                'text': 'Are React props mutable inside the child component that receives them?',
                'options': [
                    ('No, props are strictly read-only (pure functions)', True),
                    ('Yes, props can be modified anytime with this.props', False),
                    ('Only if declared with let', False),
                    ('Only in class components', False),
                ],
                'explanation': 'All React components must act like pure functions with respect to their props (they must never mutate their own props).'
            },
            {
                'text': 'What must a component return in React?',
                'options': [
                    ('JSX (React elements), null, or primitive values', True),
                    ('An HTML string', False),
                    ('A DOM element reference', False),
                    ('A JSON object', False),
                ],
                'explanation': 'React components return JSX, arrays of elements, fragments, strings, numbers, or null.'
            }
        ]
    },
    'useState Hook': {
        'title': 'React useState & State Management Quiz',
        'questions': [
            {
                'text': 'Why should you use functional state updates: `setCount(prev => prev + 1)`?',
                'options': [
                    ('To ensure you are calculating from the most current pending state during batched updates', True),
                    ('Because regular setCount(count + 1) raises a runtime error', False),
                    ('To make the update synchronous', False),
                    ('It skips re-rendering the component', False),
                ],
                'explanation': 'Functional updates ensure batched state transitions receive the accurate preceding state.'
            },
            {
                'text': 'What happens when state is updated to the exact same primitive value (e.g., Object.is(prev, next))?',
                'options': [
                    ('React bails out and skips re-rendering child components', True),
                    ('React forces a deep re-render', False),
                    ('React throws an infinite loop error', False),
                    ('The component unmounts', False),
                ],
                'explanation': 'React uses Object.is comparison and bails out of re-rendering if state has not changed.'
            }
        ]
    },

    # MySQL & SQL
    'Databases and Tables': {
        'title': 'MySQL Tables & Relational Schema Quiz',
        'questions': [
            {
                'text': 'Which SQL command is used to permanently remove a table AND all of its rows and metadata?',
                'options': [
                    ('DROP TABLE', True),
                    ('DELETE TABLE', False),
                    ('TRUNCATE TABLE', False),
                    ('REMOVE TABLE', False),
                ],
                'explanation': 'DROP TABLE deletes the entire table definition, structure, and data from the database schema.'
            },
            {
                'text': 'What does the `NOT NULL` constraint enforce on a table column?',
                'options': [
                    ('The column cannot store NULL or missing values', True),
                    ('The column must store numeric values only', False),
                    ('The column must contain unique values', False),
                    ('The column cannot be altered after creation', False),
                ],
                'explanation': 'NOT NULL ensures every inserted row provides an actual value for that column.'
            }
        ]
    },
    'Primary Keys & Foreign Keys': {
        'title': 'MySQL Keys & Relational Integrity Quiz',
        'questions': [
            {
                'text': 'Can a relational table in MySQL have more than one PRIMARY KEY?',
                'options': [
                    ('No, a table can only have one primary key (though it can be composite across multiple columns)', True),
                    ('Yes, up to 16 primary keys per table', False),
                    ('Yes, one per index', False),
                    ('Only InnoDB tables allow multiple primary keys', False),
                ],
                'explanation': 'A table can only define one primary key constraint, which may consist of single or composite columns.'
            },
            {
                'text': 'What is the purpose of a FOREIGN KEY constraint?',
                'options': [
                    ('To enforce referential integrity between columns in two different tables', True),
                    ('To encrypt table data stored on disk', False),
                    ('To allow foreign users to access the table', False),
                    ('To make queries run in parallel', False),
                ],
                'explanation': 'A FOREIGN KEY links a child table column to a parent table primary key, preventing orphaned records.'
            }
        ]
    },
    'INNER JOIN and LEFT JOIN': {
        'title': 'MySQL JOIN Operations Mastery Quiz',
        'questions': [
            {
                'text': 'What does a `LEFT JOIN` return when there is NO matching row in the right table?',
                'options': [
                    ('All rows from the left table, with NULL values in the right table columns', True),
                    ('Only the matching rows', False),
                    ('An error: Missing relational match', False),
                    ('Empty result set', False),
                ],
                'explanation': 'LEFT JOIN retains all rows from the left table and fills non-matching right columns with NULL.'
            },
            {
                'text': 'Which JOIN only returns rows where the join condition evaluates to TRUE in BOTH tables?',
                'options': [
                    ('INNER JOIN', True),
                    ('FULL OUTER JOIN', False),
                    ('LEFT JOIN', False),
                    ('CROSS JOIN', False),
                ],
                'explanation': 'INNER JOIN outputs the intersection of records where keys match on both sides.'
            }
        ]
    },
    'GROUP BY and HAVING': {
        'title': 'SQL Aggregations & HAVING Clause Quiz',
        'questions': [
            {
                'text': 'What is the key difference between the `WHERE` clause and the `HAVING` clause in SQL?',
                'options': [
                    ('WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY', True),
                    ('WHERE is only for numbers; HAVING is for strings', False),
                    ('WHERE and HAVING are completely interchangeable', False),
                    ('HAVING executes before WHERE', False),
                ],
                'explanation': 'WHERE filters rows prior to aggregation; HAVING filters groups based on aggregate results (e.g. COUNT(*) > 5).'
            },
            {
                'text': 'Which aggregate function counts the total number of non-null values in a column?',
                'options': [
                    ('COUNT(column_name)', True),
                    ('SUM(column_name)', False),
                    ('TOTAL(column_name)', False),
                    ('LEN(column_name)', False),
                ],
                'explanation': 'COUNT(col) counts non-null rows in that column, whereas COUNT(*) counts all rows including nulls.'
            }
        ]
    },

    # Django
    'MVT Pattern': {
        'title': 'Django MVT Architectural Quiz',
        'questions': [
            {
                'text': 'In Django’s MVT (Model-View-Template) architecture, what is the role of the `View`?',
                'options': [
                    ('Business logic controller that accepts HTTP requests and returns HTTP responses', True),
                    ('Visual HTML presentation layout', False),
                    ('Database table definition', False),
                    ('URL routing dispatcher', False),
                ],
                'explanation': 'In Django, the View contains business logic and request-response handling (analogous to the Controller in traditional MVC).'
            },
            {
                'text': 'Which Django component directly handles mapping incoming URLs to their corresponding views?',
                'options': [
                    ('urls.py (URLconf)', True),
                    ('models.py', False),
                    ('views.py', False),
                    ('wsgi.py', False),
                ],
                'explanation': 'urls.py defines URL patterns and maps matching request paths to callable views.'
            }
        ]
    },
    'Django ORM': {
        'title': 'Django ORM & QuerySets Quiz',
        'questions': [
            {
                'text': 'Are Django QuerySets evaluated immediately when you define them (e.g. `books = Book.objects.filter(price__gt=20)`)?',
                'options': [
                    ('No, QuerySets are lazy and only execute SQL when iterated, sliced, or evaluated', True),
                    ('Yes, SQL is sent to the database immediately on filter()', False),
                    ('Only if DEBUG=True', False),
                    ('QuerySets are always synchronous and eager', False),
                ],
                'explanation': 'Django QuerySets are lazy; they do not hit the database until their results are actually evaluated or iterated.'
            },
            {
                'text': 'Which QuerySet method is used to eliminate the "N+1 query problem" when traversing ForeignKey relationships?',
                'options': [
                    ('select_related()', True),
                    ('prefetch_all()', False),
                    ('join()', False),
                    ('eager_load()', False),
                ],
                'explanation': 'select_related performs a SQL JOIN to fetch single-valued relationships (ForeignKey, OneToOne) in a single query.'
            }
        ]
    },

    # Machine Learning
    'Linear Regression': {
        'title': 'Machine Learning - Linear Regression Quiz',
        'questions': [
            {
                'text': 'What type of target variable does Linear Regression predict?',
                'options': [
                    ('Continuous numeric values', True),
                    ('Categorical discrete classes', False),
                    ('Unlabeled clusters', False),
                    ('Binary true/false labels only', False),
                ],
                'explanation': 'Linear Regression is a supervised learning algorithm designed to predict continuous real-valued targets.'
            },
            {
                'text': 'Which cost function is standardly minimized when training an Ordinary Least Squares (OLS) Linear Regression model?',
                'options': [
                    ('Mean Squared Error (MSE)', True),
                    ('Binary Cross-Entropy', False),
                    ('Categorical Cross-Entropy', False),
                    ('Hinge Loss', False),
                ],
                'explanation': 'OLS minimizes the Mean Squared Error (the sum of squared residuals between predictions and ground truth).'
            }
        ]
    },
    'Supervised vs Unsupervised Learning': {
        'title': 'Machine Learning - Supervised vs Unsupervised Quiz',
        'questions': [
            {
                'text': 'What is the defining characteristic of Supervised Learning?',
                'options': [
                    ('Training data includes both input features and corresponding ground-truth target labels', True),
                    ('The model learns without any human supervision or labels', False),
                    ('The model only works on image data', False),
                    ('Target variables are always discrete categories', False),
                ],
                'explanation': 'Supervised learning algorithms are provided labeled data pairs (X, y) to learn an input-to-output mapping function.'
            },
            {
                'text': 'Which of the following is an example of an Unsupervised Learning task?',
                'options': [
                    ('K-Means customer segmentation clustering', True),
                    ('Spam email classification', False),
                    ('House price prediction', False),
                    ('Medical disease diagnosis', False),
                ],
                'explanation': 'Customer clustering discovers natural groupings in data without pre-existing labels (Unsupervised Learning).'
            }
        ]
    },

    # HTML
    'Semantic Tags & Layout': {
        'title': 'HTML5 Semantic Tags & Accessibility Quiz',
        'questions': [
            {
                'text': 'Which HTML5 semantic element is intended to encapsulate independent, self-contained content that could be syndicated?',
                'options': [
                    ('<article>', True),
                    ('<section>', False),
                    ('<div>', False),
                    ('<main>', False),
                ],
                'explanation': '<article> represents an autonomous composition (e.g. blog post, news story, forum comment) that makes sense on its own.'
            },
            {
                'text': 'What is the primary benefit of using semantic HTML tags over generic `<div>` tags?',
                'options': [
                    ('Improves accessibility for screen readers and search engine optimization (SEO)', True),
                    ('Makes the webpage load 10x faster', False),
                    ('Automatically styles elements with CSS', False),
                    ('Enables JavaScript execution', False),
                ],
                'explanation': 'Semantic elements provide meaningful structural information to web crawlers, search engines, and assistive screen reader technology.'
            }
        ]
    }
}

def seed_quizzes():
    print("[INFO] Seeding distinctive, high-quality technical quizzes across all concepts...")
    created_quizzes = 0
    created_questions = 0

    for concept_title, data in QUIZ_DATA.items():
        # Match concept by title (case-insensitive)
        concepts = Concept.objects.filter(title__iexact=concept_title)
        if not concepts.exists():
            concepts = Concept.objects.filter(title__icontains=concept_title)

        concept = concepts.first()
        if not concept:
            continue

        quiz, created = Quiz.objects.get_or_create(
            concept=concept,
            defaults={
                'title': data['title'],
                'description': f"Comprehensive technical assessment for {concept.title} ({concept.module.technology.name}).",
                'time_limit_minutes': 10,
                'passing_score_percentage': 70,
                'difficulty_level': 'intermediate',
                'created_by': admin_user,
                'is_published': True
            }
        )

        if created:
            created_quizzes += 1

        # Delete old questions for this quiz to guarantee fresh distinct questions
        quiz.questions.all().delete()

        for q_idx, q_data in enumerate(data['questions']):
            q = Question.objects.create(
                quiz=quiz,
                question_text=q_data['text'],
                explanation=q_data['explanation'],
                order=q_idx + 1,
                points=1,
                question_type=Question.TYPE_MCQ
            )
            created_questions += 1

            for opt_idx, (opt_text, is_correct) in enumerate(q_data['options']):
                AnswerOption.objects.create(
                    question=q,
                    option_text=opt_text,
                    is_correct=is_correct,
                    order=opt_idx + 1
                )

        print(f"[OK] Seeded distinct quiz for '{concept.module.technology.name} -> {concept.title}' with {len(data['questions'])} questions.")

    print(f"\n[SUCCESS] Seeded {created_quizzes} new quizzes and {created_questions} questions!")

if __name__ == '__main__':
    seed_quizzes()
