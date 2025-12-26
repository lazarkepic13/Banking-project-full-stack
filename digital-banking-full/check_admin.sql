-- SQL upit za proveru admin korisnika
USE digital_banking;

-- Proveri da li admin postoji i da li je sve pravilno podešeno
SELECT
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.active,
    u.password,
    e.employee_number,
    e.position,
    e.department,
    e.can_approve_transactions
FROM users u
LEFT JOIN employees e ON u.id = e.user_id
WHERE u.role = 'ADMIN' OR u.email = 'admin@bank.com';

-- Proveri samo users tabelu
SELECT * FROM users WHERE role = 'ADMIN' OR email = 'admin@bank.com';

-- Proveri employees tabelu
SELECT * FROM employees e
INNER JOIN users u ON e.user_id = u.id
WHERE u.role = 'ADMIN';

