@echo off
title TechNotes Platform Launcher
echo ========================================================
echo   Launching TechNotes Full-Stack Learning Platform...
echo ========================================================
start "TechNotes Backend" cmd /c "start_backend.bat"
start "TechNotes Frontend" cmd /c "start_frontend.bat"
echo Both servers launched.
echo Frontend: http://localhost:5173
echo Backend:  http://127.0.0.1:8000
echo.
