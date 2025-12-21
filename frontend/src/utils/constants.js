// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH_REGISTER_TENANT: '/auth/register-tenant',
    AUTH_LOGIN: '/auth/login',
    AUTH_ME: '/auth/me',
    AUTH_LOGOUT: '/auth/logout',

    // Tenants
    TENANTS: '/tenants',
    TENANT_USERS: '/tenants/:tenantId/users',
    TENANT_PROJECTS: '/tenants/:tenantId/projects',

    // Projects
    PROJECTS: '/projects',
    PROJECT_DETAIL: '/projects/:id',
    PROJECT_TASKS: '/projects/:id/tasks',

    // Tasks
    TASKS: '/tasks',
    TASK_DETAIL: '/tasks/:id',

    // Users
    USERS: '/users',
    USER_DETAIL: '/users/:id',
};

// User Roles
export const ROLES = {
    TENANT_ADMIN: 'tenant_admin',
    MANAGER: 'manager',
    USER: 'user',
};

// Task/Project Status
export const STATUS = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
};

// Priority Levels
export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
};

// Status Colors for UI
export const STATUS_COLORS = {
    todo: { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-200' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-200' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-200' },
    archived: { bg: 'bg-gray-100', text: 'text-gray-600', badge: 'bg-gray-200' },
};

// Priority Colors
export const PRIORITY_COLORS = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
};