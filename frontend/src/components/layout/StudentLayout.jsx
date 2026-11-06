import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  PlayCircle,
  Sparkles,
  Bookmark,
  BarChart3,
  User,
  LogOut,
  Search,
  Bell,
  BookOpen,
  Menu,
  X,
  Shield,
} from 'lucide-react';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Technologies', path: '/technologies', icon: Layers },
    { name: 'My Learning', path: '/my-learning', icon: PlayCircle },
    { name: 'AI Tutor', path: '/ai-tutor', icon: Sparkles, badge: 'AI' },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'Progress', path: '/progress', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/technologies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Forest Green Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-forest-dark text-ivory flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header matching Screenshot */}
          <div className="p-6 flex items-center justify-between border-b border-forest-border/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center text-ivory border border-sage/30 shadow-sm">
                <BookOpen className="w-5 h-5 text-sage" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white font-serif">
                  TechNotes
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-sage/70 font-semibold">
                  Learning Platform
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
                    `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-forest text-white shadow-sm font-semibold border-l-4 border-sage'
                        : 'text-sage/80 hover:bg-forest/60 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-sage/20 text-sage rounded-full border border-sage/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            {/* Quick Switch to Teacher Panel if User is Educator / Admin */}
            {(user?.role === 'teacher' || user?.role === 'admin') && (
              <NavLink
                to="/teacher/dashboard"
                className="flex items-center space-x-3 px-4 py-3 mt-4 rounded-2xl text-xs font-semibold text-amber-200 bg-amber-950/40 border border-amber-600/30 hover:bg-amber-900/40"
              >
                <Shield className="w-4 h-4" />
                <span>Educator Panel →</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="p-4 border-t border-forest-border/40">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-forest/50 border border-sage/20 mb-3">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-sage text-forest-dark font-bold text-xs flex items-center justify-center flex-shrink-0">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </p>
                <p className="text-[10px] text-sage/70 capitalize truncate">{user?.role || 'Learner'}</p>
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
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-sage/40">
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-charcoal hover:bg-sage/30"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, technologies..."
                className="w-full pl-10 pr-4 py-2 bg-white/80 border border-sage/60 rounded-2xl text-xs sm:text-sm text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white shadow-sm transition-all"
              />
            </form>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3 ml-4">
            <button
              title="Notifications"
              className="p-2.5 rounded-2xl bg-white border border-sage/50 text-charcoal hover:text-forest hover:bg-sage/20 shadow-sm transition-all relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-forest absolute top-2 right-2"></span>
            </button>

            <NavLink
              to="/profile"
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white border border-sage/50 hover:border-forest shadow-sm transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-forest text-ivory text-xs font-bold flex items-center justify-center">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-charcoal">
                {user?.first_name || user?.username}
              </span>
            </NavLink>
          </div>
        </header>

        {/* Dynamic Outlet Pages */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
