import api from './api';

export const quizService = {
  async getQuizzes(params = {}) {
    const res = await api.get('quizzes/quizzes/', { params });
    return res.data.results || res.data;
  },

  async getQuiz(id) {
    const res = await api.get(`quizzes/quizzes/${id}/`);
    return res.data;
  },

  async getQuizByConcept(conceptId) {
    const res = await api.get('quizzes/quizzes/', { params: { concept_id: conceptId } });
    const list = res.data.results || res.data;
    return list.length > 0 ? list[0] : null;
  },

  async submitQuiz(quizId, answers, timeTakenSeconds) {
    const res = await api.post(`quizzes/quizzes/${quizId}/submit/`, {
      answers,
      time_taken_seconds: timeTakenSeconds,
    });
    return res.data;
  },

  async getAttempts() {
    const res = await api.get('quizzes/attempts/');
    return res.data;
  },

  // Teacher methods
  async createQuiz(data) {
    const res = await api.post('quizzes/quizzes/', data);
    return res.data;
  },

  async updateQuiz(id, data) {
    const res = await api.patch(`quizzes/quizzes/${id}/`, data);
    return res.data;
  },

  async deleteQuiz(id) {
    const res = await api.delete(`quizzes/quizzes/${id}/`);
    return res.data;
  },

  async addQuestion(quizId, data) {
    const res = await api.post('quizzes/questions/', { ...data, quiz: quizId });
    return res.data;
  },

  async deleteQuestion(id) {
    const res = await api.delete(`quizzes/questions/${id}/`);
    return res.data;
  },
};
