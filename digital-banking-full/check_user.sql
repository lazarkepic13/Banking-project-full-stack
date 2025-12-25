-- SQL upit za proveru korisnika "mika"
USE digital_banking;

-- Proveri sve korisnike
SELECT * FROM users;

-- Proveri sve customere
SELECT * FROM customers;

-- Proveri korisnika sa email-om ili username-om koji sadrži "mika"
SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.active,
       c.customer_number, c.date_of_birth, c.address, c.city
FROM users u
LEFT JOIN customers c ON u.id = c.user_id
WHERE u.email LIKE '%mika%' OR u.username LIKE '%mika%' OR u.first_name LIKE '%mika%';

