import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import TeacherLayout from './components/layout/TeacherLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import StudentRegisterPage from './pages/auth/StudentRegisterPage';
import TeacherRegisterPage from './pages/auth/TeacherRegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProfilePage from './pages/common/ProfilePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import TechnologiesPage from './pages/student/TechnologiesPage';
import TechnologyDetailPage from './pages/student/TechnologyDetailPage';
import ConceptLearnPage from './pages/student/ConceptLearnPage';
import QuizPage from './pages/student/QuizPage';
import MyLearningPage from './pages/student/MyLearningPage';
import AITutorPage from './pages/student/AITutorPage';
import BookmarksPage from './pages/student/BookmarksPage';
import ProgressPage from './pages/student/ProgressPage';
import PracticeQuestionsPage from './pages/student/PracticeQuestionsPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageTechnologiesPage from './pages/teacher/ManageTechnologiesPage';
import ManageModulesPage from './pages/teacher/ManageModulesPage';
import ManageConceptsPage from './pages/teacher/ManageConceptsPage';
import ManageNotesPage from './pages/teacher/ManageNotesPage';
import ManageQuizzesPage from './pages/teacher/ManageQuizzesPage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';
import AiContentApprovalPage from './pages/teacher/AiContentApprovalPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/teacher/login" element={<AdminLoginPage />} />
          <Route path="/register/student" element={<StudentRegisterPage />} />
          <Route path="/register" element={<Navigate to="/register/student" replace />} />
          <Route path="/register/teacher" element={<Navigate to="/register/student" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Student Protected Portal */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/subjects" element={<TechnologiesPage />} />
            <Route path="/technologies" element={<TechnologiesPage />} />
            <Route path="/technologies/:slug" element={<TechnologyDetailPage />} />
            <Route path="/learn/:techSlug/:moduleSlug/:conceptSlug" element={<ConceptLearnPage />} />
            <Route path="/study-materials" element={<MyLearningPage />} />
            <Route path="/my-learning" element={<MyLearningPage />} />
            <Route path="/practice" element={<PracticeQuestionsPage />} />
            <Route path="/quizzes" element={<MyLearningPage />} />
            <Route path="/quiz/:conceptId" element={<QuizPage />} />
            <Route path="/ai-tutor" element={<AITutorPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Teacher Protected Portal */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/upload" element={<ManageNotesPage />} />
            <Route path="/teacher/materials" element={<ManageNotesPage />} />
            <Route path="/teacher/notes" element={<ManageNotesPage />} />
            <Route path="/teacher/ai-content" element={<AiContentApprovalPage />} />
            <Route path="/teacher/quizzes" element={<ManageQuizzesPage />} />
            <Route path="/teacher/students" element={<TeacherStudentsPage />} />
            <Route path="/teacher/analytics" element={<TeacherAnalyticsPage />} />
            <Route path="/teacher/technologies" element={<ManageTechnologiesPage />} />
            <Route path="/teacher/modules" element={<ManageModulesPage />} />
            <Route path="/teacher/concepts" element={<ManageConceptsPage />} />
          </Route>

          {/* Fallback Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
