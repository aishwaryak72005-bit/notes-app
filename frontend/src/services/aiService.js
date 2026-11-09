import api from './api';

export const aiService = {
  async getConversations() {
    const res = await api.get('ai/conversations/');
    return res.data;
  },

  async getConversation(id) {
    const res = await api.get(`ai/conversations/${id}/`);
    return res.data;
  },

  async createConversation(conceptId = null, level = 'beginner') {
    const res = await api.post('ai/conversations/', {
      concept_id: conceptId,
      explanation_level: level,
    });
    return res.data;
  },

  async sendMessage(convId, content, level) {
    const res = await api.post(`ai/conversations/${convId}/send/`, {
      content,
      explanation_level: level,
    });
    return res.data;
  },

  async updateLevel(convId, level) {
    const res = await api.patch(`ai/conversations/${convId}/level/`, {
      explanation_level: level,
    });
    return res.data;
  },

  async deleteConversation(id) {
    const res = await api.delete(`ai/conversations/${id}/`);
    return res.data;
  },

  async getDoubtRadar() {
    const res = await api.get('ai/doubt-radar/');
    return res.data;
  },
};

