-- ============================================================
-- MANDISETU - POSTGRESQL PRODUCTION SCHEMA
-- Smart India Hackathon 2026 (Problem Statement SIH26032)
-- Agri-Tech Zero-Waiting Procurement Protocol
-- ============================================================

-- Enable UUID and PostGIS extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 0. RETAIL USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS retail_users (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_retail_users_user_id ON retail_users(user_id);

-- ------------------------------------------------------------
-- 0.1 STOCKISTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stockists (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stockists_user_id ON stockists(user_id);

-- ------------------------------------------------------------
-- 1. FARMERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmers (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    aadhar_hash VARCHAR(128),
    land_records_ref VARCHAR(128),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100),
    village VARCHAR(100),
    pin_code VARCHAR(10),
    total_land_acres NUMERIC(8, 2) DEFAULT 0.0,
    preferred_language VARCHAR(30) DEFAULT 'hindi',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_farmers_mobile ON farmers(mobile);
CREATE INDEX IF NOT EXISTS idx_farmers_district ON farmers(district, state);

-- ------------------------------------------------------------
-- 2. PROCUREMENT CENTRES (MANDIS) TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurement_centres (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    centre_code VARCHAR(50) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    location_address TEXT NOT NULL,
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    capacity_trucks INTEGER DEFAULT 50,
    processing_rate_qtl_per_hr NUMERIC(8, 2) DEFAULT 120.0,
    active_counters INTEGER DEFAULT 3,
    operating_hours_start TIME DEFAULT '08:00:00',
    operating_hours_end TIME DEFAULT '18:00:00',
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONGESTED', 'SLOWDOWN', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_centres_district ON procurement_centres(district, state);
CREATE INDEX IF NOT EXISTS idx_centres_status ON procurement_centres(status);

-- ------------------------------------------------------------
-- 3. PROCUREMENT SLOTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS slots (
    id VARCHAR(64) PRIMARY KEY,
    centre_id VARCHAR(64) NOT NULL REFERENCES procurement_centres(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity_qtl NUMERIC(10, 2) DEFAULT 1000.0,
    allocated_quantity_qtl NUMERIC(10, 2) DEFAULT 0.0,
    max_tokens INTEGER DEFAULT 25,
    booked_tokens INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FULL', 'CANCELLED', 'RESCHEDULED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slots_centre_date ON slots(centre_id, slot_date);

-- ------------------------------------------------------------
-- 4. BOOKINGS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    centre_id VARCHAR(64) NOT NULL REFERENCES procurement_centres(id) ON DELETE RESTRICT,
    slot_id VARCHAR(64) REFERENCES slots(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    estimated_quantity_qtl NUMERIC(8, 2) NOT NULL,
    booking_channel VARCHAR(30) DEFAULT 'WEB' CHECK (booking_channel IN ('WEB', 'IVR', 'SMS', 'CSC_OPERATOR', 'PACS_COOP')),
    status VARCHAR(30) DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_farmer ON bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_centre_date ON bookings(centre_id, booking_date);

-- ------------------------------------------------------------
-- 5. TOKENS (DIGITAL PASSES) TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tokens (
    id VARCHAR(64) PRIMARY KEY,
    token_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. M-142
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    centre_id VARCHAR(64) NOT NULL REFERENCES procurement_centres(id) ON DELETE RESTRICT,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
    qr_code_hash VARCHAR(255) NOT NULL,
    queue_position INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'EN_ROUTE', 'ARRIVED', 'VERIFYING', 'WEIGHING', 'COMPLETED', 'HOLD', 'CANCELLED')),
    recommended_arrival_time TIMESTAMP WITH TIME ZONE,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    dispatch_alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_centre_status ON tokens(centre_id, status);
CREATE INDEX IF NOT EXISTS idx_tokens_number ON tokens(token_number);

-- ------------------------------------------------------------
-- 6. LIVE QUEUE ENTRIES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS queue_entries (
    id VARCHAR(64) PRIMARY KEY,
    centre_id VARCHAR(64) NOT NULL REFERENCES procurement_centres(id) ON DELETE CASCADE,
    token_id VARCHAR(64) NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    current_stage VARCHAR(50) DEFAULT 'GATE_ENTRY' CHECK (current_stage IN ('GATE_ENTRY', 'MOISTURE_ASSAY', 'WEIGHBRIDGE', 'QUALITY_CHECK', 'BAGGING_BAY', 'COMPLETED', 'HELD')),
    estimated_wait_minutes INTEGER DEFAULT 0,
    is_shielded_delay BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_centre_position ON queue_entries(centre_id, position);

-- ------------------------------------------------------------
-- 7. PROCUREMENTS (LIFECYCLE RECORDS) TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS procurements (
    id SERIAL PRIMARY KEY,
    procurement_id VARCHAR(64) UNIQUE NOT NULL, -- e.g. PR001
    farmer_id VARCHAR(64) REFERENCES farmers(id) ON DELETE SET NULL,
    centre_id VARCHAR(64) REFERENCES procurement_centres(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    crop VARCHAR(100),
    category VARCHAR(100),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    moisture_percentage NUMERIC(4, 2),
    supplier VARCHAR(255),
    department VARCHAR(100),
    order_date DATE,
    expected_date DATE,
    actual_date DATE,
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Ordered', 'Pending', 'Delivered', 'Delayed', 'Cancelled')),
    priority VARCHAR(30) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_procurements_status ON procurements(status);
CREATE INDEX IF NOT EXISTS idx_procurements_supplier ON procurements(supplier);

-- ------------------------------------------------------------
-- 8. PAYMENTS (DBT / PFMS) TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    farmer_id VARCHAR(64) NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    procurement_id VARCHAR(64) REFERENCES procurements(procurement_id) ON DELETE SET NULL,
    transaction_reference VARCHAR(100) UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    dbt_status VARCHAR(50) DEFAULT 'PROCESSING' CHECK (dbt_status IN ('INITIATED', 'PROCESSING', 'CREDITED_TO_ACCOUNT', 'FAILED', 'ON_HOLD')),
    pfms_batch_id VARCHAR(100),
    bank_account_last4 VARCHAR(4),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_farmer ON payments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(dbt_status);
