import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Code2, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(username, password);
      const role = res.user.role;
      const destination = location.state?.from?.pathname || (role === 'student' ? '/dashboard' : '/teacher/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Invalid username or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFD400] via-[#FF8C00] to-[#FF5F00] rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-[#FF8C00]/30 font-heading">
            S
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-black font-heading">
            SyntaxHawk
          </span>
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold font-roboto">
          Next-Gen Technical Learning Platform
        </p>
        <div className="mt-2 inline-flex items-center space-x-2 text-xs text-[#FF8C00] bg-amber-50 px-3 py-1 rounded-full font-bold font-roboto border border-amber-200">
          <span>Learn</span>
          <span>•</span>
          <span>Understand</span>
          <span>•</span>
          <span>Practice</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-black font-heading">Student Sign In</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-roboto mt-1">
              Enter your student username and password to access your courses and notes.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-red-700 text-sm font-body">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1.5 font-roboto">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:bg-white transition-all text-black"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-black uppercase tracking-wider font-roboto">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#FF8C00] hover:text-[#FF5F00] font-medium font-roboto"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:bg-white transition-all text-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#FFD400] via-[#FF8C00] to-[#FF5F00] hover:brightness-105 text-black font-extrabold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70 font-heading"
            >
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500 font-roboto">
              New to SyntaxHawk?
            </p>
            <div className="flex justify-center text-xs font-semibold font-body">
              <Link to="/register/student" className="text-[#FF8C00] hover:underline">
                Create a Student Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default LoginPage;
