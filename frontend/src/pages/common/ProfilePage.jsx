import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      await updateUser(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-card border border-sage/40">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-sage/30">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-forest text-ivory text-3xl font-extrabold flex items-center justify-center shadow-md">
              {user?.first_name ? user.first_name[0] : (user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-charcoal">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </h1>
              <p className="text-sm text-muted">@{user?.username}</p>
              <div className="mt-2 flex items-center justify-center sm:justify-start space-x-2">
                <span className="px-3 py-1 bg-sage/60 text-forest text-xs font-semibold rounded-full uppercase tracking-wider">
                  {user?.role}
                </span>
                {user?.is_approved_teacher && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Approved Educator
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 border border-sage/80 rounded-xl text-xs font-semibold text-forest hover:bg-sage/20 transition-all flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>
        </div>

        {message && (
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                disabled={!isEditing}
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                disabled={!isEditing}
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
                Username (Immutable)
              </label>
              <input
                type="text"
                disabled
                value={user?.username || ''}
                className="w-full px-3.5 py-2.5 bg-lightgrey/80 border border-sage/40 rounded-xl text-sm opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-1.5">
              Bio & Learning Goals
            </label>
            <textarea
              name="bio"
              rows="3"
              disabled={!isEditing}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="w-full px-3.5 py-2.5 bg-lightgrey/50 border border-sage/60 rounded-xl text-sm disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-forest resize-none"
            ></textarea>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-sage/30">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-forest hover:bg-forest-dark text-ivory rounded-xl text-xs font-semibold shadow-md disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
