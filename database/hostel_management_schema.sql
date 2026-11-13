-- HOSTEL MANAGEMENT SYSTEM - PostgreSQL Schema
-- Database: hostel_management
-- IMPORTANT: Run this AFTER creating the hostel_management database.

CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN','WARDEN','STUDENT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostels (
    hostel_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hostel_name VARCHAR(100) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE','FEMALE')),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wardens (
    warden_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(user_id),
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(120) UNIQUE,
    hostel_id BIGINT NOT NULL REFERENCES hostels(hostel_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
    student_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(user_id),
    full_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE','FEMALE')),
    dob DATE,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(120) UNIQUE,
    address TEXT,
    guardian_name VARCHAR(100),
    guardian_contact VARCHAR(15),
    college_name VARCHAR(150),
    course VARCHAR(100),
    academic_year VARCHAR(20),
    admission_date DATE NOT NULL,
    emergency_contact VARCHAR(15),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','CHECKED_OUT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blocks (
    block_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hostel_id BIGINT NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
    block_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
    UNIQUE (hostel_id, block_name)
);

CREATE TABLE floors (
    floor_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    block_id BIGINT NOT NULL REFERENCES blocks(block_id) ON DELETE CASCADE,
    floor_number INT NOT NULL CHECK (floor_number >= 0),
    UNIQUE (block_id, floor_number)
);

CREATE TABLE rooms (
    room_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    floor_id BIGINT NOT NULL REFERENCES floors(floor_id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(20) NOT NULL DEFAULT 'SHARED' CHECK (room_type IN ('SINGLE','DOUBLE','SHARED')),
    capacity INT NOT NULL CHECK (capacity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','FULL','MAINTENANCE')),
    UNIQUE (floor_id, room_number)
);

CREATE TABLE beds (
    bed_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    bed_number INT NOT NULL CHECK (bed_number > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','OCCUPIED','MAINTENANCE')),
    UNIQUE (room_id, bed_number)
);

CREATE TABLE room_allocations (
    allocation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    bed_id BIGINT NOT NULL REFERENCES beds(bed_id),
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED')),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE UNIQUE INDEX uq_active_student_allocation ON room_allocations(student_id) WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX uq_active_bed_allocation ON room_allocations(bed_id) WHERE status = 'ACTIVE';

CREATE TABLE room_transfers (
    transfer_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    old_bed_id BIGINT NOT NULL REFERENCES beds(bed_id),
    new_bed_id BIGINT NOT NULL REFERENCES beds(bed_id),
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    approved_by BIGINT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (old_bed_id <> new_bed_id)
);

CREATE TABLE fee_structures (
    fee_structure_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL UNIQUE,
    annual_fee NUMERIC(12,2) NOT NULL CHECK (annual_fee >= 0),
    installment_count INT NOT NULL DEFAULT 1 CHECK (installment_count > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_fees (
    student_fee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    fee_structure_id BIGINT NOT NULL REFERENCES fee_structures(fee_structure_id),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    pending_amount NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    payment_option VARCHAR(20) NOT NULL CHECK (payment_option IN ('FULL','INSTALLMENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PARTIAL','PAID')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, fee_structure_id),
    CHECK (paid_amount <= total_amount)
);

CREATE TABLE payments (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_fee_id BIGINT NOT NULL REFERENCES student_fees(student_fee_id),
    installment_no INT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('CASH','UPI','CARD','BANK_TRANSFER')),
    transaction_ref VARCHAR(100),
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_fee_id, installment_no)
);

CREATE TABLE attendance (
    attendance_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    attendance_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT','ABSENT')),
    marked_by BIGINT REFERENCES users(user_id),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, attendance_date)
);

CREATE TABLE complaints (
    complaint_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    category VARCHAR(30) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ASSIGNED','IN_PROGRESS','RESOLVED','REOPENED')),
    assigned_to BIGINT REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE TABLE maintenance_requests (
    request_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT REFERENCES students(student_id),
    hostel_id BIGINT NOT NULL REFERENCES hostels(hostel_id),
    room_id BIGINT REFERENCES rooms(room_id),
    category VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','EMERGENCY')),
    assigned_to BIGINT REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','REOPENED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE TABLE notices (
    notice_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30),
    priority VARCHAR(10) NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL','IMPORTANT','URGENT')),
    posted_by BIGINT NOT NULL REFERENCES users(user_id),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('ALL','BOYS','GIRLS','BLOCK')),
    target_block_id BIGINT REFERENCES blocks(block_id),
    attachment_url TEXT,
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ((target_type = 'BLOCK' AND target_block_id IS NOT NULL) OR (target_type <> 'BLOCK' AND target_block_id IS NULL))
);

CREATE TABLE notice_reads (
    notice_read_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    notice_id BIGINT NOT NULL REFERENCES notices(notice_id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (notice_id, student_id)
);

CREATE TABLE visitors (
    visitor_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    relation VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visitor_logs (
    visitor_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    visitor_id BIGINT NOT NULL REFERENCES visitors(visitor_id),
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    purpose VARCHAR(150),
    check_in TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMPTZ,
    approved_by BIGINT REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL DEFAULT 'INSIDE' CHECK (status IN ('INSIDE','COMPLETED')),
    CHECK (check_out IS NULL OR check_out >= check_in)
);

CREATE TABLE checkins (
    checkin_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    allocation_id BIGINT NOT NULL REFERENCES room_allocations(allocation_id),
    checkin_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    academic_year VARCHAR(20) NOT NULL,
    verified_by BIGINT REFERENCES users(user_id)
);

CREATE TABLE checkouts (
    checkout_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(student_id),
    allocation_id BIGINT REFERENCES room_allocations(allocation_id),
    checkout_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(150),
    fee_clearance BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by BIGINT REFERENCES users(user_id),
    remarks TEXT
);

CREATE INDEX idx_students_gender ON students(gender);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_blocks_hostel ON blocks(hostel_id);
CREATE INDEX idx_floors_block ON floors(block_id);
CREATE INDEX idx_rooms_floor ON rooms(floor_id);
CREATE INDEX idx_beds_room ON beds(room_id);
CREATE INDEX idx_allocations_student ON room_allocations(student_id);
CREATE INDEX idx_allocations_bed ON room_allocations(bed_id);
CREATE INDEX idx_payments_student_fee ON payments(student_fee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_notices_status ON notices(status);
CREATE INDEX idx_visitors_student ON visitor_logs(student_id);

-- Default master data
INSERT INTO fee_structures (academic_year, annual_fee, installment_count, is_active)
VALUES ('2026-27', 60000.00, 4, TRUE);

INSERT INTO hostels (hostel_name, gender, address)
VALUES
    ('Boys Hostel', 'MALE', 'Main Campus'),
    ('Girls Hostel', 'FEMALE', 'Main Campus');

-- Later, Node.js/Express will enforce:
-- 1. Boys student -> Boys Hostel only
-- 2. Girls student -> Girls Hostel only
-- 3. One active allocation per student
-- 4. One active allocation per bed
-- 5. Automatic bed/room status updates
-- 6. Fee/payment status updates
-- 7. Transaction-safe room transfers

-- END OF SCHEMA
