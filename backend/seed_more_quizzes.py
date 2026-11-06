import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from content.models import Concept
from quizzes.models import Quiz, Question, AnswerOption

User = get_user_model()
teacher = User.objects.filter(role=User.ROLE_TEACHER).first() or User.objects.first()

def seed_quizzes():
    print("[INFO] Seeding quizzes for core concepts...")

    # 1. Quiz for Concept 1: Introduction
    intro_concept = Concept.objects.filter(title__icontains='Introduction').first()
    if intro_concept:
        q_intro, _ = Quiz.objects.get_or_create(
            concept=intro_concept,
            defaults={
                'title': 'Python Foundations & Introduction Quiz',
                'description': 'Test your fundamental understanding of Python origins, design philosophy, and execution model.',
                'time_limit_minutes': 5,
                'passing_score_percentage': 70,
                'difficulty_level': 'beginner',
                'is_published': True,
                'created_by': teacher
            }
        )

        # Question 1:
        ques1, _ = Question.objects.get_or_create(
            quiz=q_intro,
            order=1,
            defaults={
                'question_type': Question.TYPE_MCQ,
                'question_text': 'What type of programming language is Python?',
                'explanation': 'Python is an interpreted, high-level, dynamically typed language emphasizing code readability.',
                'points': 1
            }
        )
        AnswerOption.objects.get_or_create(question=ques1, order=1, defaults={'option_text': 'Low-level assembly language', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=ques1, order=2, defaults={'option_text': 'High-level, interpreted language', 'is_correct': True})
        AnswerOption.objects.get_or_create(question=ques1, order=3, defaults={'option_text': 'Strictly compiled machine language', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=ques1, order=4, defaults={'option_text': 'Database query dialect only', 'is_correct': False})

        # Question 2:
        ques2, _ = Question.objects.get_or_create(
            quiz=q_intro,
            order=2,
            defaults={
                'question_type': Question.TYPE_TRUE_FALSE,
                'question_text': 'In Python, code blocks are defined using curly brackets { } instead of indentation.',
                'explanation': 'False. Python uses indentation (whitespace) to determine the grouping of statements and code blocks.',
                'points': 1
            }
        )
        AnswerOption.objects.get_or_create(question=ques2, order=1, defaults={'option_text': 'True', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=ques2, order=2, defaults={'option_text': 'False', 'is_correct': True})

        # Question 3:
        ques3, _ = Question.objects.get_or_create(
            quiz=q_intro,
            order=3,
            defaults={
                'question_type': Question.TYPE_PREDICT_OUTPUT,
                'question_text': 'Predict the output of the following basic Python statement:',
                'code_snippet': 'print("Tech" + "Notes")',
                'explanation': 'The + operator concatenates string objects in Python, producing "TechNotes".',
                'points': 1
            }
        )
        AnswerOption.objects.get_or_create(question=ques3, order=1, defaults={'option_text': 'Tech Notes', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=ques3, order=2, defaults={'option_text': 'TechNotes', 'is_correct': True})
        AnswerOption.objects.get_or_create(question=ques3, order=3, defaults={'option_text': 'SyntaxError', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=ques3, order=4, defaults={'option_text': 'None', 'is_correct': False})

        # Question 4:
        ques4, _ = Question.objects.get_or_create(
            quiz=q_intro,
            order=4,
            defaults={
                'question_type': Question.TYPE_MCQ,
                'question_text': 'Who created the Python programming language?',
                'explanation': 'Python was conceived and designed by Guido van Rossum in the late 1980s and released in 1991.',
                'points': 1
            }
        )
        AnswerOption.objects.get_or_create(question=ques4, order=1, defaults={'option_text': 'Dennis Ritchie', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=ques4, order=2, defaults={'option_text': 'James Gosling', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=ques4, order=3, defaults={'option_text': 'Guido van Rossum', 'is_correct': True})
        AnswerOption.objects.get_or_create(question=ques4, order=4, defaults={'option_text': 'Bjarne Stroustrup', 'is_correct': False})

        print("[OK] Created Quiz for Introduction (Concept 1)")

    # 2. Quiz for Concept 3: Data Types
    dt_concept = Concept.objects.filter(title__icontains='Data Types').first()
    if dt_concept:
        q_dt, _ = Quiz.objects.get_or_create(
            concept=dt_concept,
            defaults={
                'title': 'Python Core Data Types Assessment',
                'description': 'Assess your knowledge of primitive and collection types in Python.',
                'time_limit_minutes': 5,
                'passing_score_percentage': 70,
                'difficulty_level': 'beginner',
                'is_published': True,
                'created_by': teacher
            }
        )
        qdt_1, _ = Question.objects.get_or_create(
            quiz=q_dt,
            order=1,
            defaults={
                'question_type': Question.TYPE_PREDICT_OUTPUT,
                'question_text': 'What is the data type returned by type(10.5)?',
                'code_snippet': 'x = 10.5\nprint(type(x))',
                'explanation': 'In Python, decimal numbers are represented by the float data type.',
                'points': 1
            }
        )
        AnswerOption.objects.get_or_create(question=qdt_1, order=1, defaults={'option_text': "<class 'float'>", 'is_correct': True})
        AnswerOption.objects.get_or_create(question=qdt_1, order=2, defaults={'option_text': "<class 'int'>", 'is_correct': False})
        AnswerOption.objects.get_or_create(question=qdt_1, order=3, defaults={'option_text': "<class 'double'>", 'is_correct': False})
        AnswerOption.objects.get_or_create(question=qdt_1, order=4, defaults={'option_text': "<class 'decimal'>", 'is_correct': False})

        qdt_2, _ = Question.objects.get_or_create(
            quiz=q_dt,
            order=2,
            defaults={
                'question_type': Question.TYPE_TRUE_FALSE,
                'question_text': 'Strings in Python are immutable, meaning their characters cannot be modified in-place.',
                'explanation': 'True. Strings in Python cannot be mutated once allocated; any modification creates a new string object.',
                'points': 1
            }
        )
        AnswerOption.objects.get_or_create(question=qdt_2, order=1, defaults={'option_text': 'True', 'is_correct': True})
        AnswerOption.objects.get_or_create(question=qdt_2, order=2, defaults={'option_text': 'False', 'is_correct': False})

        print("[OK] Created Quiz for Data Types (Concept 3)")

    # 3. Quiz for Concept 4: Operators
    op_concept = Concept.objects.filter(title__icontains='Operators').first()
    if op_concept:
        q_op, _ = Quiz.objects.get_or_create(
            concept=op_concept,
            defaults={
                'title': 'Arithmetic & Logical Operators Quiz',
                'description': 'Master Python operator precedence and calculations.',
                'time_limit_minutes': 5,
                'passing_score_percentage': 70,
                'difficulty_level': 'beginner',
                'is_published': True,
                'created_by': teacher
            }
        )
        qop_1, _ = Question.objects.get_or_create(
            quiz=q_op,
            order=1,
            defaults={
                'question_type': Question.TYPE_PREDICT_OUTPUT,
                'question_text': 'What is the output of 17 // 3 in Python?',
                'code_snippet': 'result = 17 // 3\nprint(result)',
                'explanation': '// is the floor division operator. 17 / 3 is 5.666..., so floor division rounds down to 5.',
                'points': 1
            }
        )
        AnswerOption.objects.get_or_create(question=qop_1, order=1, defaults={'option_text': '5.6667', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=qop_1, order=2, defaults={'option_text': '5', 'is_correct': True})
        AnswerOption.objects.get_or_create(question=qop_1, order=3, defaults={'option_text': '6', 'is_correct': False})
        AnswerOption.objects.get_or_create(question=qop_1, order=4, defaults={'option_text': '2', 'is_correct': False})

        print("[OK] Created Quiz for Operators (Concept 4)")

    print("[SUCCESS] All concept quizzes seeded successfully!")

if __name__ == '__main__':
    seed_quizzes()
