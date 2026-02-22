-- Update test@gmail.com to admin role
UPDATE users 
SET role = 'admin' 
WHERE email = 'test@gmail.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'test@gmail.com';
