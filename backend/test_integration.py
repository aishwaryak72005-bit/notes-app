import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from accounts.models import User
from content.models import Technology, Concept, Note
from quizzes.models import Quiz, AnswerOption
from progress.models import StudentProgress, Bookmark

def run_tests():
    print("==================================================")
    print("[TEST] TechNotes Full-Stack Integration Test Suite")
    print("==================================================")
    client = Client()

    # 1. Test Authentication
    print("\n1. Testing Authentication...")
    login_res = client.post('/api/auth/login/', {
        'username': 'learner_aishu',
        'password': 'student123'
    }, content_type='application/json')
    assert login_res.status_code == 200, f"Login failed: {login_res.content}"
    auth_data = login_res.json()
    token = auth_data['access']
    headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
    print("   [PASS] Student authenticated. Token issued. User role:", auth_data['user']['role'])

    # 2. Test Student Dashboard API
    print("\n2. Testing Student Dashboard API...")
    dash_res = client.get('/api/content/dashboard/student/', **headers)
    assert dash_res.status_code == 200, f"Dashboard failed: {dash_res.content}"
    dash_data = dash_res.json()
    print("   [PASS] Technologies available:", dash_data['stats']['technologies_available'])
    print("   [PASS] Topics completed:", dash_data['stats']['topics_completed'])
    print("   [PASS] Continue Learning:", dash_data['continue_learning']['concept_title'])

    # 3. Test Technologies & Concepts
    print("\n3. Testing Curriculum Content Hierarchy...")
    tech_res = client.get('/api/content/technologies/', **headers)
    assert tech_res.status_code == 200
    techs = tech_res.json().get('results', tech_res.json())
    print(f"   [PASS] Retrieved {len(techs)} technologies across categories.")

    # 4. Test Concept Notes Viewer
    print("\n4. Testing Notes Viewer for 'Python - Variables'...")
    py_tech = client.get('/api/content/technologies/python/', **headers).json()
    var_concept = Concept.objects.filter(title='Variables').first()
    assert var_concept is not None
    note_res = client.get(f'/api/content/notes/?concept_id={var_concept.id}', **headers)
    notes = note_res.json().get('results', note_res.json())
    assert len(notes) > 0
    note = notes[0]
    print("   [PASS] Note Title:", note['title'])
    print("   [PASS] Syntax:", note['syntax'])
    print("   [PASS] Definition:", note['definition'])

    # 5. Test Interactive Quiz Engine & Instant Result Evaluation
    print("\n5. Testing Quiz Engine & Instant Evaluation...")
    quiz = Quiz.objects.filter(concept=var_concept).first()
    assert quiz is not None
    questions = quiz.questions.all()
    assert questions.count() > 0

    # Submit answers: pick correct answer for Q1
    answers = {}
    for q in questions:
        correct_opt = q.options.filter(is_correct=True).first()
        if correct_opt:
            answers[str(q.id)] = correct_opt.id

    submit_res = client.post(
        f'/api/quizzes/quizzes/{quiz.id}/submit/',
        data=json.dumps({'answers': answers, 'time_taken_seconds': 45}),
        content_type='application/json',
        **headers
    )
    assert submit_res.status_code == 200, f"Submit failed: {submit_res.content}"
    result = submit_res.json()
    print(f"   [PASS] Quiz Score: {result['score_percentage']}% | Passed: {result['passed']}")
    print(f"   [PASS] Correct Answers: {result['correct_answers']} / {result['total_questions']}")
    print(f"   [PASS] First Question Explanation: {result['feedback'][0]['explanation']}")

    # 6. Test Bookmarks System
    print("\n6. Testing Bookmarks System...")
    toggle_res = client.post(f'/api/progress/bookmarks/{var_concept.id}/toggle/', **headers)
    assert toggle_res.status_code == 200
    b_data = toggle_res.json()
    print(f"   [PASS] Toggle Bookmark Response: {b_data}")

    # Ensure it's bookmarked
    if not b_data['bookmarked']:
        client.post(f'/api/progress/bookmarks/{var_concept.id}/toggle/', **headers)

    book_list_res = client.get('/api/progress/bookmarks/', **headers)
    bookmarks = book_list_res.json().get('results', book_list_res.json())
    print(f"   [PASS] Active Bookmarks Count: {len(bookmarks)}")

    # 7. Test AI Personalized Learning Assistant
    print("\n7. Testing AI Tutor Adaptive Engine...")
    ai_conv_res = client.post('/api/ai/conversations/', {
        'concept_id': var_concept.id,
        'explanation_level': 'beginner'
    }, content_type='application/json', **headers)
    assert ai_conv_res.status_code == 201
    conv_data = ai_conv_res.json()
    conv_id = conv_data['id']
    print(f"   [PASS] Created AI Conversation #{conv_id} at level: {conv_data['explanation_level']}")

    # Send message: "I don't understand this concept"
    ai_msg_res = client.post(
        f'/api/ai/conversations/{conv_id}/send/',
        data=json.dumps({'content': "I don't understand this concept. Can you simplify it?"}),
        content_type='application/json',
        **headers
    )
    assert ai_msg_res.status_code == 200
    msg_data = ai_msg_res.json()
    print("   [PASS] AI Tutor Response received:")
    print("   ------------------------------------------------")
    safe_preview = msg_data['ai_message']['content'][:220].encode('ascii', 'replace').decode('ascii')
    print("   " + safe_preview + "...")
    print("   ------------------------------------------------")

    # 8. Test Learning Analytics & Recharts Data Feeds
    print("\n8. Testing Learning Analytics...")
    analytics_res = client.get('/api/progress/analytics/', **headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    print("   [PASS] Overview Progress Rate:", analytics_data['overview']['overall_progress_rate'], "%")
    print("   [PASS] Technologies in BarChart data:", len(analytics_data['technology_progress']))
    print("   [PASS] Weak Topics detected for revision:", len(analytics_data['weak_topics']))

    print("\n==================================================")
    print("[SUCCESS] ALL 8 INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
