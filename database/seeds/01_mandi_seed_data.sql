-- ============================================================
-- MANDISETU - SEED DATA FOR DEMO & TESTING
-- Smart India Hackathon 2026
-- ============================================================

-- 1. Procurement Centres
INSERT INTO procurement_centres (id, name, centre_code, state, district, location_address, latitude, longitude, capacity_trucks, processing_rate_qtl_per_hr, active_counters, status)
VALUES
('centre-14', 'Meerut Grain Mandi #14', 'UP-MRT-014', 'Uttar Pradesh', 'Meerut', 'Roorkee Road, Dorli, Meerut, UP 250001', 28.9845, 77.7064, 45, 140.0, 3, 'ACTIVE'),
('centre-08', 'Modinagar Relief Mandi #08', 'UP-GZB-008', 'Uttar Pradesh', 'Ghaziabad', 'Delhi-Meerut Expressway, Modinagar, UP 201204', 28.8318, 77.5818, 30, 95.0, 2, 'ACTIVE'),
('centre-22', 'Hapur Central Mandi #22', 'UP-HPR-022', 'Uttar Pradesh', 'Hapur', 'Railway Road, Hapur, UP 245101', 28.7306, 77.7759, 60, 180.0, 4, 'SLOWDOWN'),
('centre-03', 'Karnal Agri Hub #03', 'HR-KRN-003', 'Haryana', 'Karnal', 'GT Road, Sector 3, Karnal, HR 132001', 29.6857, 76.9905, 80, 220.0, 5, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. Sample Farmers
INSERT INTO farmers (id, name, mobile, aadhar_hash, land_records_ref, state, district, village, total_land_acres, preferred_language, is_verified)
VALUES
('farmer-001', 'Ramesh Singh', '+919876543210', 'aadhaar_sha256_hash_1', 'UP-LR-2024-88912', 'Uttar Pradesh', 'Meerut', 'Dorli', 4.5, 'hindi', TRUE),
('farmer-002', 'Sukhwinder Dhillon', '+919812345678', 'aadhaar_sha256_hash_2', 'HR-LR-2024-44129', 'Haryana', 'Karnal', 'Taraori', 8.0, 'punjabi', TRUE),
('farmer-003', 'Bhimrao Patil', '+919922334455', 'aadhaar_sha256_hash_3', 'MH-LR-2024-11029', 'Maharashtra', 'Latur', 'Ausa', 3.2, 'marathi', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Tokens
INSERT INTO tokens (id, token_number, farmer_id, centre_id, qr_code_hash, queue_position, status, recommended_arrival_time)
VALUES
('tok-142', 'M-142', 'farmer-001', 'centre-14', 'QR_HASH_M142_VERIFIED', 8, 'ISSUED', CURRENT_TIMESTAMP + INTERVAL '45 minutes'),
('tok-141', 'M-141', 'farmer-002', 'centre-14', 'QR_HASH_M141_VERIFIED', 7, 'EN_ROUTE', CURRENT_TIMESTAMP + INTERVAL '30 minutes'),
('tok-140', 'M-140', 'farmer-003', 'centre-14', 'QR_HASH_M140_VERIFIED', 6, 'ARRIVED', CURRENT_TIMESTAMP + INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Queue
INSERT INTO queue_entries (id, centre_id, token_id, position, current_stage, estimated_wait_minutes, is_shielded_delay)
VALUES
('q-142', 'centre-14', 'tok-142', 8, 'GATE_ENTRY', 48, FALSE),
('q-141', 'centre-14', 'tok-141', 7, 'GATE_ENTRY', 42, FALSE),
('q-140', 'centre-14', 'tok-140', 6, 'MOISTURE_ASSAY', 35, FALSE)
ON CONFLICT (id) DO NOTHING;
