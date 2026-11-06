import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  Layers,
  FolderTree,
  FileCode,
  FileText,
  HelpCircle,
  Users,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  GraduationCap,
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      try {
        setLoading(true);
        const res = await contentService.getTeacherDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherStats();
  }, []);

  if (loading) {
    return <Loader message="Loading Educator Management Dashboard..." />;
  }

  const stats = data?.stats || {
    total_technologies: 16,
    total_modules: 12,
    total_concepts: 35,
    total_notes: 2,
    total_quizzes: 1,
    total_students: 1,
  };

  const attempts = data?.recent_attempts || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Educator Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-dark">
            Educator & Content Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your IT curriculum, publish structured notes, and assess student knowledge.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/teacher/notes"
            className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-2xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-sage" />
            <span>Write New Note</span>
          </Link>
          <Link
            to="/teacher/quizzes"
            className="px-4 py-2 bg-white border border-sage/60 hover:bg-sage/20 text-forest text-xs font-semibold rounded-2xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <HelpCircle className="w-4 h-4 text-forest" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-sage/40 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{stats.total_technologies}</div>
          <div className="text-xs text-muted font-medium mt-0.5">Technologies</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sage/40 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <FolderTree className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{stats.total_modules}</div>
          <div className="text-xs text-muted font-medium mt-0.5">Modules</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sage/40 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <FileCode className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{stats.total_concepts}</div>
          <div className="text-xs text-muted font-medium mt-0.5">Concepts</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sage/40 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{stats.total_notes}</div>
          <div className="text-xs text-muted font-medium mt-0.5">Published Notes</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sage/40 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{stats.total_quizzes}</div>
          <div className="text-xs text-muted font-medium mt-0.5">Quizzes</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-sage/40 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{stats.total_students}</div>
          <div className="text-xs text-muted font-medium mt-0.5">Students</div>
        </div>
      </div>

      {/* Content Management Shortcuts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage/40">
        <h2 className="text-lg font-bold text-charcoal mb-4">Content Organization Matrix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/teacher/technologies"
            className="p-5 rounded-2xl bg-ivory/60 border border-sage/50 hover:bg-sage/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <span className="text-xs font-semibold text-forest uppercase tracking-wider">Step 1</span>
              <h3 className="text-base font-bold text-charcoal mt-1 group-hover:text-forest">Technologies</h3>
              <p className="text-xs text-muted mt-1">Configure language tracks, categories, icons, and order.</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-forest">
              <span>Manage Tracks</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/teacher/modules"
            className="p-5 rounded-2xl bg-ivory/60 border border-sage/50 hover:bg-sage/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <span className="text-xs font-semibold text-forest uppercase tracking-wider">Step 2</span>
              <h3 className="text-base font-bold text-charcoal mt-1 group-hover:text-forest">Modules</h3>
              <p className="text-xs text-muted mt-1">Group technical concepts into progressive learning modules.</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-forest">
              <span>Manage Modules</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/teacher/notes"
            className="p-5 rounded-2xl bg-ivory/60 border border-sage/50 hover:bg-sage/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <span className="text-xs font-semibold text-forest uppercase tracking-wider">Step 3</span>
              <h3 className="text-base font-bold text-charcoal mt-1 group-hover:text-forest">Concept Notes</h3>
              <p className="text-xs text-muted mt-1">Rich-text definitions, analogies, code snippets, and outputs.</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-forest">
              <span>Author Notes</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/teacher/quizzes"
            className="p-5 rounded-2xl bg-ivory/60 border border-sage/50 hover:bg-sage/20 transition-all flex flex-col justify-between group"
          >
            <div>
              <span className="text-xs font-semibold text-forest uppercase tracking-wider">Step 4</span>
              <h3 className="text-base font-bold text-charcoal mt-1 group-hover:text-forest">Quiz Engine</h3>
              <p className="text-xs text-muted mt-1">MCQs, output predictors, error spotters, and explanation rules.</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-forest">
              <span>Manage Quizzes</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Student Quiz Performance */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage/40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Recent Student Quiz Submissions</h2>
            <p className="text-xs text-muted mt-0.5">Live assessment grades logged from student practice sessions.</p>
          </div>
          <Link to="/teacher/analytics" className="text-xs font-semibold text-forest hover:underline">
            Full Analytics →
          </Link>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted">
            No quiz submissions logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-sage/40 text-muted uppercase text-[11px] tracking-wider">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Quiz Title</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/20">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-ivory/40 transition-colors">
                    <td className="py-3 font-medium text-charcoal">{att.student_name}</td>
                    <td className="py-3 text-muted">{att.quiz_title}</td>
                    <td className="py-3 font-bold text-charcoal">{att.score_percentage}%</td>
                    <td className="py-3">
                      {att.passed ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          <span>Needs Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-muted text-xs">{att.completed_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
