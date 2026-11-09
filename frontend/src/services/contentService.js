import api from './api';

export const contentService = {
  // Dashboards
  async getStudentDashboard() {
    const res = await api.get('content/dashboard/student/');
    return res.data;
  },

  async getTeacherDashboard() {
    const res = await api.get('content/dashboard/teacher/');
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await api.get('content/categories/');
    return res.data.results || res.data;
  },

  // Technologies
  async getTechnologies() {
    const res = await api.get('content/technologies/');
    return res.data.results || res.data;
  },

  async getTechnology(idOrSlug) {
    const res = await api.get(`content/technologies/${idOrSlug}/`);
    return res.data;
  },

  async createTechnology(data) {
    const res = await api.post('content/technologies/', data);
    return res.data;
  },

  async updateTechnology(id, data) {
    const res = await api.patch(`content/technologies/${id}/`, data);
    return res.data;
  },

  async deleteTechnology(id) {
    const res = await api.delete(`content/technologies/${id}/`);
    return res.data;
  },

  // Modules
  async getModules(techSlug) {
    const params = techSlug ? { tech_slug: techSlug } : {};
    const res = await api.get('content/modules/', { params });
    return res.data.results || res.data;
  },

  async createModule(data) {
    const res = await api.post('content/modules/', data);
    return res.data;
  },

  async updateModule(id, data) {
    const res = await api.patch(`content/modules/${id}/`, data);
    return res.data;
  },

  async deleteModule(id) {
    const res = await api.delete(`content/modules/${id}/`);
    return res.data;
  },

  // Concepts
  async getConcepts(params = {}) {
    const res = await api.get('content/concepts/', { params });
    return res.data.results || res.data;
  },

  async getConcept(id) {
    const res = await api.get(`content/concepts/${id}/`);
    return res.data;
  },

  async createConcept(data) {
    const res = await api.post('content/concepts/', data);
    return res.data;
  },

  async updateConcept(id, data) {
    const res = await api.patch(`content/concepts/${id}/`, data);
    return res.data;
  },

  async deleteConcept(id) {
    const res = await api.delete(`content/concepts/${id}/`);
    return res.data;
  },

  // Notes
  async getNotes(conceptId) {
    const params = conceptId ? { concept_id: conceptId } : {};
    const res = await api.get('content/notes/', { params });
    return res.data.results || res.data;
  },

  async getNote(id) {
    const res = await api.get(`content/notes/${id}/`);
    return res.data;
  },

  async saveNote(data) {
    if (data.id) {
      const res = await api.patch(`content/notes/${data.id}/`, data);
      return res.data;
    } else {
      const res = await api.post('content/notes/', data);
      return res.data;
    }
  },

  async deleteNote(id) {
    const res = await api.delete(`content/notes/${id}/`);
    return res.data;
  },

  // Announcements
  async getAnnouncements() {
    const res = await api.get('content/announcements/');
    return res.data.results || res.data;
  },

  async createAnnouncement(data) {
    const res = await api.post('content/announcements/', data);
    return res.data;
  },

  async deleteAnnouncement(id) {
    const res = await api.delete(`content/announcements/${id}/`);
    return res.data;
  },
};

