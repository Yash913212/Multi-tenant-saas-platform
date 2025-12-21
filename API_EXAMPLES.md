# API Integration Examples

## JavaScript/Axios Examples

### Authentication

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Register Tenant
async function registerTenant(data) {
  const response = await axios.post(`${API_URL}/auth/register-tenant`, {
    tenantName: data.tenantName,
    subdomain: data.subdomain,
    adminEmail: data.adminEmail,
    adminPassword: data.adminPassword,
    adminFullName: data.adminFullName
  });
  return response.data;
}

// Login
async function login(email, password, tenantSubdomain) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
    tenantSubdomain
  });
  const { token } = response.data.data;
  localStorage.setItem('token', token);
  return response.data.data;
}

// Get Current User
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// Logout
async function logout() {
  const token = localStorage.getItem('token');
  await axios.post(`${API_URL}/auth/logout`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  localStorage.removeItem('token');
}
```

### Projects

```javascript
// Create Project
async function createProject(name, description) {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/projects`, {
    name,
    description
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// List Projects
async function listProjects(filters = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  
  const response = await axios.get(`${API_URL}/projects?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// Update Project
async function updateProject(projectId, updates) {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/projects/${projectId}`, updates, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// Delete Project
async function deleteProject(projectId) {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

### Tasks

```javascript
// Create Task
async function createTask(projectId, task) {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/projects/${projectId}/tasks`,
    {
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

// List Tasks
async function listTasks(projectId, filters = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  
  const response = await axios.get(
    `${API_URL}/projects/${projectId}/tasks?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

// Update Task Status
async function updateTaskStatus(taskId, status) {
  const token = localStorage.getItem('token');
  const response = await axios.patch(
    `${API_URL}/tasks/${taskId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

// Update Task
async function updateTask(taskId, updates) {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/tasks/${taskId}`, updates, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// Delete Task
async function deleteTask(taskId) {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

### Users

```javascript
// Add User to Tenant
async function addUser(tenantId, user) {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/tenants/${tenantId}/users`,
    {
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      role: user.role || 'user'
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

// List Tenant Users
async function listUsers(tenantId, filters = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  
  const response = await axios.get(
    `${API_URL}/tenants/${tenantId}/users?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}

// Update User
async function updateUser(userId, updates) {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/users/${userId}`, updates, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

// Delete User
async function deleteUser(userId) {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

## React Hook Examples

```javascript
import { useEffect, useState } from 'react';

// Custom Hook for API Calls
function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFunction()
      .then(data => {
        setData(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// Usage Example
function ProjectsList() {
  const { data: projects, loading, error } = useApi(listProjects);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

## Error Handling

```javascript
// Handle API Errors
async function handleApiCall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token expired
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        // Permission denied
        return { success: false, error: 'Access denied' };
      } else if (status === 409) {
        // Conflict (duplicate email, etc.)
        return { success: false, error: data.message };
      } else {
        return { success: false, error: data.message || 'Error' };
      }
    } else {
      // Network error
      return { success: false, error: 'Network error' };
    }
  }
}
```

---

**Version**: 1.0.0  
**Last Updated**: December 2024
