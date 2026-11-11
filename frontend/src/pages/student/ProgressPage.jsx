import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import Loader from '../../components/common/Loader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  Trophy,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  BarChart3,
  BookOpen,
} from 'lucide-react';

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await progressService.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load progress analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loader message="Generating learning progress analytics..." />;

  const overview = data?.overview || {
    total_concepts: 35,
    completed_concepts: 36,
    pending_concepts: 10,
    overall_progress_rate: 78,
    average_quiz_score: 78.0,
    quizzes_taken: 8,
  };

  const techData = data?.technology_progress || [];
  const performanceHistory = data?.performance_history || [];
  const weakTopics = data?.weak_topics || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal">
          Learning Progress & Analytics
        </h1>
        <p className="text-sm text-muted mt-1">
          Detailed metrics tracking your technical mastery, quiz accuracy, and areas needing revision.
        </p>
      </div>

      {/* Top 4 Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-5 border border-sage/40 shadow-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted">Completed Topics</span>
          </div>
          <div className="text-3xl font-extrabold text-charcoal">{overview.completed_concepts}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Active learning pace</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-sage/40 shadow-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-sage/50 text-forest flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted">Pending Topics</span>
          </div>
          <div className="text-3xl font-extrabold text-charcoal">{overview.pending_concepts}</div>
          <span className="text-[11px] text-muted font-medium">To complete curriculum</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-sage/40 shadow-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted">Avg Quiz Score</span>
          </div>
          <div className="text-3xl font-extrabold text-charcoal">{overview.average_quiz_score}%</div>
          <span className="text-[11px] text-amber-700 font-semibold">{overview.quizzes_taken} Quizzes Attempted</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-sage/40 shadow-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-muted">Curriculum Progress</span>
          </div>
          <div className="text-3xl font-extrabold text-charcoal">{overview.overall_progress_rate}%</div>
          <span className="text-[11px] text-teal-700 font-semibold">On track for mastery</span>
        </div>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technology-wise Progress Bar Chart in Graph Blue */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-card border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-black font-heading">Technology Completion Rate</h2>
              <p className="text-xs text-slate-500 font-roboto">Percentage of concepts completed by technology</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={techData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    color: '#F8FAFC',
                    borderRadius: '0.85rem',
                    border: '1px solid #27272A',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#60A5FA' }}
                />
                <Bar dataKey="completion_percentage" name="Completion" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quiz Performance History Line Chart in Graph Blue */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-card border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-black font-heading">Quiz Performance Trend</h2>
              <p className="text-xs text-slate-500 font-roboto">Score trajectory across recent assessment attempts</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    color: '#F8FAFC',
                    borderRadius: '0.85rem',
                    border: '1px solid #27272A',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score %"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#FA812F', stroke: '#0B0F17', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FA812F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Topics & Revision Recommendations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sage/40 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sage/30">
          <div>
            <h2 className="text-lg font-bold text-charcoal flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Recommended Topics for Revision</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Identified concepts where quiz scores fell below 75%. Reviewing these will solidify your foundation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakTopics.map((wt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {wt.technology}
                </span>
                <h3 className="text-sm font-bold text-charcoal mt-1.5">{wt.title}</h3>
                <p className="text-xs text-muted mt-0.5">Scored: <strong className="text-amber-800">{wt.score}%</strong></p>
              </div>

              <Link
                to={`/learn/python/python-basics/variables`}
                className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-xl flex items-center space-x-1 shadow-xs transition-all flex-shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-sage" />
                <span>Revise Concept</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
