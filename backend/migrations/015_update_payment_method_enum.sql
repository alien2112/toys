-- Update payment_method enum to include proper payment options
ALTER TABLE orders MODIFY COLUMN payment_method ENUM('credit_card', 'paypal', 'cash_on_delivery', 'bank_transfer') DEFAULT 'cash_on_delivery' AFTER status;

-- Update existing orders to have proper payment method
UPDATE orders SET payment_method = 'cash_on_delivery' WHERE payment_method = 'cash';

-- Add payment_status column to track payment status separately from order status
ALTER TABLE orders ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending' AFTER payment_method;

-- Update existing orders based on their payment method and status
UPDATE orders SET payment_status = 'paid' 
WHERE payment_method = 'cash_on_delivery' AND status IN ('delivered', 'shipping');

-- Add indexes for better performance
ALTER TABLE orders ADD INDEX idx_payment_status (payment_status);

-- Add a combined index for payment tracking
ALTER TABLE orders ADD INDEX idx_payment_tracking (payment_method, payment_status);
