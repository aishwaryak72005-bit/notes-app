import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  Layers,
  CheckCircle2,
  Trophy,
  BarChart3,
  ArrowRight,
  Code2,
  Terminal,
  Database,
  Cpu,
  Brain,
  Sparkles,
  ChevronRight,
  PlayCircle,
  FileCode,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await contentService.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        setError('Failed to load dashboard data. Please verify the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getTechIcon = (techName) => {
    const name = techName.toLowerCase();
    if (name.includes('python')) return <Terminal className="w-6 h-6 text-blue-500" />;
    if (name.includes('javascript') || name.includes('js')) return <FileCode className="w-6 h-6 text-yellow-500" />;
    if (name.includes('react')) return <Code2 className="w-6 h-6 text-cyan-500" />;
    if (name.includes('django')) return <Layers className="w-6 h-6 text-emerald-600" />;
    if (name.includes('sql') || name.includes('mysql') || name.includes('postgres')) return <Database className="w-6 h-6 text-blue-600" />;
    if (name.includes('machine') || name.includes('deep') || name.includes('ai')) return <Brain className="w-6 h-6 text-purple-600" />;
    if (name.includes('llm') || name.includes('nlp')) return <Sparkles className="w-6 h-6 text-indigo-500" />;
    return <Code2 className="w-6 h-6 text-forest" />;
  };

  if (loading) {
    return <Loader message="Loading your personalized learning dashboard..." />;
  }

  const stats = data?.stats || {
    technologies_available: 16,
    topics_completed: 36,
    quizzes_attempted: 8,
    overall_score: 78,
  };

  const continueLearning = data?.continue_learning || {
    technology_name: 'Python',
    technology_slug: 'python',
    module_title: 'Python Basics',
    concept_title: 'Variables',
    completion_percentage: 45,
  };

  const technologies = data?.technologies || [];
  const categories = ['All', ...new Set(technologies.map((t) => t.category))];

  const filteredTechnologies = selectedCategory === 'All'
    ? technologies.slice(0, 8)
    : technologies.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Welcome Section matching Reference Mockup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            Welcome Back, {user?.first_name || 'Learner'}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-muted mt-1">
            Continue your learning journey and strengthen your technical skills.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/ai-tutor"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-forest text-ivory text-xs font-semibold shadow-md hover:bg-forest-dark transition-all"
          >
            <Sparkles className="w-4 h-4 text-sage" />
            <span>Ask AI Learning Assistant</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Technologies Card */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-sage/40 flex items-center space-x-4 hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              {stats.technologies_available}
            </div>
            <div className="text-xs font-medium text-muted">Technologies</div>
          </div>
        </div>

        {/* Topics Completed Card */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-sage/40 flex items-center space-x-4 hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              {stats.topics_completed}
            </div>
            <div className="text-xs font-medium text-muted">Topics Completed</div>
          </div>
        </div>

        {/* Quizzes Taken Card */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-sage/40 flex items-center space-x-4 hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              {stats.quizzes_attempted}
            </div>
            <div className="text-xs font-medium text-muted">Quizzes Taken</div>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-sage/40 flex items-center space-x-4 hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-charcoal">
              {stats.overall_score}%
            </div>
            <div className="text-xs font-medium text-muted">Overall Score</div>
          </div>
        </div>
      </div>

      {/* 3. Explore Technologies Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-sage/30">
          <div>
            <h2 className="text-lg font-bold text-charcoal">Explore Technologies</h2>
            <p className="text-xs text-muted mt-0.5">
              Structured concept notes, code examples and interactive practice quizzes.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Category Filter Pills */}
            <div className="hidden md:flex items-center space-x-1.5 p-1 bg-ivory rounded-2xl border border-sage/40">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-forest text-ivory shadow-xs font-semibold'
                      : 'text-muted hover:text-charcoal hover:bg-white/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Link
              to="/technologies"
              className="text-xs font-semibold text-forest hover:text-forest-dark flex items-center space-x-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Technologies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mt-6">
          {filteredTechnologies.map((tech) => (
            <div
              key={tech.id}
              onClick={() => navigate(`/technologies/${tech.slug}`)}
              className="group p-5 rounded-2xl bg-ivory/50 border border-sage/60 hover:border-forest/50 hover:bg-white hover:shadow-card transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white border border-sage/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  {getTechIcon(tech.name)}
                </div>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sage/40 text-forest border border-sage/60">
                  {tech.category}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-charcoal group-hover:text-forest transition-colors">
                  {tech.name}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {tech.total_concepts || 20} Topics • {tech.total_modules || 5} Modules
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-sage/30 flex items-center justify-between text-xs text-forest font-semibold">
                <span>Start Learning</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Row: Continue Learning & Your Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Widget (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-sage/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-charcoal">Continue Learning</h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 text-[11px] font-semibold rounded-full border border-amber-200">
                In Progress
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-ivory/70 border border-sage/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal">
                    {continueLearning.module_title}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    Next Concept: <strong className="text-forest">{continueLearning.concept_title}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right sm:block hidden">
                  <span className="text-xs font-bold text-forest">
                    {continueLearning.completion_percentage}%
                  </span>
                  <div className="w-24 h-2 bg-sage/40 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-forest rounded-full"
                      style={{ width: `${continueLearning.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>

                <Link
                  to={`/learn/python/python-basics/variables`}
                  className="w-10 h-10 rounded-2xl bg-forest hover:bg-forest-dark text-ivory flex items-center justify-center shadow-md transition-all group"
                  title="Resume Study Session"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted pt-3 border-t border-sage/30">
            <span>Last reviewed: 2 hours ago</span>
            <Link to="/my-learning" className="text-forest font-semibold hover:underline">
              View All Enrolled Courses →
            </Link>
          </div>
        </div>

        {/* Your Progress Widget (1 col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-sage/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-charcoal">Your Progress</h2>
              <Link to="/progress" className="text-xs text-forest font-semibold hover:underline">
                Details →
              </Link>
            </div>

            <div className="flex items-center space-x-6 py-2">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-sage/40"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-forest transition-all duration-1000 ease-out"
                    strokeDasharray="78, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-charcoal">78%</span>
                </div>
              </div>

              {/* Progress Legend matching Reference Mockup */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-forest"></span>
                  <span className="text-xs font-medium text-charcoal">
                    Completed Topics ({stats.topics_completed})
                  </span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="w-3 h-3 rounded-full bg-sage"></span>
                  <span className="text-xs font-medium text-muted">
                    Pending Topics (10)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sage/30">
            <Link
              to="/progress"
              className="w-full py-2 bg-ivory hover:bg-sage/40 text-forest text-xs font-semibold rounded-xl text-center block transition-all border border-sage/50"
            >
              Analyze Learning Curve & Weak Spots
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
