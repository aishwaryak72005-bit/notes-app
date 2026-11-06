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
    { name: 'Programming', value: 3, color: '#244C35' },
    { name: 'Frontend', value: 4, color: '#336148' },
    { name: 'Backend', value: 2, color: '#528268' },
    { name: 'Database', value: 3, color: '#74A58C' },
    { name: 'AI & ML', value: 4, color: '#B8CEB3' },
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-dark">
          Curriculum & Student Analytics
        </h1>
        <p className="text-sm text-muted mt-1">
          Detailed overview of curriculum coverage, student assessment outcomes, and grade distributions.
        </p>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-card border border-sage/40 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-sage/30">
            <div>
              <h2 className="text-base font-bold text-charcoal">Student Quiz Score Distribution</h2>
              <p className="text-xs text-muted">Number of students falling into each performance tier</p>
            </div>
            <BarChart3 className="w-5 h-5 text-forest" />
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3EF" vertical={false} />
                <XAxis dataKey="gradeRange" tick={{ fontSize: 11, fill: '#737B72' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#737B72' }} axisLine={false} tickLine={false} />
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
                <Bar dataKey="count" name="Students" fill="#244C35" radius={[8, 8, 0, 0]} />
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
