import axios from "axios";

// Create an axios instance with base URL and default config
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1/', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;