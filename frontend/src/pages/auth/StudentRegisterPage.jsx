import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const StudentRegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await registerStudent(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        setError(Array.isArray(val) ? `${firstKey}: ${val[0]}` : String(val));
      } else {
        setError('Registration failed. Please check your inputs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-forest rounded-2xl flex items-center justify-center text-ivory shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-forest-dark font-serif">
            TechNotes
          </span>
        </div>
        <h2 className="text-xl font-bold text-charcoal">Student Registration</h2>
        <p className="text-xs text-muted mt-1">
          Join thousands of learners mastering IT technologies.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-sage/40">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="e.g. Aishwarya"
                  className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose unique username"
                  className="w-full pl-10 pr-4 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1">
                Bio / Learning Goals (Optional)
              </label>
              <textarea
                name="bio"
                rows="2"
                value={formData.bio}
                onChange={handleChange}
                placeholder="What technologies are you eager to learn?"
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 bg-forest hover:bg-forest-dark text-ivory font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-sage/30 text-center">
            <p className="text-xs text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-forest font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegisterPage;
