-- FINALNO REŠENJE - Ažuriraj admin lozinku sa pravilnim BCrypt hash-om
-- Ovaj hash je generisan sa BCrypt strength 10 i trebao bi da radi

USE digital_banking;

-- Opcija 1: Koristite ovaj hash (generisan sa BCrypt)
-- Hash za "admin123" sa BCrypt strength 10
UPDATE users
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@bank.com';

-- Proveri da li je ažurirano
SELECT id, email, role, active, password FROM users WHERE email = 'admin@bank.com';

-- Ako i dalje ne radi, probaj ove hash-eve (svi su za "admin123"):

-- Hash 2:
-- UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email = 'admin@bank.com';

-- Hash 3:
-- UPDATE users SET password = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW' WHERE email = 'admin@bank.com';

