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
    <div className="min-h-screen bg-[#090A0F] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFE28A] via-[#FFBF00] to-[#D97706] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#FFBF00]/30 border border-[#FFE28A]/40">
            <BookOpen className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Syntax<span className="text-[#FFBF00]">Hawk</span>
          </span>
        </div>
        <h2 className="text-xl font-bold text-white font-heading">Forgot Your Password?</h2>
        <p className="text-xs text-gray-400 mt-1 font-sans">
          Enter your registered email and we'll dispatch password recovery steps.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111827] py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl">
          {message && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start space-x-2 text-emerald-400 text-sm font-roboto">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-2 text-red-400 text-sm font-roboto">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 font-roboto">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="learner@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#181924] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFBF00] focus:border-[#FFBF00]/40 transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#FFE28A] via-[#FFBF00] to-[#D97706] hover:opacity-95 text-black font-extrabold rounded-xl text-sm shadow-lg shadow-[#FFBF00]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-70 font-heading cursor-pointer"
              >
                {isLoading ? (
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-semibold text-[#FFBF00] hover:underline font-heading"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Login
              </Link>
            </div>
          )}

          {!message && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-[#FFBF00] font-roboto"
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
