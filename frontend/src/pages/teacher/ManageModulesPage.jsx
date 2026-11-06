import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, FolderTree } from 'lucide-react';

const ManageModulesPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    technology: '',
    description: '',
    order: 1,
  });

  const loadTechs = async () => {
    try {
      const techs = await contentService.getTechnologies();
      setTechnologies(techs);
      if (techs.length > 0 && !selectedTech) {
        setSelectedTech(techs[0].slug);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadModules = async () => {
    if (!selectedTech) return;
    try {
      setLoading(true);
      const mods = await contentService.getModules(selectedTech);
      setModules(mods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechs();
  }, []);

  useEffect(() => {
    loadModules();
  }, [selectedTech]);

  const handleOpenModal = (mod = null) => {
    setError('');
    setSuccess('');
    const currentTechObj = technologies.find((t) => t.slug === selectedTech);
    if (mod) {
      setEditingId(mod.id);
      setFormData({
        title: mod.title,
        technology: mod.technology,
        description: mod.description || '',
        order: mod.order || 1,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        technology: currentTechObj?.id || '',
        description: '',
        order: modules.length + 1,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await contentService.updateModule(editingId, formData);
        setSuccess('Module updated successfully!');
      } else {
        await contentService.createModule(formData);
        setSuccess('Module created successfully!');
      }
      setModalOpen(false);
      loadModules();
    } catch (err) {
      setError('Error saving module. Please check fields.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this module and all its child concepts?')) return;
    try {
      await contentService.deleteModule(id);
      setSuccess('Module deleted.');
      loadModules();
    } catch (err) {
      setError('Failed to delete module.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Modules Management</h1>
          <p className="text-xs text-muted mt-0.5">Organize concepts into structured sequential learning blocks.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Module</span>
        </button>
      </div>

      {/* Technology Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 bg-white p-3 rounded-2xl border border-sage/40">
        <span className="text-xs font-bold text-muted uppercase tracking-wider pl-2 pr-1">Filter Track:</span>
        {technologies.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTech(t.slug)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTech === t.slug
                ? 'bg-forest text-ivory shadow-xs'
                : 'bg-ivory text-muted hover:text-charcoal'
            }`}
          >
            {t.name}
          </button>
        ))}
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

      {loading ? (
        <Loader message="Loading modules for selected track..." />
      ) : modules.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-sage/40 text-center text-sm text-muted">
          No modules created for this technology yet. Click "Create Module" to start structuring.
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-sage/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-ivory/60 border-b border-sage/40 text-muted uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Module Title</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Concepts</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/20">
                {modules.map((m) => (
                  <tr key={m.id} className="hover:bg-ivory/30 transition-colors">
                    <td className="py-3 px-6 font-mono font-bold text-forest">#{m.order}</td>
                    <td className="py-3 px-4 font-bold text-charcoal">{m.title}</td>
                    <td className="py-3 px-4 text-muted text-xs line-clamp-1">{m.description || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-charcoal">{m.total_concepts} Concepts</td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(m)}
                          className="p-1.5 rounded-lg hover:bg-sage/30 text-forest"
                          title="Edit Module"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete Module"
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
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-dropdown border border-sage/60 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-sage/30">
              <h2 className="text-base font-bold text-charcoal">
                {editingId ? 'Edit Module' : 'Create Module'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Technology Track
                </label>
                <select
                  value={formData.technology}
                  onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  {technologies.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Module Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Python Basics, Data Structures"
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what this module covers..."
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                ></textarea>
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
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageModulesPage;
