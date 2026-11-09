import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { aiService } from '../../services/aiService';
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
  Megaphone,
  Radio,
  Sparkles,
  Send,
  Trash2,
  Lightbulb,
} from 'lucide-react';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [doubtRadar, setDoubtRadar] = useState(null);
  const [loading, setLoading] = useState(true);

  // New announcement form state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, annRes, radarRes] = await Promise.allSettled([
        contentService.getTeacherDashboard(),
        contentService.getAnnouncements(),
        aiService.getDoubtRadar(),
      ]);

      if (dashRes.status === 'fulfilled') setData(dashRes.value);
      if (annRes.status === 'fulfilled') setAnnouncements(annRes.value || []);
      if (radarRes.status === 'fulfilled') setDoubtRadar(radarRes.value || null);
    } catch (err) {
      console.error('Failed to load trainer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementMsg.trim()) return;

    try {
      setPostingAnnouncement(true);
      const created = await contentService.createAnnouncement({
        title: announcementTitle.trim(),
        message: announcementMsg.trim(),
        is_active: true,
      });
      setAnnouncements([created, ...announcements]);
      setAnnouncementTitle('');
      setAnnouncementMsg('');
    } catch (err) {
      console.error('Failed to broadcast announcement:', err);
      alert('Could not publish announcement. Please try again.');
    } finally {
      setPostingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Remove this announcement?')) return;
    try {
      await contentService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  if (loading) {
    return <Loader message="Loading Trainer Command Center..." />;
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
      {/* Trainer Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-forest-dark font-serif">
              Trainer Command Center
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
              Solo Studio
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Publish high-impact curriculum, broadcast updates to enrolled learners, and track live doubt trends.
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
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Quiz Generator</span>
          </Link>
          <Link
            to="/teacher/students"
            className="px-4 py-2 bg-white border border-sage/60 hover:bg-sage/20 text-charcoal text-xs font-semibold rounded-2xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Users className="w-4 h-4 text-forest" />
            <span>Student Roster</span>
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

      {/* Broadcast Announcement & Student Doubt Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Announcement Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-sage/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-charcoal">Broadcast Announcements</h2>
                  <p className="text-xs text-muted">Instantly appears on all student learning dashboards</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-forest bg-sage/40 px-2.5 py-1 rounded-full">
                {announcements.length} Active
              </span>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="Announcement Title (e.g. 🚀 Master React Hooks this weekend!)"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                required
              />
              <textarea
                rows="2"
                placeholder="Broadcast message or daily tip for students..."
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                required
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={postingAnnouncement}
                  className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postingAnnouncement ? 'Broadcasting...' : 'Broadcast to All Students'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-sage/30 pt-4 space-y-2.5 max-h-56 overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="text-xs text-muted text-center py-2">No active announcements yet.</p>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 bg-ivory/50 rounded-2xl border border-sage/40 flex items-start justify-between gap-2"
                >
                  <div>
                    <h4 className="text-xs font-bold text-forest-dark">{ann.title}</h4>
                    <p className="text-xs text-charcoal/80 mt-0.5">{ann.message}</p>
                    <span className="text-[10px] text-muted">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 text-muted hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Student Doubt Radar (Instagram Content & Lesson Generator) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-sage/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-charcoal">Student Doubt Radar</h2>
                  <p className="text-xs text-muted">Questions asked to AI Tutor — instant Instagram Reel & lesson ideas!</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Insights
              </span>
            </div>

            {/* Top Trending Concept Queries */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                Most Asked Concepts This Week:
              </span>
              <div className="flex flex-wrap gap-2">
                {doubtRadar?.top_concepts && doubtRadar.top_concepts.length > 0 ? (
                  doubtRadar.top_concepts.map((tc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-ivory border border-sage/50 text-forest-dark rounded-xl text-xs font-medium"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>{tc.concept__title}</span>
                      <span className="text-[10px] bg-sage/60 px-1.5 py-0.5 rounded-full font-bold">
                        {tc.query_count}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted">No student questions logged yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-sage/30 pt-4">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
              Recent Student Queries:
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {doubtRadar?.recent_queries && doubtRadar.recent_queries.length > 0 ? (
                doubtRadar.recent_queries.slice(0, 4).map((q) => (
                  <div key={q.id} className="p-2.5 bg-ivory/50 rounded-xl border border-sage/40 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-muted mb-1">
                      <span className="font-semibold text-forest-dark">{q.student_name}</span>
                      <span>{q.concept_title}</span>
                    </div>
                    <p className="text-charcoal italic">"{q.content}"</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted text-center py-2">
                  Student questions will appear here once learners chat with the AI Tutor.
                </p>
              )}
            </div>
          </div>
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
