require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');

const PORT = process.env.PORT || 3000;

// Test database connection
const testConnection = async() => {
    try {
        console.log('Testing database connection...');
        const result = await db.query('SELECT NOW()');
        console.log('✓ Database connected');
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
};

const start = async() => {
    try {
        // Test database connection
        const connected = await testConnection();
        if (!connected) {
            console.error('Cannot start server: Database not available');
            process.exit(1);
        }

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`API available at http://localhost:${PORT}/api`);
            console.log('Health check: GET http://localhost:' + PORT + '/api/health');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully...');
            server.close(() => {
                console.log('Server closed');
                db.pool.end();
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

start();