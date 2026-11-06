import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { BookOpen, Mail, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to process password reset request.');
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
        <h2 className="text-xl font-bold text-charcoal">Forgot Your Password?</h2>
        <p className="text-xs text-muted mt-1">
          Enter your registered email and we'll dispatch password recovery steps.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-sage/40">
          {message && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start space-x-2 text-green-800 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="learner@example.com"
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
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-semibold text-forest hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Login
              </Link>
            </div>
          )}

          {!message && (
            <div className="mt-6 pt-6 border-t border-sage/30 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-muted hover:text-charcoal"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
