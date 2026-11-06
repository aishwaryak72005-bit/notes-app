import requests

BASE_URL = 'http://127.0.0.1:8000/api/auth'

# Test local auth functions directly via Django Client
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
c = Client()

# Test 1: Student Login
res1 = c.post('/api/auth/login/', {'username': 'learner_aishu', 'password': 'student123'}, content_type='application/json')
print("Student Login Status:", res1.status_code)
assert res1.status_code == 200, f"Failed: {res1.content}"
data1 = res1.json()
print("Student Role:", data1['user']['role'])
print("Student Name:", data1['user']['first_name'], data1['user']['last_name'])
assert data1['user']['role'] == 'student'

# Test 2: Teacher Login
res2 = c.post('/api/auth/login/', {'username': 'teacher_sarah', 'password': 'teacher123'}, content_type='application/json')
print("Teacher Login Status:", res2.status_code)
assert res2.status_code == 200
data2 = res2.json()
print("Teacher Role:", data2['user']['role'])
assert data2['user']['role'] == 'teacher'

# Test 3: Student Registration
res3 = c.post('/api/auth/register/student/', {
    'username': 'new_student',
    'email': 'new_student@example.com',
    'password': 'SecurePassword@123',
    'password2': 'SecurePassword@123',
    'first_name': 'Rohan',
    'last_name': 'Verma'
}, content_type='application/json')
print("Student Register Status:", res3.status_code)
assert res3.status_code == 201
print("All Auth Backend Tests Passed Successfully!")
