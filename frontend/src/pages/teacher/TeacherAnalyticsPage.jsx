import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle2, Award } from 'lucide-react';

const TeacherAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await contentService.getTeacherDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader message="Compiling educator analytics..." />;

  const categoryDistribution = [
    { name: 'Programming', value: 3, color: '#2563EB' },
    { name: 'Frontend', value: 4, color: '#3B82F6' },
    { name: 'Backend', value: 2, color: '#1D4ED8' },
    { name: 'Database', value: 3, color: '#60A5FA' },
    { name: 'AI & ML', value: 4, color: '#FFBF00' },
  ];

  const studentPerformance = [
    { gradeRange: '90-100%', count: 12 },
    { gradeRange: '75-89%', count: 24 },
    { gradeRange: '60-74%', count: 8 },
    { gradeRange: '< 60%', count: 3 },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black font-heading">
          Curriculum & Student Analytics
        </h1>
        <p className="text-sm text-slate-500 font-roboto mt-1">
          Detailed overview of curriculum coverage, student assessment outcomes, and grade distributions.
        </p>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Chart */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-card border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-black font-heading">Student Quiz Score Distribution</h2>
              <p className="text-xs text-slate-500 font-roboto">Number of students falling into each performance tier</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="gradeRange" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="count" name="Students" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Curriculum Coverage Pie Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-sage/40 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sage/30">
            <div>
              <h2 className="text-base font-bold text-charcoal">Curriculum by Domain Category</h2>
              <p className="text-xs text-muted">Distribution of published tracks across computing disciplines</p>
            </div>
            <Award className="w-5 h-5 text-forest" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#153B2A',
                    color: '#F7F3E9',
                    borderRadius: '1rem',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F7F3E9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {categoryDistribution.map((c, i) => (
              <div key={i} className="flex items-center space-x-1.5 text-xs text-muted font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></span>
                <span>{c.name} ({c.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsPage;
