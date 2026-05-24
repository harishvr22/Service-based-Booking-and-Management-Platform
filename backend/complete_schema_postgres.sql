-- Complete Database Schema for Apartment Service System (PostgreSQL Compatibility)

-- =============================================
-- 1. USERS TABLE
-- =============================================
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','provider','resident')),
    apartment_id VARCHAR(10),
    status VARCHAR(20) DEFAULT 'active',
    availability TEXT,
    skills TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 2. SERVICES TABLE
-- =============================================
DROP TABLE IF EXISTS services CASCADE;
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- =============================================
-- 3. BOOKINGS TABLE
-- =============================================
DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    resident_id INT NOT NULL,
    service_id INT NOT NULL,
    provider_id INT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','completed','cancelled')),
    apartment_id VARCHAR(10),
    mobile_number VARCHAR(15),
    problem_description TEXT,
    time_duration VARCHAR(50),
    preferred_date DATE,
    preferred_time TIME,
    additional_notes TEXT,
    booking_date DATE,
    booking_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_resident FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_provider FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================
-- 4. NOTIFICATIONS TABLE
-- =============================================
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('All','Residents','Providers','Admins')),
    created_by INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 5. COMPLAINTS TABLE
-- =============================================
DROP TABLE IF EXISTS complaints CASCADE;
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','resolved','closed')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 6. ANNOUNCEMENTS TABLE
-- =============================================
DROP TABLE IF EXISTS announcements CASCADE;
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(20) NOT NULL CHECK (audience IN ('All','Residents','Providers','Admins')),
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    CONSTRAINT fk_announcements_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- INSERT SERVICES DATA
-- =============================================
INSERT INTO services(service_name,description) VALUES
('Plumber','Water pipe repair and leakage fixing'),
('Electrician','Electrical repair and wiring'),
('Carpenter','Furniture repair and wood work'),
('Painter','Wall painting and touch-up'),
('Cleaner','House and apartment cleaning'),
('HVAC Technician','AC installation and repair'),
('Appliance Repair','Repair of washing machine, fridge etc'),
('Pest Control','Removal of insects and pests');

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_bookings_resident ON bookings(resident_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_notifications_audience ON notifications(audience);
CREATE INDEX idx_complaints_status ON complaints(status);
