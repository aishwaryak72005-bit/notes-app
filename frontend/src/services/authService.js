import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('auth/login/', { username, password });
    if (response.data.access) {
      localStorage.setItem('technotes_access_token', response.data.access);
      localStorage.setItem('technotes_refresh_token', response.data.refresh);
      localStorage.setItem('technotes_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async registerStudent(userData) {
    const response = await api.post('auth/register/student/', userData);
    if (response.data.access) {
      localStorage.setItem('technotes_access_token', response.data.access);
      localStorage.setItem('technotes_refresh_token', response.data.refresh);
      localStorage.setItem('technotes_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async registerTeacher(userData) {
    const response = await api.post('auth/register/teacher/', userData);
    if (response.data.access) {
      localStorage.setItem('technotes_access_token', response.data.access);
      localStorage.setItem('technotes_refresh_token', response.data.refresh);
      localStorage.setItem('technotes_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('auth/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('auth/profile/', profileData);
    localStorage.setItem('technotes_user', JSON.stringify(response.data));
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('auth/forgot-password/', { email });
    return response.data;
  },

  async getStudents() {
    const response = await api.get('auth/students/');
    return response.data.results || response.data;
  },

  logout() {
    localStorage.removeItem('technotes_access_token');
    localStorage.removeItem('technotes_refresh_token');
    localStorage.removeItem('technotes_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('technotes_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
