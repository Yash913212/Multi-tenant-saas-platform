// Date formatting utilities
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(dateString);
};

// String utilities
export const truncate = (str, length = 50) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
};

export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const titleCase = (str) => {
    if (!str) return '';
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => capitalize(word))
        .join(' ')
        .trim();
};

// Validation utilities
export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

export const isValidSubdomain = (subdomain) => {
    const regex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    return regex.test(subdomain) && subdomain.length >= 3;
};