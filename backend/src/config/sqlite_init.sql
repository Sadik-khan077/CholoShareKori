-- Create the foundation tables
CREATE TABLE IF NOT EXISTS locations (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    name            VARCHAR(150)    NOT NULL UNIQUE,
    type            VARCHAR(50)     DEFAULT 'hall',
    is_active       BOOLEAN         DEFAULT 1,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    slug            VARCHAR(100)    NOT NULL UNIQUE,
    icon            VARCHAR(50)     DEFAULT NULL,
    is_active       BOOLEAN         DEFAULT 1,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    registration_no VARCHAR(50)     NOT NULL UNIQUE,
    location        VARCHAR(150)    NOT NULL,
    role            VARCHAR(50)     DEFAULT 'user',
    status          VARCHAR(50)     DEFAULT 'active',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Create the resources table
CREATE TABLE IF NOT EXISTS resources (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER         NOT NULL,
    type            VARCHAR(50)     NOT NULL, 
    listing_type    VARCHAR(50)     NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    category        VARCHAR(100)    NOT NULL, 
    quantity        INTEGER         NOT NULL DEFAULT 1,
    price           DECIMAL(10, 2)  DEFAULT NULL, 
    location        VARCHAR(150)    NOT NULL,
    urgency         VARCHAR(50)     DEFAULT 'medium',
    status          VARCHAR(50)     DEFAULT 'available',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create the matches table
CREATE TABLE IF NOT EXISTS matches (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    offer_id        INTEGER         NOT NULL,
    request_id      INTEGER         NOT NULL,
    provider_id     INTEGER         NOT NULL,
    requester_id    INTEGER         NOT NULL,
    matched_quantity INTEGER        NOT NULL DEFAULT 1,
    status          VARCHAR(50)     DEFAULT 'pending',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id)     REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id)   REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id)  REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id)     ON DELETE CASCADE,
    UNIQUE (offer_id, request_id)
);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    resource_id     INTEGER         NOT NULL,
    requester_id    INTEGER         NOT NULL,
    provider_id     INTEGER         NOT NULL,
    transaction_type VARCHAR(50)    NOT NULL,
    quantity        INTEGER         NOT NULL DEFAULT 1,
    payment_method  VARCHAR(50)     DEFAULT NULL,
    duration_days   INTEGER         DEFAULT NULL,
    status          VARCHAR(50)     DEFAULT 'pending',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id)  REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (provider_id)  REFERENCES users(id)     ON DELETE CASCADE,
    UNIQUE (resource_id, requester_id)
);
