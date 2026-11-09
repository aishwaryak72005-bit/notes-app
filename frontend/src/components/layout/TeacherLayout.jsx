import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  FileCode,
  FileText,
  HelpCircle,
  Users,
  BarChart,
  User,
  LogOut,
  ShieldCheck,
  BookOpen,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

const TeacherLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Upload Materials', path: '/teacher/notes', icon: UploadCloud, badge: 'ZIP' },
    { name: 'Study Materials', path: '/teacher/notes', icon: FileText },
    { name: 'AI-Generated Content', path: '/teacher/ai-content', icon: Sparkles, badge: 'AI' },
    { name: 'Questions & Quizzes', path: '/teacher/quizzes', icon: HelpCircle },
    { name: 'Students', path: '/teacher/students', icon: Users },
    { name: 'Analytics & Reports', path: '/teacher/analytics', icon: BarChart },
    { name: 'Curriculum Tree', path: '/teacher/technologies', icon: Layers },
    { name: 'Settings / Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Teacher Forest-Green Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-forest-dark text-ivory flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Educator Brand Header */}
          <div className="p-6 flex items-center justify-between border-b border-forest-border/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-ivory border border-sage/30 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white font-serif">
                  TechNotes
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                  Trainer Studio
                </span>
              </div>

            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-sage hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-forest text-white shadow-sm font-semibold border-l-4 border-amber-300'
                        : 'text-sage/80 hover:bg-forest/60 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-sage" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}

            {/* Quick Switch to Student View */}
            <NavLink
              to="/dashboard"
              className="flex items-center space-x-3 px-4 py-2.5 mt-4 rounded-2xl text-xs font-semibold text-sage bg-forest/40 border border-sage/20 hover:bg-forest/70"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Preview Student View →</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-forest-border/40">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-forest/50 border border-sage/20 mb-3">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-forest-dark font-bold text-xs flex items-center justify-center flex-shrink-0">
                {(user?.first_name?.[0] || user?.username?.[0] || 'T').toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </p>
                <p className="text-[10px] text-amber-200/90 font-medium capitalize truncate">
                  Solo Lead Trainer
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-medium text-sage/80 hover:text-white hover:bg-forest/60 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-sage/40">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-sage/30"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-forest-dark">Trainer Studio & Course Management</h2>
          </div>

          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">
              Trainer Studio
            </span>
          </div>

        </header>

        <main className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
