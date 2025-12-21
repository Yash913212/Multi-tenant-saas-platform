import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle unauthorized responses consistently
        if (error && error.response && error.response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        // Network errors or no response from server
        if (!error.response) {
            // Optionally, you could show a toast or log
            // console.error('Network error or no response:', error.message);
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    registerTenant: (data) => apiClient.post('/auth/register-tenant', data),
    login: (data) => apiClient.post('/auth/login', data),
    me: () => apiClient.get('/auth/me'),
    logout: () => apiClient.post('/auth/logout'),
};

// Projects API calls
export const projectsAPI = {
    getAll: () => apiClient.get('/projects'),
    getById: (id) => apiClient.get(`/projects/${id}`),
    create: (data) => apiClient.post('/projects', data),
    update: (id, data) => apiClient.put(`/projects/${id}`, data),
    delete: (id) => apiClient.delete(`/projects/${id}`),
    getTasks: (id) => apiClient.get(`/projects/${id}/tasks`),
};

// Tasks API calls
export const tasksAPI = {
    getAll: () => apiClient.get('/tasks'),
    getById: (id) => apiClient.get(`/tasks/${id}`),
    create: (data) => apiClient.post('/tasks', data),
    update: (id, data) => apiClient.put(`/tasks/${id}`, data),
    delete: (id) => apiClient.delete(`/tasks/${id}`),
    changeStatus: (id, status) => apiClient.patch(`/tasks/${id}`, { status }),
};

// Tenants API calls
export const tenantsAPI = {
    getById: (id) => apiClient.get(`/tenants/${id}`),
    getUsers: (id) => apiClient.get(`/tenants/${id}/users`),
    addUser: (id, data) => apiClient.post(`/tenants/${id}/users`, data),
};

// Users API calls
export const usersAPI = {
    getAll: () => apiClient.get('/users'),
    getById: (id) => apiClient.get(`/users/${id}`),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
};

export default apiClient;