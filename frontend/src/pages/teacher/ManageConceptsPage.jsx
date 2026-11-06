import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import Loader from '../../components/common/Loader';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, FileText, ArrowRight } from 'lucide-react';

const ManageConceptsPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    module: '',
    order: 1,
    difficulty_level: 'beginner',
    estimated_minutes: 10,
    summary: '',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const techs = await contentService.getTechnologies();
        setTechnologies(techs);
        if (techs.length > 0) {
          setSelectedTech(techs[0].slug);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const fetchMods = async () => {
      if (!selectedTech) return;
      try {
        const mods = await contentService.getModules(selectedTech);
        setModules(mods);
        if (mods.length > 0) {
          setSelectedModule(mods[0].id);
        } else {
          setSelectedModule('');
          setConcepts([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMods();
  }, [selectedTech]);

  const loadConcepts = async () => {
    if (!selectedModule) {
      setConcepts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await contentService.getConcepts({ module_id: selectedModule });
      setConcepts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConcepts();
  }, [selectedModule]);

  const handleOpenModal = (conc = null) => {
    setError('');
    setSuccess('');
    if (conc) {
      setEditingId(conc.id);
      setFormData({
        title: conc.title,
        module: conc.module,
        order: conc.order || 1,
        difficulty_level: conc.difficulty_level || 'beginner',
        estimated_minutes: conc.estimated_minutes || 10,
        summary: conc.summary || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        module: selectedModule,
        order: concepts.length + 1,
        difficulty_level: 'beginner',
        estimated_minutes: 10,
        summary: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await contentService.updateConcept(editingId, formData);
        setSuccess('Concept updated successfully!');
      } else {
        await contentService.createConcept(formData);
        setSuccess('Concept created successfully!');
      }
      setModalOpen(false);
      loadConcepts();
    } catch (err) {
      setError('Error saving concept. Please check fields.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this concept and its associated notes and quizzes?')) return;
    try {
      await contentService.deleteConcept(id);
      setSuccess('Concept deleted.');
      loadConcepts();
    } catch (err) {
      setError('Failed to delete concept.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Concepts Management</h1>
          <p className="text-xs text-muted mt-0.5">Manage learning topics, duration, and difficulty ratings.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={!selectedModule}
          className="px-4 py-2 bg-forest hover:bg-forest-dark text-ivory text-xs font-semibold rounded-2xl shadow-sm flex items-center space-x-1.5 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Concept</span>
        </button>
      </div>

      {/* Selectors for Tech & Module */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-3xl border border-sage/40 shadow-card">
        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
            Technology Track
          </label>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
          >
            {technologies.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
            Curriculum Module
          </label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-3 py-2 bg-ivory/60 border border-sage/60 rounded-xl text-xs sm:text-sm font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                #{m.order}: {m.title}
              </option>
            ))}
          </select>
        </div>
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
        <Loader message="Loading module concepts..." />
      ) : concepts.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-sage/40 text-center text-sm text-muted">
          No concepts found inside this module. Add a concept to begin teaching.
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-sage/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-ivory/60 border-b border-sage/40 text-muted uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Concept Title</th>
                  <th className="py-3 px-4 font-semibold">Difficulty</th>
                  <th className="py-3 px-4 font-semibold">Est. Minutes</th>
                  <th className="py-3 px-4 font-semibold">Notes Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/20">
                {concepts.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory/30 transition-colors">
                    <td className="py-3 px-6 font-mono font-bold text-forest">#{c.order}</td>
                    <td className="py-3 px-4 font-bold text-charcoal">{c.title}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage/50 text-forest border border-sage">
                        {c.difficulty_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">{c.estimated_minutes} min</td>
                    <td className="py-3 px-4">
                      {c.note ? (
                        <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                          Published
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Draft / Empty
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/teacher/notes?concept_id=${c.id}`}
                          className="p-1.5 rounded-lg hover:bg-forest/10 text-forest font-semibold text-xs flex items-center space-x-1"
                          title="Author / Edit Note"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Notes</span>
                        </Link>
                        <button
                          onClick={() => handleOpenModal(c)}
                          className="p-1.5 rounded-lg hover:bg-sage/30 text-forest"
                          title="Edit Concept"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete Concept"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-dropdown border border-sage/60 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-sage/30">
              <h2 className="text-base font-bold text-charcoal">
                {editingId ? 'Edit Concept' : 'Add Concept'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Concept Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Variables, Functions, JOINs"
                  className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimated_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2 bg-lightgrey/50 border border-sage/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1 uppercase tracking-wider">
                  Summary
                </label>
                <textarea
                  rows="2"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary of the concept..."
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
                  Save Concept
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageConceptsPage;
