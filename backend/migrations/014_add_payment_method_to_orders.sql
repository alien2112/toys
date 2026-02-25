-- Add payment_method column to orders table
ALTER TABLE orders ADD COLUMN payment_method ENUM('credit_card', 'paypal', 'cash', 'bank_transfer') DEFAULT 'cash' AFTER status;

-- Update existing orders to have default payment method
UPDATE orders SET payment_method = 'cash' WHERE payment_method IS NULL;

-- Add index for better performance
ALTER TABLE orders ADD INDEX idx_payment_method (payment_method);
