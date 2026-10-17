-- ==========================================================================
-- CHOLOSHAREKORI (চলো শেয়ার করি) — JAHANGIRNAGAR UNIVERSITY CAMPUS SCHEMA
-- Robust SQLite Schema with complete column parity for the modern frontend
-- ==========================================================================

PRAGMA foreign_keys = ON;

-- 1. Campus Locations (Halls, Faculties & Meeting Spots)
CREATE TABLE IF NOT EXISTS locations (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    name            VARCHAR(150)    NOT NULL UNIQUE,
    type            VARCHAR(50)     NOT NULL DEFAULT 'hall',
    landmark        VARCHAR(150)    DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 2. Resource Categories
CREATE TABLE IF NOT EXISTS categories (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    label           VARCHAR(100)    NOT NULL,
    icon            VARCHAR(50)     DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table (JU Students & Campus Peers)
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER         PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(100)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    phone           VARCHAR(30)     NOT NULL,
    location        VARCHAR(150)    NOT NULL,
    dept            VARCHAR(150)    DEFAULT 'Computer Science & Engineering',
    batch           VARCHAR(50)     DEFAULT 'Batch 50',
    registration_no VARCHAR(50)     DEFAULT NULL,
    bio             TEXT            DEFAULT NULL,
    avatar_url      TEXT            DEFAULT NULL,
    trust_score     DECIMAL(5, 2)   DEFAULT 99.0,
    karma_points    INTEGER         DEFAULT 350,
    on_time_rate    VARCHAR(10)     DEFAULT '100%',
    role            VARCHAR(20)     DEFAULT 'user',
    status          VARCHAR(20)     DEFAULT 'active',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- 4. Resources Table (5 Core Pillars: lend, borrow, buy, sell, free)
CREATE TABLE IF NOT EXISTS resources (
    id              INTEGER         PRIMARY KEY,
    user_id         INTEGER         NOT NULL,
    type            VARCHAR(50)     NOT NULL DEFAULT 'offer',
    listing_type    VARCHAR(50)     NOT NULL,
    title           VARCHAR(250)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    category        VARCHAR(100)    NOT NULL,
    quantity        INTEGER         NOT NULL DEFAULT 1,
    price           DECIMAL(10, 2)  DEFAULT 0.00,
    location        VARCHAR(150)    NOT NULL,
    pickup_spot     VARCHAR(150)    DEFAULT NULL,
    image_url       TEXT            DEFAULT NULL,
    urgency         VARCHAR(50)     DEFAULT 'medium',
    condition       VARCHAR(100)    DEFAULT 'Verified Student Item',
    status          VARCHAR(50)     DEFAULT 'available',
    views_count     INTEGER         DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Transactions Table (Exchanges, Loans, Orders & Claims)
CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER         PRIMARY KEY,
    resource_id     INTEGER         NOT NULL,
    requester_id    INTEGER         NOT NULL,
    provider_id     INTEGER         NOT NULL,
    transaction_type VARCHAR(50)    NOT NULL,
    quantity        INTEGER         NOT NULL DEFAULT 1,
    payment_method  VARCHAR(50)     DEFAULT 'cash_on_pickup',
    duration_days   INTEGER         DEFAULT NULL,
    pickup_spot     VARCHAR(150)    DEFAULT NULL,
    total_price     DECIMAL(10, 2)  DEFAULT 0.00,
    status          VARCHAR(50)     DEFAULT 'pending',
    rating_given    INTEGER         DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id)  REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (provider_id)  REFERENCES users(id)     ON DELETE CASCADE
);

-- 6. Starred Bookmarks Table
CREATE TABLE IF NOT EXISTS starred (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER         NOT NULL,
    resource_id     INTEGER         NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, resource_id),
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 7. High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_resources_user ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_listing_type ON resources(listing_type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_transactions_requester ON transactions(requester_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions(provider_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_starred_user ON starred(user_id);
