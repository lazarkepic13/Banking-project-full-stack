-- KOMPLETNO REŠENJE - Kreiraj admin korisnika od nule sa pravilnim hash-om
-- Ovaj SQL kreira admin korisnika sa ispravnom lozinkom

USE digital_banking;

-- Prvo obriši postojećeg admin korisnika ako postoji (OPCIONO - samo ako želiš čistu instalaciju)
-- DELETE FROM employees WHERE user_id IN (SELECT id FROM users WHERE email = 'admin@bank.com');
-- DELETE FROM users WHERE email = 'admin@bank.com';

-- KORAK 1: Kreiraj korisnika sa pravilnim BCrypt hash-om za "admin123"
-- Hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (username, password, email, first_name, last_name, phone_number, role, active, created_at, updated_at)
VALUES (
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin@bank.com',
    'Admin',
    'User',
    '+381600000000',
    'ADMIN',
    1,
    GETDATE(),
    GETDATE()
);

-- KORAK 2: Pronađi ID kreiranog korisnika
DECLARE @admin_user_id INT;
SELECT @admin_user_id = id FROM users WHERE email = 'admin@bank.com';

-- KORAK 3: Kreiraj Employee zapis
INSERT INTO employees (user_id, employee_number, hire_date, position, department, salary, can_approve_transactions)
VALUES (
    @admin_user_id,
    'EMP-ADMIN-001',
    CAST(GETDATE() AS DATE),
    'System Administrator',
    'IT',
    0.00,
    1
);

-- KORAK 4: Proveri da li je sve kreirano
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
WHERE u.email = 'admin@bank.com';

