import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5265/api/',
  withCredentials: true,
});

API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Don't try to refresh if it's already a retry or if the request is to refresh or login endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/refresh') &&
      !originalRequest.url.includes('/login')
    ) {
      originalRequest._retry = true;

      try {
        await API.post('/refresh');
        return API(originalRequest);
      } catch (refreshError) {
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default API;
