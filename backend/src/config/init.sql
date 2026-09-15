-- Create the foundation tables
CREATE TABLE IF NOT EXISTS locations (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL UNIQUE,
    type            ENUM('hall', 'academic', 'other') DEFAULT 'hall',
    is_active       BOOLEAN         DEFAULT TRUE,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    slug            VARCHAR(100)    NOT NULL UNIQUE,
    icon            VARCHAR(50)     DEFAULT NULL,
    is_active       BOOLEAN         DEFAULT TRUE,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    registration_no VARCHAR(50)     NOT NULL UNIQUE,
    location        VARCHAR(150)    NOT NULL,
    role            ENUM('user', 'admin') DEFAULT 'user',
    status          ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Create the resources table (Your 5 Pillars)
CREATE TABLE IF NOT EXISTS resources (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    type            ENUM('offer', 'request') NOT NULL, 
    listing_type    VARCHAR(50)     NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    category        VARCHAR(100)    NOT NULL, 
    quantity        INT             NOT NULL DEFAULT 1,
    price           DECIMAL(10, 2)  DEFAULT NULL, 
    location        VARCHAR(150)    NOT NULL,
    urgency         ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status          ENUM('available', 'partially_fulfilled', 'fulfilled', 'expired', 'cancelled') DEFAULT 'available',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create the matches table
CREATE TABLE IF NOT EXISTS matches (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    offer_id        INT             NOT NULL,
    request_id      INT             NOT NULL,
    provider_id     INT             NOT NULL,
    requester_id    INT             NOT NULL,
    matched_quantity INT            NOT NULL DEFAULT 1,
    status          ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id)     REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id)   REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id)  REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id)     ON DELETE CASCADE,
    UNIQUE KEY unique_match (offer_id, request_id)
);
