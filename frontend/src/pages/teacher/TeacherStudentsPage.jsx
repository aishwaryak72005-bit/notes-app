import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import Loader from '../../components/common/Loader';
import { Users, Mail, Calendar, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

const TeacherStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await authService.getStudents();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <Loader message="Loading registered student roster..." />;

  const filtered = students.filter(
    (s) =>
      s.username.toLowerCase().includes(search.toLowerCase()) ||
      (s.first_name && s.first_name.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Student Management Roster</h1>
          <p className="text-xs text-muted mt-0.5">Monitor registered learners, activity progress, and performance standing.</p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full px-3.5 py-2 bg-white border border-sage/60 rounded-xl text-xs text-charcoal shadow-xs focus:outline-none focus:ring-2 focus:ring-forest"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-sage/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-ivory/60 border-b border-sage/40 text-muted uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-6 font-semibold">Student Name</th>
                <th className="py-3 px-4 font-semibold">Username</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Learning Bio</th>
                <th className="py-3 px-4 font-semibold">Enrolled</th>
                <th className="py-3 px-6 font-semibold text-right">Academic Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/20">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-ivory/30 transition-colors">
                  <td className="py-3 px-6 font-bold text-charcoal">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-forest text-ivory flex items-center justify-center font-bold text-xs">
                        {(s.first_name?.[0] || s.username?.[0] || 'S').toUpperCase()}
                      </div>
                      <span>{s.first_name ? `${s.first_name} ${s.last_name}` : s.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted">@{s.username}</td>
                  <td className="py-3 px-4 text-muted">{s.email}</td>
                  <td className="py-3 px-4 text-xs text-muted max-w-xs truncate">{s.bio || 'General Learner'}</td>
                  <td className="py-3 px-4 text-xs text-muted">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Active'}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                      Good Progress (78%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentsPage;
