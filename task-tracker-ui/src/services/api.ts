import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: {
    firstName: string; lastName: string;
    email: string; password: string;
    orgName?: string; orgId?: string;
  }) => api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
};

export const projectsApi = {
  getAll: () => api.get('/projects'),
  create: (data: { name: string; description?: string }) =>
    api.post('/projects', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const tasksApi = {
  getAll: (params?: {
    page?: number; limit?: number; status?: string;
    priority?: string; assigneeId?: string; projectId?: string;
  }) => api.get('/tasks', { params }),
  create: (data: {
    title: string; description?: string; priority?: string;
    assigneeId?: string; projectId: string; dueDate?: string;
  }) => api.post('/tasks', data),
  update: (id: string, data: object) => api.patch(`/tasks/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get('/users', { params }),
  updateRole: (id: string, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
  deactivate: (id: string) => api.delete(`/users/${id}`),
};