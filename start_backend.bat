@echo off
title TechNotes Backend Server (Django REST Framework)
echo ========================================================
echo   TechNotes - Technical Learning Platform
echo   Starting Backend REST API on http://127.0.0.1:8000
echo ========================================================
cd backend
call .\venv\Scripts\activate
python manage.py runserver 127.0.0.1:8000
pause
