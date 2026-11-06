import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import { Plus, Edit2, Trash2, CheckCircle2, Layers, AlertCircle, X } from 'lucide-react';

const ManageTechnologiesPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    badge_color: '#244C35',
    icon_name: 'code',
    is_popular: false,
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [techRes, catRes] = await Promise.all([
        contentService.getTechnologies(),
        contentService.getCategories(),
      ]);
      setTechnologies(techRes);
      setCategories(catRes);
      if (catRes.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: catRes[0].id }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load technologies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (tech = null) => {
    setError('');
    setSuccess('');
    if (tech) {
      setEditingId(tech.id);
      setFormData({
        name: tech.name,
        category: tech.category,
        description: tech.description || '',
        badge_color: tech.badge_color || '#244C35',
        icon_name: tech.icon_name || 'code',
        is_popular: tech.is_popular,
        is_active: tech.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: categories[0]?.id || '',
        description: '',
        badge_color: '#244C35',
        icon_name: 'code',
        is_popular: false,
        is_active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await contentService.updateTechnology(editingId, formData);
        setSuccess('Technology updated successfully!');
      } else {
        await contentService.createTechnology(formData);
        setSuccess('Technology created successfully!');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Error saving technology.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technology and its modules?')) return;
    try {
      await contentService.deleteTechnology(id);
      setSuccess('Technology deleted successfully.');
      loadData();
    } catch (err) {
      setError('Failed to delete technology.');
    }
  };

  if (loading) return <Loader message="Loading technologies catalog..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Technologies Management</h1>
          <p className="text-xs text-muted mt-0.5">Add and manage curriculum technologies and categories.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Technology</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Technologies Table */}
      <div className="bg-white rounded-3xl shadow-card border border-sage/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-ivory/60 border-b border-sage/40 text-muted uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-6 font-semibold">Technology</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Modules</th>
                <th className="py-3 px-4 font-semibold">Concepts</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/20">
              {technologies.map((t) => (
                <tr key={t.id} className="hover:bg-ivory/30 transition-colors">
                  <td className="py-3 px-6 font-bold text-charcoal">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center text-forest text-xs font-mono font-bold">
                        {t.name[0]}
                      </div>
                      <span>{t.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted">{t.category_name}</td>
                  <td className="py-3 px-4 text-charcoal font-semibold">{t.total_modules}</td>
                  <td className="py-3 px-4 text-charcoal font-semibold">{t.total_concepts}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(t)}
                        className="p-1.5 rounded-lg hover:bg-sage/30 text-forest"
                        title="Edit Technology"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        title="Delete Technology"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-dropdown border border-sage/60 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-sage/30">
              <h2 className="text-base font-bold text-charcoal">
                {editingId ? 'Edit Technology' : 'Add New Technology'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Technology Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Python, React, PostgreSQL"
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of this learning track..."
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                ></textarea>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="rounded text-forest focus:ring-forest"
                  />
                  <span>Featured / Popular</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-sage/30">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-sage/60 rounded-xl text-xs font-semibold text-charcoal hover:bg-lightgrey"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest hover:bg-forest-dark text-ivory rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save Technology
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTechnologiesPage;
