require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const runMigrations = async() => {
    console.log('Starting database migrations...');

    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
        if (file.endsWith('.sql')) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            try {
                console.log(`Running migration: ${file}`);
                await db.query(sql);
                console.log(`✓ Completed: ${file}`);
            } catch (error) {
                console.error(`✗ Failed: ${file}`, error.message);
                throw error;
            }
        }
    }

    console.log('All migrations completed successfully!');
};

const seedDatabase = async() => {
    console.log('Seeding database...');

    try {
        // Create super admin
        const bcrypt = require('bcryptjs');
        const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);

        const adminResult = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, NULL, true)
       ON CONFLICT DO NOTHING
       RETURNING id`, ['superadmin@system.com', hashedAdminPassword, 'Super Admin', 'super_admin']
        );

        // Create demo tenant
        const tenantResult = await db.query(
            `INSERT INTO tenants (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (subdomain) DO NOTHING
       RETURNING id`, ['Demo Company', 'demo', 'active', 'pro', 10, 10]
        );

        if (tenantResult.rows.length > 0) {
            const tenantId = tenantResult.rows[0].id;

            // Create tenant admin
            const hashedPassword = await bcrypt.hash('Demo@123', 10);
            const adminUserResult = await db.query(
                `INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id`, [tenantId, 'admin@demo.com', hashedPassword, 'Demo Admin', 'tenant_admin']
            );

            const adminUserId = adminUserResult.rows[0] ? .id;

            // Create demo users
            const userPassword = await bcrypt.hash('User@123', 10);
            const user1Result = await db.query(
                `INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id`, [tenantId, 'user1@demo.com', userPassword, 'User One', 'user']
            );

            const user2Result = await db.query(
                `INSERT INTO users (tenant_id, email, password_hash, full_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id`, [tenantId, 'user2@demo.com', userPassword, 'User Two', 'user']
            );

            const user1Id = user1Result.rows[0] ? .id;
            const user2Id = user2Result.rows[0] ? .id;

            // Create projects
            if (adminUserId) {
                const proj1Result = await db.query(
                    `INSERT INTO projects (tenant_id, name, description, created_by, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`, [tenantId, 'Project Alpha', 'First demo project', adminUserId, 'active']
                );

                const proj2Result = await db.query(
                    `INSERT INTO projects (tenant_id, name, description, created_by, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`, [tenantId, 'Project Beta', 'Second demo project', adminUserId, 'active']
                );

                const proj1Id = proj1Result.rows[0] ? .id;
                const proj2Id = proj2Result.rows[0] ? .id;

                // Create tasks
                if (proj1Id && user1Id) {
                    await db.query(
                        `INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [proj1Id, tenantId, 'Task 1', 'First task', 'todo', 'high', user1Id]
                    );

                    await db.query(
                        `INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [proj1Id, tenantId, 'Task 2', 'Second task', 'in_progress', 'medium', user1Id]
                    );

                    await db.query(
                        `INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [proj1Id, tenantId, 'Task 3', 'Third task', 'done', 'low', user1Id]
                    );
                }

                if (proj2Id && user2Id) {
                    await db.query(
                        `INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [proj2Id, tenantId, 'Task 4', 'Fourth task', 'todo', 'urgent', user2Id]
                    );

                    await db.query(
                        `INSERT INTO tasks (project_id, tenant_id, title, description, status, priority, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`, [proj2Id, tenantId, 'Task 5', 'Fifth task', 'todo', 'medium', user2Id]
                    );
                }
            }
        }

        console.log('✓ Database seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error.message);
        throw error;
    }
};

const initDatabase = async() => {
    try {
        await runMigrations();
        await seedDatabase();
        console.log('\n✓ Database initialization completed!');
        process.exit(0);
    } catch (error) {
        console.error('\n✗ Database initialization failed:', error.message);
        process.exit(1);
    }
};

initDatabase();