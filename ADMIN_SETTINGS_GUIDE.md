# Admin Settings Management Guide

## Overview
Admins can now manage social media links and contact information from the admin dashboard. These settings are stored in the database and dynamically displayed on the Footer and Contact page.

## Features Implemented

### 1. Database Schema
- Added `settings` table to store key-value pairs for site configuration
- Pre-populated with default values for social media and contact information

### 2. Backend API
- **GET** `/api/settings` - Public endpoint to fetch all settings
- **PUT** `/api/admin/settings` - Admin-only endpoint to update settings
- Created `SettingsController.php` to handle settings operations

### 3. Admin Settings Page
- New admin page at `/admin/settings`
- Accessible from the admin dashboard via "Settings" button
- Two main sections:
  - **Social Media Links**: Facebook, Instagram, WhatsApp URLs
  - **Contact Information**: Email, Phone, WhatsApp number, Address, Business hours

### 4. Frontend Integration
- **Footer Component**: Fetches and displays social media links from API
- **Contact Page**: Fetches and displays contact information from API
- Both components have fallback values if API fails

## How to Use

### For Admins:

1. **Access Settings Page**
   - Login to admin dashboard at `/admin/login`
   - Click the "Settings" button in the header
   - Or navigate directly to `/admin/settings`

2. **Update Social Media Links**
   - Enter full URLs for Facebook, Instagram, and WhatsApp
   - Example: `https://facebook.com/yourpage`
   - These links appear in the footer with social icons

3. **Update Contact Information**
   - Email: Displayed on contact page and used for mailto links
   - Phone: Displayed on contact page with tel: link
   - WhatsApp: Used for WhatsApp button on contact page
   - Address: Displayed in location section
   - Business Hours: Displayed in hours section (supports multi-line)

4. **Save Changes**
   - Click "Save Settings" button
   - Success message will appear
   - Changes are immediately reflected on the website

### Database Setup:

Run the updated schema to create the settings table:

```bash
mysql -u root -p < backend/database/schema.sql
```

Or manually create the table:

```sql
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (setting_key, setting_value) VALUES
('social_facebook', '#'),
('social_instagram', '#'),
('social_whatsapp', '#'),
('contact_email', 'support@amanlove.com'),
('contact_phone', '+965 1234 5678'),
('contact_whatsapp', '+96512345678'),
('contact_address', 'الكويت'),
('contact_hours', 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً');
```

## Files Modified/Created

### Backend:
- `backend/database/schema.sql` - Added settings table
- `backend/controllers/SettingsController.php` - New controller
- `backend/routes/api.php` - Added settings routes

### Frontend:
- `src/pages/admin/SettingsPage.tsx` - New admin settings page
- `src/pages/admin/SettingsPage.css` - Styling for settings page
- `src/App.tsx` - Added settings route
- `src/components/Footer.tsx` - Fetch social links from API
- `src/pages/ContactPage.tsx` - Fetch contact info from API
- `src/pages/admin/DashboardPage.tsx` - Added settings button

## API Endpoints

### Get Settings (Public)
```
GET /api/settings
Response: {
  "success": true,
  "data": {
    "social_facebook": "https://facebook.com/...",
    "social_instagram": "https://instagram.com/...",
    "social_whatsapp": "https://wa.me/...",
    "contact_email": "support@amanlove.com",
    "contact_phone": "+965 1234 5678",
    "contact_whatsapp": "+96512345678",
    "contact_address": "الكويت",
    "contact_hours": "السبت - الخميس: 9:00 صباحاً - 9:00 مساءً"
  }
}
```

### Update Settings (Admin Only)
```
PUT /api/admin/settings
Headers: {
  "Authorization": "Bearer <admin_token>",
  "Content-Type": "application/json"
}
Body: {
  "social_facebook": "https://facebook.com/newpage",
  "contact_email": "newemail@example.com",
  ...
}
Response: {
  "success": true,
  "data": {
    "message": "Settings updated successfully"
  }
}
```

## Security
- Settings update endpoint requires admin authentication
- Uses JWT token validation via AuthMiddleware
- Only admins can modify settings
- Public can only read settings

## Future Enhancements
- Add more configurable settings (site name, logo, colors, etc.)
- Add image upload for logo/favicon
- Add validation for URL formats
- Add preview functionality before saving
- Add settings history/audit log
