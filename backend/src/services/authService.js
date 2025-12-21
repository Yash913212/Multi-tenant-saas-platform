const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { ValidationError, ConflictError, AuthenticationError } = require('../utils/errors');

const hashPassword = async(password) => {
    return bcrypt.hash(password, 10);
};

const verifyPassword = async(password, hash) => {
    return bcrypt.compare(password, hash);
};

const generateToken = (userId, tenantId, role) => {
    return jwt.sign({ userId, tenantId, role },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );
};

const register = async(email, password, fullName, subdomain = null) => {
    // Check if email already exists
    const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1', [email]
    );

    if (existingUser.rows.length > 0) {
        throw new ConflictError('Email already registered');
    }

    const passwordHash = await hashPassword(password);

    if (!subdomain) {
        // Super admin registration
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role, tenant_id)
       VALUES ($1, $2, $3, $4, NULL)
       RETURNING id, email, full_name, role, tenant_id`, [email, passwordHash, fullName, 'super_admin']
        );

        const user = result.rows[0];
        const token = generateToken(user.id, null, user.role);

        return { user, token };
    } else {
        // Tenant registration
        // Create tenant
        const tenantResult = await db.query(
            `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, subdomain`, [fullName, subdomain, 'active', 'free', 5, 5]
        );

        const tenant = tenantResult.rows[0];

        // Create tenant admin user
        const userResult = await db.query(
            `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, tenant_id`, [tenant.id, email, passwordHash, fullName, 'tenant_admin']
        );

        const user = userResult.rows[0];
        const token = generateToken(user.id, user.tenant_id, user.role);

        return { user, token, tenant };
    }
};

const login = async(email, password) => {
    const result = await db.query(
        'SELECT id, email, password_hash, full_name, role, tenant_id, is_active FROM users WHERE email = $1', [email]
    );

    const user = result.rows[0];
    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    if (!user.is_active) {
        throw new AuthenticationError('User account is inactive');
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
    }

    const token = generateToken(user.id, user.tenant_id, user.role);

    return {
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            tenant_id: user.tenant_id,
        },
        token,
    };
};

module.exports = {
    register,
    login,
    hashPassword,
    verifyPassword,
    generateToken,
};