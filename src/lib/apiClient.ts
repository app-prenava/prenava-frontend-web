import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const status = err.response?.status;
    const original = err.config;
    const url = original?.url || '';
    
    // Don't retry for login or refresh endpoints, or if already retried
    const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/refresh');
    
    if (status === 401 && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      try {
        const r = await api.post('/api/auth/refresh');
        const newToken = r.data.authorization.token;
        localStorage.setItem('token', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api.request(original);
      } catch {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(err);
  }
);

export default api;
