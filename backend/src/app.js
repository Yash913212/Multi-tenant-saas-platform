require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Health check (no auth required)
app.use('/api', healthRoutes);

// Routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/tenants`, tenantRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/projects`, projectRoutes);
app.use(`${apiPrefix}/tasks`, taskRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        data: null,
    });
});

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;