import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api', // Make sure this matches your actual backend URL/port
});

// THIS IS THE MAGIC FIX: Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;