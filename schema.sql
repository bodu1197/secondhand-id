-- Supabase Schema Setup
-- This script contains all the necessary SQL commands to set up the database schema for the SecondHand.id project.
-- Run this entire script in the Supabase SQL Editor.

-- 1. Enable Extensions
-- These extensions add extra features to the database.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Used for location-based searches.
CREATE EXTENSION IF NOT EXISTS "earthdistance" CASCADE; -- Required for ll_to_earth function. Installs "cube" dependency automatically.

-- ---

-- 2. User Table
-- This table stores public user profile information and is linked to the private Supabase auth.users table.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  avatar TEXT,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  nik_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users are viewable by everyone" 
ON users FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = auth_id);

-- Indexes for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location);

-- ---

-- 3. Listing Table
-- This table stores all the product listings.

-- Custom Types (Enums) for listings
CREATE TYPE category_type AS ENUM (
  'ELECTRONICS', 'FASHION', 'FURNITURE', 'VEHICLES', 'BOOKS', 
  'SPORTS', 'TOYS', 'HOME_APPLIANCES', 'BEAUTY', 'OTHER'
);

CREATE TYPE condition_type AS ENUM (
  'NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'
);

CREATE TYPE listing_status AS ENUM (
  'ACTIVE', 'SOLD', 'RESERVED', 'DELETED'
);

-- listings table definition
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price BIGINT NOT NULL,
  category category_type NOT NULL,
  condition condition_type NOT NULL,
  images TEXT[] NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status listing_status DEFAULT 'ACTIVE',
  views INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable by everyone" 
ON listings FOR SELECT 
USING (status = 'ACTIVE' OR user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own listings" 
ON listings FOR UPDATE 
USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Authenticated users can create listings" 
ON listings FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for faster queries
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_location ON listings USING GIST(ll_to_earth(latitude, longitude)); -- For distance search

-- ---

-- 4. Chat Tables
-- These tables manage the real-time chat functionality.

-- chats table definition
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

-- Custom Type for message content
CREATE TYPE message_type AS ENUM (
  'TEXT', 'IMAGE', 'LOCATION', 'OFFER'
);

-- messages table definition
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  type message_type DEFAULT 'TEXT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for chat tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view chats" 
ON chats FOR SELECT 
USING (
  buyer_id = (SELECT id FROM users WHERE auth_id = auth.uid()) OR 
  seller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

CREATE POLICY "Chat participants can view messages" 
ON messages FOR SELECT 
USING (
  chat_id IN (
    SELECT id FROM chats 
    WHERE buyer_id = (SELECT id FROM users WHERE auth_id = auth.uid()) 
       OR seller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

CREATE POLICY "Chat participants can send messages" 
ON messages FOR INSERT 
WITH CHECK (
  chat_id IN (
    SELECT id FROM chats 
    WHERE buyer_id = (SELECT id FROM users WHERE auth_id = auth.uid()) 
       OR seller_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  )
);

-- Indexes for faster queries
CREATE INDEX idx_chats_buyer_id ON chats(buyer_id);
CREATE INDEX idx_chats_seller_id ON chats(seller_id);
CREATE INDEX idx_chats_listing_id ON chats(listing_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ---

-- 5. Review Table
-- This table stores user reviews and ratings.
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reviewer_id, reviewed_id)
);

-- RLS for reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON reviews FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for faster queries
CREATE INDEX idx_reviews_reviewed_id ON reviews(reviewed_id);

-- ---

-- 6. Report Table
-- This table stores user-submitted reports for moderation.

-- Custom Type for report status
CREATE TYPE report_status AS ENUM (
  'PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED'
);

-- reports table definition
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES users(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for reports table
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- NOTE: This policy is a placeholder. A robust admin role check is needed.
CREATE POLICY "Only admins can view reports" 
ON reports FOR SELECT 
USING (
  (SELECT users.email FROM users WHERE users.auth_id = auth.uid()) LIKE '%@admin.com'
);

CREATE POLICY "Authenticated users can create reports" 
ON reports FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for faster queries
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_listing_id ON reports(listing_id);
