import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(username, password);
      const role = res.user?.role;

      if (role !== 'admin' && role !== 'teacher') {
        logout();
        setError('Access Denied: Only authorized administrators and trainers can access this portal.');
        setIsLoading(false);
        return;
      }

      const destination = location.state?.from?.pathname || '/teacher/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid administrative credentials. Please verify your username and password.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Administrator Shield Brand Logo */}
        <div className="inline-flex items-center justify-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20 border border-brand/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Syntax<span className="text-brand">Hawk</span>
          </span>
        </div>
        <div className="mt-1 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-brand/30 text-brand text-xs font-small font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Restricted Faculty & Admin Portal</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111827] py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white font-heading">Administrator Sign In</h2>
            <p className="text-sm text-gray-400 mt-1 font-sans">
              Sign in with your authorized credentials to manage curriculum, notes, and students.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-2 text-red-400 text-xs font-small font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 font-small">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#181924] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 font-small">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#181924] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand/40 transition-all font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand shadow-lg shadow-brand/20 transition-all disabled:opacity-50 font-heading"
            >
              <span>{isLoading ? 'Verifying Faculty Access...' : 'Sign In to Admin Panel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <span className="text-[11px] text-gray-400 font-small">
              Student attempting to learn?{' '}
              <a href="/login" className="text-brand font-bold hover:underline">
                Go to Student Portal
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
