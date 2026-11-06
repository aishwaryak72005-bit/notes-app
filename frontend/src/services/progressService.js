import api from './api';

export const progressService = {
  async getBookmarks(techSlug = null) {
    const params = techSlug ? { tech: techSlug } : {};
    const res = await api.get('progress/bookmarks/', { params });
    return res.data.results || res.data;
  },

  async toggleBookmark(conceptId) {
    const res = await api.post(`progress/bookmarks/${conceptId}/toggle/`);
    return res.data;
  },

  async checkBookmark(conceptId) {
    const res = await api.get(`progress/bookmarks/${conceptId}/check/`);
    return res.data.bookmarked;
  },

  async markComplete(conceptId) {
    const res = await api.post(`progress/progress/${conceptId}/complete/`);
    return res.data;
  },

  async checkProgress(conceptId) {
    const res = await api.get(`progress/progress/${conceptId}/check/`);
    return res.data;
  },

  async getAnalytics() {
    const res = await api.get('progress/analytics/');
    return res.data;
  },
};
