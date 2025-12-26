-- SQL skripta za kreiranje admin korisnika
-- Ovo kreira admin korisnika u digital_banking bazi
-- Lozinka: admin123

USE digital_banking;

-- Prvo kreiramo korisnika u users tabeli
-- Lozinka: admin123 (hash-ovana sa BCrypt)
-- BCrypt hash za "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (username, password, email, first_name, last_name, phone_number, role, active, created_at, updated_at)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- hash za "admin123"
    'admin@bank.com',
    'Admin',
    'User',
    '+381600000000',
    'ADMIN',
    1, -- active = true
    GETDATE(),
    GETDATE()
);

-- Pronađi ID kreiranog korisnika
DECLARE @admin_user_id INT;
SELECT @admin_user_id = id FROM users WHERE email = 'admin@bank.com';

-- Kreiramo Employee zapis (admin je Employee sa role = ADMIN)
INSERT INTO employees (user_id, employee_number, hire_date, position, department, salary, can_approve_transactions)
VALUES (
    @admin_user_id,
    'EMP-ADMIN-001',
    CAST(GETDATE() AS DATE),
    'System Administrator',
    'IT',
    0.00,
    1 -- can_approve_transactions = true
);

-- Proveri kreiranog admin korisnika
SELECT
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.active,
    e.employee_number,
    e.position,
    e.department
FROM users u
INNER JOIN employees e ON u.id = e.user_id
WHERE u.role = 'ADMIN' AND u.email = 'admin@bank.com';

