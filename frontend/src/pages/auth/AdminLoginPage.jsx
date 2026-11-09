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
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Administrator Shield Brand Logo */}
        <div className="inline-flex items-center justify-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-forest-dark rounded-2xl flex items-center justify-center text-amber-300 shadow-lg border border-amber-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-forest-dark font-serif">
            TechNotes
          </span>
        </div>
        <div className="mt-1 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest text-amber-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Restricted Faculty & Admin Portal</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-sage/40">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-charcoal">Administrator Sign In</h2>
            <p className="text-sm text-muted mt-1">
              Sign in with your authorized credentials to manage curriculum, notes, and students.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Admin Username
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
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm text-charcoal placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-ivory bg-forest hover:bg-forest-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest shadow-md transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Faculty Access...' : 'Sign In to Admin Panel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-sage/30 text-center">
            <span className="text-[11px] text-muted">
              Student attempting to learn?{' '}
              <a href="/login" className="text-forest font-bold hover:underline">
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
