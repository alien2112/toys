-- Make test@gmail.com (Eslam) an admin user
USE ecommerce_db;

-- Update the user role to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'test@gmail.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'test@gmail.com';

-- Show all admin users
SELECT id, email, first_name, last_name, role 
FROM users 
WHERE role = 'admin';
