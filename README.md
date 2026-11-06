# TechNotes – Technical Learning Platform

A modern, responsive, full-stack educational learning platform for mastering IT and programming technologies with structured notes, interactive quizzes, progress analytics, and an AI-powered personalized learning assistant.

Designed with a premium **forest-green** and **warm-ivory** aesthetic matching the commercial TechNotes specification.

---

## 🚀 Key Features

1. **Role-Based Portals:**
   - **Student Portal:** Interactive dashboard, technology browsing, concept notes with syntax highlighting, interactive quizzes, bookmarks, learning progress analytics, and AI Tutor.
   - **Teacher Portal:** Full content lifecycle management (Technologies, Modules, Concepts, Notes, Quizzes, Question banks, and Student performance tracking).
2. **Structured Content Hierarchy:**
   - Category → Technology → Module → Concept → Notes + Quiz
3. **Rich Notes Viewer:**
   - Concept title, simple definition, syntax template, Prism.js code highlight, expected output, detailed rich explanation, real-world analogy, common mistakes to avoid, and key takeaways.
4. **Interactive Quiz Engine:**
   - Support for Multiple Choice Questions (MCQs), True or False, Predict the Output, Find the Error, and Fill in the Blanks.
   - Live progress indicator, instant result calculation, answer explanations, time tracking, confetti celebration on passing, and attempt logging in MySQL.
5. **AI Personalized Learning Assistant (Gemini API Integration):**
   - 3 Adaptive Levels: Beginner (everyday analogies), Intermediate (practical code & definitions), Advanced (architectural deep-dive & best practices).
   - Dynamic pedagogical behavior: adapts when a student expresses confusion or asks for line-by-line code breakdowns.
6. **Bookmarks & Learning Analytics:**
   - Bookmark important concepts for quick revision.
   - Visual analytics powered by Recharts (Technology completion rate, score trajectory over time, weak topics detection and revision recommendations).

---

## 🛠 Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, Prism.js, Lucide React, Canvas Confetti.
- **Backend:** Python 3.10, Django 5.2, Django REST Framework, SimpleJWT Authentication, PyMySQL.
- **Database:** MySQL 8.0 (`technotes_db`).
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) with built-in adaptive tutoring engine.

---

## 👥 Demo User Credentials

The login screen features 1-click demo switcher buttons for instant access:

| Role | Username | Password | Notes |
|---|---|---|---|
| **Student** | `learner_aishu` | `student123` | Aishwarya Sharma – Access to all learning features, dashboard, quizzes, bookmarks, and AI Tutor. |
| **Teacher** | `teacher_sarah` | `teacher123` | Sarah Jenkins – Access to Educator Panel, curriculum authoring, and analytics. |
| **Admin** | `admin` | `admin123` | Full superuser access to Django admin and application settings. |

---

## 🏃 Running the Application

### Option A: One-Click Launcher
Double-click `start_technotes.bat` to launch both servers simultaneously.

### Option B: Manual Start

**1. Start Backend:**
```bash
cd backend
.\venv\Scripts\activate
python manage.py runserver 127.0.0.1:8000
```
Backend API will be live at: `http://127.0.0.1:8000/api/`

**2. Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend UI will be live at: `http://localhost:5173`

---

## 📁 Repository Structure

```text
Notes-app/
├── backend/
│   ├── core/                  # Django project configuration & JWT settings
│   ├── accounts/              # Custom User model, roles, and authentication views
│   ├── content/               # Technologies, categories, modules, concepts, notes
│   ├── quizzes/               # Quizzes, questions, attempts, and scoring engine
│   ├── progress/              # Student progress, bookmarks, and Recharts analytics
│   ├── ai_tutor/              # Gemini integration & adaptive learning engine
│   ├── venv/                  # Python virtual environment
│   ├── manage.py
│   ├── requirements.txt
│   ├── seed_data.py           # Comprehensive curriculum database seeder
│   └── test_integration.py    # Automated integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/        # layout, notes, quiz, ai, common
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # student, teacher, and auth pages
│   │   ├── services/          # Axios API connectors
│   │   ├── App.jsx            # Application routing
│   │   └── index.css          # Tailwind design system tokens
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.js
├── start_backend.bat
├── start_frontend.bat
└── start_technotes.bat
```
