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
  Menu,
  X,
  GraduationCap,
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
    <div className="min-h-screen bg-[#FAFAF9] flex">
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Sticky Obsidian Black & Amber Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 sm:w-68 h-screen bg-[#0B0F17] text-zinc-100 flex flex-col justify-between border-r border-[#1E202E] transition-transform duration-200 ease-in-out shadow-2xl lg:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Educator Brand Header - Fixed at Top */}
        <div className="p-5 sm:p-6 flex-shrink-0 flex items-center justify-between border-b border-[#1E202E]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFE28A] via-[#FFBF00] to-[#D97706] flex items-center justify-center text-black font-extrabold shadow-md shadow-[#FFBF00]/30">
              <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-heading">
                Syntax<span className="text-[#FFBF00]">Hawk</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-[#FFBF00] font-bold font-roboto">
                Trainer Studio
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1E202E] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items - Scrollable Middle Area */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <nav className="p-3 sm:p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#FFBF00]/15 text-[#FFBF00] font-bold border-l-4 border-[#FFBF00] shadow-xs shadow-[#FFBF00]/10'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-[#FFBF00]'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0 transition-colors" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[#FFBF00]/20 text-[#FFBF00] rounded-full border border-[#FFBF00]/30 font-roboto">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {/* Quick Switch to Student View */}
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3.5 py-2.5 mt-4 rounded-2xl text-xs font-semibold text-zinc-300 bg-[#181924] border border-[#27272A] hover:bg-[#222332] hover:text-[#FFBF00] hover:border-[#FFBF00]/40 transition-all"
            >
              <GraduationCap className="w-4 h-4 text-[#FFBF00]" />
              <span>Preview Student View →</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer - Pinned at Bottom */}
        <div className="p-4 flex-shrink-0 border-t border-[#1E202E]">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#181924] border border-[#27272A] mb-3">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFE28A] via-[#FFBF00] to-[#D97706] text-black font-extrabold text-xs flex items-center justify-center flex-shrink-0 font-heading shadow-xs shadow-[#FFBF00]/20">
                {(user?.first_name?.[0] || user?.username?.[0] || 'T').toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate font-body">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </p>
                <p className="text-[10px] text-[#FFBF00] font-roboto font-medium capitalize truncate">
                  Solo Lead Trainer
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-xs font-medium text-zinc-400 hover:text-[#FFBF00] hover:bg-white/5 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Offset on desktop to account for fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 sm:lg:pl-68">
        <header className="sticky top-0 z-30 bg-[#FAFAF9]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-black hover:bg-slate-200 transition-colors"
              aria-label="Open trainer navigation menu"
            >
              <Menu className="w-5 h-5 text-black" />
            </button>

            {/* Mobile Brand Name */}
            <span className="lg:hidden font-extrabold text-base font-heading text-black tracking-tight flex items-center space-x-1.5 mr-1">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FFE28A] via-[#FFBF00] to-[#D97706] text-black flex items-center justify-center text-xs font-black">S</span>
              <span className="hidden xs:inline">SyntaxHawk</span>
            </span>

            <h2 className="text-xs sm:text-base font-bold text-black font-heading truncate">
              Trainer Studio & Management
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 ml-2">
            <span className="px-2.5 sm:px-3 py-1 bg-[#FFBF00]/15 text-black font-bold text-[10px] sm:text-xs rounded-full border border-[#FFBF00]/30 font-roboto whitespace-nowrap">
              Trainer Studio
            </span>
          </div>
        </header>

        <main className="p-3.5 sm:p-5 md:p-8 flex-1 max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
