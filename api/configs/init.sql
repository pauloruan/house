CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(6) UNIQUE,
    invite_code_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    pix_key VARCHAR(255),
    house_id UUID REFERENCES houses(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'resident',
    invite_code VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bill_responsibles (
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_due NUMERIC(10, 2) NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (bill_id, user_id)
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    periodicity VARCHAR(50),
    address TEXT,
    cover_image TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    notification_msg VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_participants (
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
