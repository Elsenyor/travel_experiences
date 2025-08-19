-- Seed: Admin user
-- Description: Creates default admin user for system management

-- Password for admin user is: Admin123! (hashed with bcrypt)
INSERT INTO users (
    name,
    surname,
    email,
    password,
    role,
    auth_provider
) VALUES (
    'Admin',
    'System',
    'admin@asiaexperiences.com',
    '$2b$10$6jM7G2RBjbHZuMxIRRI1gOLxzT1GJK4FrWK3LW7F8pHuXcZNXHhCi',
    'admin',
    'local'
);
