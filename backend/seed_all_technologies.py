import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from content.models import Technology, Module, Concept, Note

User = get_user_model()

def seed_all_curriculums():
    print("[INFO] Seeding complete curriculum & notes for all technologies...")

    teacher_user = User.objects.filter(role=User.ROLE_TEACHER).first()
    if not teacher_user:
        teacher_user = User.objects.filter(is_superuser=True).first()

    curriculum_data = [
        # ==========================================
        # 1. MySQL
        # ==========================================
        {
            'tech_slug': 'mysql',
            'modules': [
                {
                    'title': 'MySQL Fundamentals',
                    'order': 1,
                    'desc': 'Core relational concepts, databases, schemas, and table creation.',
                    'concepts': [
                        {
                            'title': 'Databases and Tables',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 10,
                            'summary': 'Creating databases and defining tabular schemas with data types.',
                            'note': {
                                'title': 'MySQL – Databases & Tables',
                                'definition': 'A database is an organized container for storing data, and tables are structured two-dimensional grids composed of rows (records) and columns (attributes).',
                                'explanation': '<p>In MySQL, you first create a database schema, switch into it, and then define tables specifying column names and data types (such as <code>VARCHAR</code>, <code>INT</code>, <code>DATE</code>, and <code>DECIMAL</code>).</p><p>Every table represents an entity (e.g., students, products, orders) where columns describe properties and rows contain individual records.</p>',
                                'real_world_analogy': 'Think of a database as an Excel workbook, and each table inside as a separate worksheet with defined column headers like ID, Name, and Email.',
                                'syntax': 'CREATE DATABASE db_name;\nUSE db_name;\nCREATE TABLE table_name (\n    column1 datatype constraints,\n    column2 datatype constraints\n);',
                                'code_language': 'sql',
                                'code_example': """-- Create learning database
CREATE DATABASE university_db;
USE university_db;

-- Create students table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    enrollment_year INT DEFAULT 2026,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);""",
                                'expected_output': 'Query OK, 0 rows affected (0.02 sec)',
                                'common_mistakes': '1. Forgetting to specify VARCHAR maximum length.\n2. Omitting semicolons at the end of statements.\n3. Creating tables without selecting a database first using USE db_name.',
                                'important_points': '• Always choose precise data types to conserve memory.\n• Use AUTO_INCREMENT on integer surrogate primary keys.\n• Use UNIQUE constraints on fields like email to prevent duplicate entries.'
                            }
                        },
                        {
                            'title': 'Primary Keys & Foreign Keys',
                            'order': 2,
                            'level': 'intermediate',
                            'minutes': 12,
                            'summary': 'Ensuring entity integrity and relational linking between tables.',
                            'note': {
                                'title': 'MySQL – Primary & Foreign Keys',
                                'definition': 'A Primary Key uniquely identifies each row in a table. A Foreign Key is a field in one table that references the Primary Key of another table, establishing a relational connection.',
                                'explanation': '<p>Primary keys enforce entity integrity by prohibiting NULL values and duplicates. Foreign keys enforce referential integrity, ensuring child records cannot reference non-existent parent records.</p><p>You can also define cascade rules such as <code>ON DELETE CASCADE</code> so that child rows are deleted automatically when their parent is removed.</p>',
                                'real_world_analogy': 'A student ID card is a Primary Key: it uniquely identifies you. An exam ticket that has your Student ID printed on it is a Foreign Key: it points back to your official student profile.',
                                'syntax': 'CREATE TABLE child_table (\n    id INT PRIMARY KEY,\n    parent_id INT,\n    FOREIGN KEY (parent_id) REFERENCES parent_table(id) ON DELETE CASCADE\n);',
                                'code_language': 'sql',
                                'code_example': """CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL
);

CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);""",
                                'expected_output': 'Query OK, 0 rows affected (0.03 sec)',
                                'common_mistakes': '1. Forgetting that foreign key columns must match the exact data type of the parent primary key.\n2. Deleting a parent row while referenced by a foreign key without CASCADE rules.',
                                'important_points': '• A table can have only ONE primary key, but multiple foreign keys.\n• Foreign keys automatically create indexes for faster join performance.'
                            }
                        }
                    ]
                },
                {
                    'title': 'CRUD Operations',
                    'order': 2,
                    'desc': 'Creating, Reading, Updating, and Deleting records in MySQL tables.',
                    'concepts': [
                        {
                            'title': 'INSERT and SELECT Queries',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 10,
                            'summary': 'Adding rows into tables and retrieving dataset records.',
                            'note': {
                                'title': 'MySQL – INSERT & SELECT',
                                'definition': 'INSERT adds new rows of data into a table. SELECT retrieves and filters records from one or more tables.',
                                'explanation': '<p>The SELECT query is the most fundamental reading operation in SQL. You can retrieve all columns using <code>*</code> or specify specific column names, order results with <code>ORDER BY</code>, and filter conditions with <code>WHERE</code>.</p>',
                                'real_world_analogy': 'INSERT is like writing a new name in an attendance register. SELECT is like skimming the register to find all students whose names start with A.',
                                'syntax': 'INSERT INTO table_name (col1, col2) VALUES (val1, val2);\nSELECT col1, col2 FROM table_name WHERE condition;',
                                'code_language': 'sql',
                                'code_example': """-- Inserting student records
INSERT INTO students (full_name, email, enrollment_year)
VALUES ('Aishwarya K', 'aishwarya@technotes.com', 2026),
       ('Rahul Verma', 'rahul@technotes.com', 2026);

-- Retrieving students enrolled in 2026
SELECT id, full_name, email 
FROM students 
WHERE enrollment_year = 2026 
ORDER BY full_name ASC;""",
                                'expected_output': """+----+-------------+-------------------------+
| id | full_name   | email                   |
+----+-------------+-------------------------+
|  1 | Aishwarya K | aishwarya@technotes.com |
|  2 | Rahul Verma | rahul@technotes.com     |
+----+-------------+-------------------------+""",
                                'common_mistakes': '1. Mismatching column count and value count in INSERT statements.\n2. Omitting quotes around string (VARCHAR) values.',
                                'important_points': '• Always list column names explicitly in INSERT statements for maintainability.\n• Avoid SELECT * in production applications; request only required columns.'
                            }
                        },
                        {
                            'title': 'UPDATE and DELETE Queries',
                            'order': 2,
                            'level': 'beginner',
                            'minutes': 10,
                            'summary': 'Modifying existing rows and safely removing records.',
                            'note': {
                                'title': 'MySQL – UPDATE & DELETE',
                                'definition': 'UPDATE modifies values in existing table rows. DELETE permanently removes one or more rows from a table.',
                                'explanation': '<p>Both UPDATE and DELETE operations should almost always be accompanied by a <code>WHERE</code> clause. Without a WHERE clause, the command modifies or deletes EVERY row in the table!</p>',
                                'real_world_analogy': 'UPDATE is using an eraser and pencil to correct a phone number on a form. DELETE is shredding that single form. Forgetting WHERE is like shredding every single form in the building!',
                                'syntax': 'UPDATE table_name SET col1 = val1 WHERE condition;\nDELETE FROM table_name WHERE condition;',
                                'code_language': 'sql',
                                'code_example': """-- Update student email
UPDATE students 
SET email = 'aishwarya.dev@technotes.com' 
WHERE id = 1;

-- Delete inactive records
DELETE FROM students 
WHERE enrollment_year < 2020;""",
                                'expected_output': 'Query OK, 1 row affected (0.01 sec)',
                                'common_mistakes': '1. Running UPDATE or DELETE without a WHERE clause, accidentally wiping out the entire table!\n2. Not checking row count affected before committing transactions.',
                                'important_points': '• Always test your WHERE filter with a SELECT query first before executing UPDATE or DELETE.\n• Use MySQL workbench Safe Updates mode to guard against unconstrained updates.'
                            }
                        }
                    ]
                },
                {
                    'title': 'Relational Joins & Indexes',
                    'order': 3,
                    'desc': 'Connecting multiple tables and optimizing query performance.',
                    'concepts': [
                        {
                            'title': 'INNER JOIN and LEFT JOIN',
                            'order': 1,
                            'level': 'intermediate',
                            'minutes': 15,
                            'summary': 'Combining related rows across multiple tables.',
                            'note': {
                                'title': 'MySQL – Joins Explained',
                                'definition': 'A JOIN is an SQL clause used to combine rows from two or more tables based on a related common column between them.',
                                'explanation': '<p><b>INNER JOIN</b> returns records that have matching values in both tables.<br/><b>LEFT JOIN</b> returns all records from the left table, and matching records from the right table (filling NULL if no match exists).</p>',
                                'real_world_analogy': 'INNER JOIN is like an invitation-only party: only people who RSVP (match) are present. LEFT JOIN is a roll call: every student on the roster is listed, showing their grade if graded, or NULL if absent.',
                                'syntax': 'SELECT t1.col, t2.col\nFROM table1 t1\nINNER JOIN table2 t2 ON t1.id = t2.t1_id;',
                                'code_language': 'sql',
                                'code_example': """SELECT s.full_name, c.title AS course_title
FROM students s
INNER JOIN enrollments e ON s.id = e.student_id
INNER JOIN courses c ON e.course_id = c.id
ORDER BY s.full_name;""",
                                'expected_output': """+-------------+----------------------+
| full_name   | course_title         |
+-------------+----------------------+
| Aishwarya K | Python Full-Stack    |
| Aishwarya K | React 18 & Vite      |
| Rahul Verma | MySQL Architecture   |
+-------------+----------------------+""",
                                'common_mistakes': '1. Forgetting table aliases in SELECT clause causing ambiguous column errors.\n2. Missing ON join condition, producing an unintended Cartesian product (CROSS JOIN).',
                                'important_points': '• Always index columns that are frequently used in JOIN conditions.\n• Use LEFT JOIN when you want to retain parent records even if no child records exist.'
                            }
                        }
                    ]
                }
            ]
        },

        # ==========================================
        # 2. SQL
        # ==========================================
        {
            'tech_slug': 'sql',
            'modules': [
                {
                    'title': 'Querying and Filtering',
                    'order': 1,
                    'desc': 'Standard SQL syntax, clauses, conditions, and sorting.',
                    'concepts': [
                        {
                            'title': 'SELECT, WHERE, and LIKE',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 10,
                            'summary': 'Conditional filtering and pattern matching in SQL.',
                            'note': {
                                'title': 'SQL – Filtering Data',
                                'definition': 'The WHERE clause specifies search conditions to filter rows, and the LIKE operator performs pattern matching using wildcard characters.',
                                'explanation': '<p>In SQL, <code>%</code> matches zero or more characters, and <code>_</code> matches exactly one character in a LIKE clause. You can combine multiple conditions using <code>AND</code>, <code>OR</code>, and <code>NOT</code>.</p>',
                                'real_world_analogy': 'Using WHERE is like applying filters on an shopping app: show only laptops under $1000 with 16GB RAM.',
                                'syntax': 'SELECT columns FROM table WHERE column LIKE "pattern%";',
                                'code_language': 'sql',
                                'code_example': """SELECT product_name, price, stock 
FROM inventory 
WHERE category = 'Electronics' 
  AND price BETWEEN 100 AND 500
  AND product_name LIKE '%Pro%'
ORDER BY price DESC;""",
                                'expected_output': """+------------------+--------+-------+
| product_name     | price  | stock |
+------------------+--------+-------+
| Webcam Pro 4K    | 149.99 |    30 |
| Mic Pro Studio   | 119.50 |    15 |
+------------------+--------+-------+""",
                                'common_mistakes': '1. Using = NULL instead of IS NULL.\n2. Confusing AND with OR logic in complex conditions without parentheses.',
                                'important_points': '• Use parentheses when mixing AND and OR to enforce evaluation order.\n• LIKE patterns starting with % (e.g. %query) cannot utilize standard B-Tree indexes.'
                            }
                        }
                    ]
                },
                {
                    'title': 'Aggregation & Grouping',
                    'order': 2,
                    'desc': 'Statistical summaries, grouping data, and filtering groups.',
                    'concepts': [
                        {
                            'title': 'GROUP BY and HAVING',
                            'order': 1,
                            'level': 'intermediate',
                            'minutes': 15,
                            'summary': 'Summarizing datasets with COUNT, SUM, AVG, and filtering grouped results.',
                            'note': {
                                'title': 'SQL – Aggregation & Grouping',
                                'definition': 'GROUP BY groups rows that share values into summary rows. HAVING filters the grouped rows based on aggregate conditions.',
                                'explanation': '<p>WHERE filters individual rows BEFORE grouping takes place. HAVING filters groups AFTER aggregation has been calculated.</p>',
                                'real_world_analogy': 'Grouping students by class grade to calculate each class average score. WHERE removes absent students before calculating averages; HAVING shows only classes whose average score is above 80%.',
                                'syntax': 'SELECT category, COUNT(*), AVG(price)\nFROM products\nWHERE in_stock = 1\nGROUP BY category\nHAVING AVG(price) > 50;',
                                'code_language': 'sql',
                                'code_example': """SELECT department, 
       COUNT(emp_id) AS total_employees, 
       ROUND(AVG(salary), 2) AS avg_salary
FROM employees
WHERE is_active = 1
GROUP BY department
HAVING COUNT(emp_id) >= 5
ORDER BY avg_salary DESC;""",
                                'expected_output': """+-----------------+-----------------+------------+
| department      | total_employees | avg_salary |
+-----------------+-----------------+------------+
| Engineering     |              24 |   98500.00 |
| Product Design  |               7 |   82400.00 |
+-----------------+-----------------+------------+""",
                                'common_mistakes': '1. Using aggregate functions (like SUM/COUNT) inside a WHERE clause instead of HAVING.\n2. Selecting non-aggregated columns that are not included in the GROUP BY clause.',
                                'important_points': '• SQL execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.\n• COUNT(*) counts all rows including NULLs, while COUNT(col) counts non-NULL values.'
                            }
                        }
                    ]
                }
            ]
        },

        # ==========================================
        # 3. React
        # ==========================================
        {
            'tech_slug': 'react',
            'modules': [
                {
                    'title': 'React Fundamentals',
                    'order': 1,
                    'desc': 'JSX, Components, and Props.',
                    'concepts': [
                        {
                            'title': 'Components & Props',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 12,
                            'summary': 'Reusable declarative UI building blocks and unidirectional data flow.',
                            'note': {
                                'title': 'React – Components & Props',
                                'definition': 'A React Component is a reusable, self-contained JavaScript function that returns JSX UI elements. Props (properties) are read-only arguments passed from parent to child components.',
                                'explanation': '<p>React views your user interface as a hierarchy of components. Instead of duplicating HTML, you build modular components and pass customizable data into them using Props.</p><p>Props are immutable (read-only): a child component must never alter the props passed to it.</p>',
                                'real_world_analogy': 'A component is like a custom rubber stamp, and props are the ink color you choose. The stamp design remains the same, but the output adapts to the props you provide.',
                                'syntax': 'function Card({ title, description }) {\n    return <div><h3>{title}</h3><p>{description}</p></div>;\n}',
                                'code_language': 'javascript',
                                'code_example': """// Child component receiving props
function TechBadge({ name, color = 'emerald' }) {
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full bg-${color}-100 text-${color}-800`}>
            {name}
        </span>
    );
}

// Parent component rendering children with props
export default function App() {
    return (
        <div className="flex gap-2 p-4">
            <TechBadge name="React 18" color="blue" />
            <TechBadge name="Vite" color="purple" />
            <TechBadge name="Tailwind CSS" color="emerald" />
        </div>
    );
}""",
                                'expected_output': 'Renders three styled badges: "React 18", "Vite", and "Tailwind CSS".',
                                'common_mistakes': '1. Attempting to mutate props directly (props.name = "new").\n2. Forgetting to return a single parent element or React Fragment (<>...</>).',
                                'important_points': '• Props flow strictly top-to-bottom (unidirectional data flow).\n• Use destructuring inside function arguments for clean, readable code.'
                            }
                        }
                    ]
                },
                {
                    'title': 'State & React Hooks',
                    'order': 2,
                    'desc': 'Managing dynamic reactive data with useState and useEffect.',
                    'concepts': [
                        {
                            'title': 'useState Hook',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 12,
                            'summary': 'Managing local component state and triggering reactive re-renders.',
                            'note': {
                                'title': 'React – useState Hook',
                                'definition': 'useState is a React Hook that declares a state variable and provides an updater function to modify it, triggering a component re-render when changed.',
                                'explanation': '<p>Unlike ordinary local variables that reset on every function execution, React preserves state variables between renders. When you call the setter function, React schedules a re-render of the component with the updated value.</p>',
                                'real_world_analogy': 'A score counter on a basketball scoreboard. Every time a basket is scored, you press the button (setter) to update the score display (state).',
                                'syntax': 'const [state, setState] = useState(initialValue);',
                                'code_language': 'javascript',
                                'code_example': """import { useState } from 'react';

export default function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div className="p-4 border rounded-xl text-center">
            <p className="text-xl font-bold mb-3">Count: {count}</p>
            <button 
                onClick={() => setCount(prev => prev + 1)}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
            >
                Increment +1
            </button>
        </div>
    );
}""",
                                'expected_output': 'Displays count starting at 0, incrementing dynamically on each button click.',
                                'common_mistakes': '1. Modifying state directly without the setter (count = count + 1).\n2. Calling useState inside loops or conditional if-statements (violates Rules of Hooks).',
                                'important_points': '• Always call Hooks at the top level of your React function components.\n• Use updater functions (setCount(prev => prev + 1)) when new state depends on prior state.'
                            }
                        }
                    ]
                }
            ]
        },

        # ==========================================
        # 4. JavaScript
        # ==========================================
        {
            'tech_slug': 'javascript',
            'modules': [
                {
                    'title': 'Modern JavaScript (ES6+)',
                    'order': 1,
                    'desc': 'Variables, arrow functions, promises, and async operations.',
                    'concepts': [
                        {
                            'title': 'let, const, and Scope',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 10,
                            'summary': 'Block-scoped variable declarations replacing legacy var.',
                            'note': {
                                'title': 'JavaScript – let vs const vs var',
                                'definition': 'let declares reassignable block-scoped variables, const declares non-reassignable block-scoped constants, and var declares function-scoped variables.',
                                'explanation': '<p>Modern JavaScript (ES6+) prefers <code>const</code> by default for values that do not change, and <code>let</code> when a variable must be reassigned (such as in loop counters). Both are block-scoped within curly braces <code>{ }</code>, preventing accidental leaks into the global namespace.</p>',
                                'real_world_analogy': 'const is like your permanent date of birth; let is like your age, which increments every year.',
                                'syntax': 'const PI = 3.14159;\nlet score = 0;\nscore = 10; // Valid',
                                'code_language': 'javascript',
                                'code_example': """// Modern variable declarations
const APP_NAME = "TechNotes";
let userScore = 85;

// Block scope demonstration
if (userScore >= 80) {
    const passed = true;
    let badge = "Gold Scholar";
    console.log(`${APP_NAME}: ${badge} awarded!`);
}
// passed and badge are not accessible outside this block""",
                                'expected_output': 'TechNotes: Gold Scholar awarded!',
                                'common_mistakes': '1. Reassigning a const variable (causes TypeError: Assignment to constant variable).\n2. Using legacy var which ignores block scopes.',
                                'important_points': '• Use const by default; use let only when reassignment is needed.\n• const objects and arrays can still have their internal properties mutated.'
                            }
                        },
                        {
                            'title': 'Async / Await and Promises',
                            'order': 2,
                            'level': 'intermediate',
                            'minutes': 15,
                            'summary': 'Handling asynchronous operations and network calls cleanly.',
                            'note': {
                                'title': 'JavaScript – Async/Await',
                                'definition': 'async/await is modern syntactic sugar on top of JavaScript Promises, allowing asynchronous code to be written and read like synchronous code.',
                                'explanation': '<p>An <code>async</code> function always returns a Promise. The <code>await</code> operator pauses execution inside the async function until the Promise resolves or rejects, making network requests clean and avoiding callback hell.</p>',
                                'real_world_analogy': 'Placing an order at a coffee shop and holding a buzzer. Instead of blocking the whole queue, you await the buzzer to buzz when your coffee is ready.',
                                'syntax': 'async function fetchData() {\n    try {\n        const res = await fetch(url);\n        const data = await res.json();\n        return data;\n    } catch (err) {\n        console.error(err);\n    }\n}',
                                'code_language': 'javascript',
                                'code_example': """async function fetchTechnologies() {
    try {
        const response = await fetch('https://notes-app-y7ri.onrender.com/api/content/technologies/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const technologies = await response.json();
        console.log(`Loaded ${technologies.length} technologies successfully!`);
        return technologies;
    } catch (error) {
        console.error("Network error:", error.message);
    }
}""",
                                'expected_output': 'Loaded 16 technologies successfully!',
                                'common_mistakes': '1. Forgetting await in front of fetch or .json().\n2. Forgetting try/catch blocks leading to unhandled promise rejections.',
                                'important_points': '• await can only be used inside async functions (or ES module top-level).\n• Always validate response.ok before parsing response.json().'
                            }
                        }
                    ]
                }
            ]
        },

        # ==========================================
        # 5. Django
        # ==========================================
        {
            'tech_slug': 'django',
            'modules': [
                {
                    'title': 'Django Architecture & Models',
                    'order': 1,
                    'desc': 'The MVT pattern, ORM, and database models.',
                    'concepts': [
                        {
                            'title': 'MVT Architectural Pattern',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 12,
                            'summary': 'Understanding Model-View-Template separation in Django.',
                            'note': {
                                'title': 'Django – MVT Pattern',
                                'definition': 'Django follows the Model-View-Template (MVT) pattern: Model handles database data, View processes business logic, and Template renders presentation.',
                                'explanation': '<p>When a client request arrives, Django matches the URL in <code>urls.py</code>, executes the corresponding <b>View</b> function or class, queries the <b>Model</b> (database) if needed, and formats the output (either via HTML Templates or JSON Serializers for REST APIs).</p>',
                                'real_world_analogy': 'A restaurant: Model is the kitchen pantry (ingredients & storage), View is the chef (cooks and prepares the dish), and Template/API is the waiter (serves the plate to the customer).',
                                'syntax': '# Model: models.py\n# View: views.py\n# Routing: urls.py',
                                'code_language': 'python',
                                'code_example': """# models.py
from django.db import models

class Note(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# views.py
from django.http import JsonResponse

def notes_list(request):
    notes = list(Note.objects.values('id', 'title', 'created_at'))
    return JsonResponse(notes, safe=False)""",
                                'expected_output': '[{"id": 1, "title": "Variables", "created_at": "2026-11-09T10:00:00Z"}]',
                                'common_mistakes': '1. Putting heavy business logic inside templates instead of views.\n2. Confusing Django Views with MVC Controllers (in Django, the framework itself acts as the controller).',
                                'important_points': '• Django ORM abstracts SQL queries into pure Python methods.\n• Django is "batteries included" with authentication, admin, and security built-in.'
                            }
                        }
                    ]
                }
            ]
        },

        # ==========================================
        # 6. HTML & CSS
        # ==========================================
        {
            'tech_slug': 'html',
            'modules': [
                {
                    'title': 'Semantic HTML5',
                    'order': 1,
                    'desc': 'Document structures, accessibility, and modern semantic tags.',
                    'concepts': [
                        {
                            'title': 'Semantic Tags & Layout',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 10,
                            'summary': 'Using header, nav, main, section, and article tags.',
                            'note': {
                                'title': 'HTML5 – Semantic Elements',
                                'definition': 'Semantic HTML tags clearly describe their meaning and purpose to both the browser and the developer (e.g., <header>, <article>, <nav> vs generic <div>).',
                                'explanation': '<p>Using semantic elements improves Search Engine Optimization (SEO), screen-reader accessibility for visually impaired users, and maintainability.</p>',
                                'real_world_analogy': 'A newspaper with clear headings, bylines, columns, and footnotes rather than a plain sheet of paper with no distinct sections.',
                                'syntax': '<header>...</header>\n<nav>...</nav>\n<main>\n  <article>...</article>\n</main>\n<footer>...</footer>',
                                'code_language': 'html',
                                'code_example': """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TechNotes Learning</title>
</head>
<body>
    <header>
        <h1>TechNotes Platform</h1>
        <nav>
            <a href="/notes">Notes</a> | <a href="/quizzes">Quizzes</a>
        </nav>
    </header>

    <main>
        <article>
            <h2>Understanding HTML5</h2>
            <p>Semantic tags make web pages accessible and structured.</p>
        </article>
    </main>

    <footer>
        <p>&copy; 2026 TechNotes. All rights reserved.</p>
    </footer>
</body>
</html>""",
                                'expected_output': 'Displays structured web document with accessible header, navigation, article, and footer.',
                                'common_mistakes': '1. Using <div> tags for everything ("div soup").\n2. Missing alt attributes on <img> tags.',
                                'important_points': '• Always specify <!DOCTYPE html> and lang attribute.\n• Use only ONE <h1> element per page for SEO best practices.'
                            }
                        }
                    ]
                }
            ]
        },

        # ==========================================
        # 7. Machine Learning
        # ==========================================
        {
            'tech_slug': 'machine-learning',
            'modules': [
                {
                    'title': 'Machine Learning Fundamentals',
                    'order': 1,
                    'desc': 'Core paradigms, training models, and evaluation metrics.',
                    'concepts': [
                        {
                            'title': 'Supervised vs Unsupervised Learning',
                            'order': 1,
                            'level': 'beginner',
                            'minutes': 15,
                            'summary': 'Labeled training data vs pattern discovery without labels.',
                            'note': {
                                'title': 'Machine Learning – Supervised vs Unsupervised',
                                'definition': 'Supervised Learning trains models on labeled datasets with known answers, whereas Unsupervised Learning finds hidden patterns and clusters in unlabeled data.',
                                'explanation': '<p><b>Supervised Learning</b> tasks include Classification (e.g. spam detection, sentiment analysis) and Regression (predicting continuous house prices).<br/><b>Unsupervised Learning</b> tasks include Clustering (customer segmentation) and Dimensionality Reduction (PCA).</p>',
                                'real_world_analogy': 'Supervised learning is like studying with flashcards that have questions and answers on the back. Unsupervised learning is like sorting a pile of assorted coins by size and weight with no labels.',
                                'syntax': '# Supervised: model.fit(X_train, y_train)\n# Unsupervised: kmeans.fit(X_unlabeled)',
                                'code_language': 'python',
                                'code_example': """# Supervised Learning: Linear Regression with scikit-learn
from sklearn.linear_model import LinearRegression
import numpy as np

# Hours studied (X) -> Exam score (y)
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([45, 55, 65, 75, 85])

# Train model
model = LinearRegression()
model.fit(X, y)

# Predict score for 6 hours of study
predicted_score = model.predict([[6]])
print(f"Predicted Score for 6 hours: {predicted_score[0]:.1f}")""",
                                'expected_output': 'Predicted Score for 6 hours: 95.0',
                                'common_mistakes': '1. Testing the model on the exact same data used for training (causes data leakage/overfitting).\n2. Forgetting to scale features when using distance-based algorithms.',
                                'important_points': '• Always split datasets into training, validation, and test sets.\n• Use metrics like Accuracy, Precision, Recall, and F1-score for classification.'
                            }
                        }
                    ]
                }
            ]
        }
    ]

    total_modules = 0
    total_concepts = 0
    total_notes = 0

    for curr in curriculum_data:
        tech = Technology.objects.filter(slug=curr['tech_slug']).first()
        if not tech:
            print(f"[WARN] Technology with slug '{curr['tech_slug']}' not found. Skipping.")
            continue

        for m_data in curr['modules']:
            module, _ = Module.objects.get_or_create(
                technology=tech,
                title=m_data['title'],
                defaults={
                    'order': m_data['order'],
                    'description': m_data['desc'],
                    'created_by': teacher_user
                }
            )
            total_modules += 1

            for c_data in m_data['concepts']:
                concept, _ = Concept.objects.get_or_create(
                    module=module,
                    title=c_data['title'],
                    defaults={
                        'order': c_data['order'],
                        'difficulty_level': c_data['level'],
                        'estimated_minutes': c_data['minutes'],
                        'summary': c_data['summary']
                    }
                )
                total_concepts += 1

                n_data = c_data['note']
                Note.objects.update_or_create(
                    concept=concept,
                    defaults={
                        'title': n_data['title'],
                        'definition': n_data['definition'],
                        'explanation': n_data['explanation'],
                        'real_world_analogy': n_data['real_world_analogy'],
                        'syntax': n_data['syntax'],
                        'code_example': n_data['code_example'],
                        'code_language': n_data['code_language'],
                        'expected_output': n_data['expected_output'],
                        'common_mistakes': n_data['common_mistakes'],
                        'important_points': n_data['important_points'],
                        'is_published': True,
                        'created_by': teacher_user
                    }
                )
                total_notes += 1

    print(f"[SUCCESS] Successfully seeded {total_modules} Modules, {total_concepts} Concepts, and {total_notes} Rich Notes!")

if __name__ == '__main__':
    seed_all_curriculums()
