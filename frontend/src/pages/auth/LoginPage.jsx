import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Code2, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('learner_aishu');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoFill = (role) => {
    setError('');
    if (role === 'student') {
      setUsername('learner_aishu');
      setPassword('student123');
    } else if (role === 'teacher') {
      setUsername('teacher_sarah');
      setPassword('teacher123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

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
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo matching reference screenshot */}
        <div className="inline-flex items-center justify-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-forest rounded-2xl flex items-center justify-center text-ivory shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-forest-dark font-serif">
            TechNotes
          </span>
        </div>
        <p className="text-xs uppercase tracking-widest text-muted font-semibold">
          Technical Learning Platform
        </p>
        <div className="mt-2 inline-flex items-center space-x-2 text-xs text-forest bg-sage/60 px-3 py-1 rounded-full font-medium">
          <span>Learn</span>
          <span>•</span>
          <span>Understand</span>
          <span>•</span>
          <span>Practice</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-sage/40">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-charcoal">Sign In to Your Account</h2>
            <p className="text-sm text-muted mt-1">
              Enter your credentials or choose a quick demo account.
            </p>
          </div>

          {/* Quick 1-Click Demo Login */}
          <div className="mb-6 p-3 bg-ivory/80 rounded-2xl border border-sage/50">
            <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">
              Quick 1-Click Demo Login:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-left flex items-center justify-between ${
                  username === 'learner_aishu'
                    ? 'bg-forest text-ivory border-forest shadow-sm'
                    : 'bg-white text-charcoal border-sage/60 hover:bg-sage/20'
                }`}
              >
                <div>
                  <div className="font-bold">Student</div>
                  <div className="text-[10px] opacity-80">learner_aishu</div>
                </div>
                {username === 'learner_aishu' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('teacher')}
                className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all text-left flex items-center justify-between ${
                  username === 'teacher_sarah'
                    ? 'bg-forest text-ivory border-forest shadow-sm'
                    : 'bg-white text-charcoal border-sage/60 hover:bg-sage/20'
                }`}
              >
                <div>
                  <div className="font-bold">Trainer</div>
                  <div className="text-[10px] opacity-80">teacher_sarah</div>
                </div>
                {username === 'teacher_sarah' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>


          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-forest hover:text-forest-dark font-medium underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-forest hover:bg-forest-dark text-ivory font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
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

          <div className="mt-6 pt-6 border-t border-sage/30 text-center space-y-2">
            <p className="text-xs text-muted">
              New to TechNotes?
            </p>
            <div className="flex justify-center text-xs font-semibold">
              <Link to="/register/student" className="text-forest hover:underline">
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
