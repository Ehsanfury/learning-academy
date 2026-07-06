-- ==========================================
-- German Academy Database Schema
-- PostgreSQL
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    native_language VARCHAR(2) DEFAULT 'fa',
    learning_goal VARCHAR(50) DEFAULT 'general',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_active_date DATE,
    daily_goal INTEGER DEFAULT 50,
    sound_enabled BOOLEAN DEFAULT TRUE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    streak_reminder_enabled BOOLEAN DEFAULT TRUE,
    auto_play_audio BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- LESSONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    level VARCHAR(2) NOT NULL,
    unit INTEGER NOT NULL,
    lesson_number INTEGER NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    xp_reward INTEGER DEFAULT 50,
    estimated_minutes INTEGER DEFAULT 20,
    difficulty INTEGER DEFAULT 1,
    prerequisites TEXT[] DEFAULT '{}',
    next_lesson_id VARCHAR(50),
    content JSONB,
    version VARCHAR(10) DEFAULT '1.0.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- LESSON PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed, perfect
    score INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    answers JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- ==========================================
-- VOCABULARY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS vocabulary (
    id VARCHAR(100) PRIMARY KEY,
    de VARCHAR(100) NOT NULL,
    fa VARCHAR(100),
    en VARCHAR(100),
    level VARCHAR(2),
    category VARCHAR(50),
    part_of_speech VARCHAR(20),
    gender VARCHAR(5),
    plural VARCHAR(100),
    pronunciation VARCHAR(100),
    example JSONB,
    audio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WORD PROGRESS TABLE (Spaced Repetition)
-- ==========================================
CREATE TABLE IF NOT EXISTS word_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id VARCHAR(100) NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
    ease_factor FLOAT DEFAULT 2.5,
    interval INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    last_quality INTEGER,
    last_review_date DATE,
    next_review_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

-- ==========================================
-- ACHIEVEMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    name JSONB NOT NULL,
    description JSONB,
    category VARCHAR(30),
    icon VARCHAR(10),
    badge_color VARCHAR(20),
    xp_reward INTEGER DEFAULT 0,
    requirement JSONB,
    is_secret BOOLEAN DEFAULT FALSE,
    requires_achievements TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- USER ACHIEVEMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- ==========================================
-- STORIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS stories (
    id VARCHAR(50) PRIMARY KEY,
    level VARCHAR(2) NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    content JSONB,
    xp_reward INTEGER DEFAULT 30,
    duration INTEGER DEFAULT 5,
    image VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SCENARIOS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS scenarios (
    id VARCHAR(50) PRIMARY KEY,
    level VARCHAR(2) NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    icon VARCHAR(10),
    phrases JSONB,
    xp_reward INTEGER DEFAULT 40,
    duration INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- AI CONVERSATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(20) DEFAULT 'chat',
    scenario_id VARCHAR(50),
    messages JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_level ON users(level);

-- Lesson progress indexes
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);

-- Word progress indexes
CREATE INDEX idx_word_progress_user_id ON word_progress(user_id);
CREATE INDEX idx_word_progress_next_review ON word_progress(next_review_date);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_word_progress_updated_at BEFORE UPDATE ON word_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- INITIAL DATA (Seed)
-- ==========================================

-- Insert basic achievements
INSERT INTO achievements (id, name, description, category, icon, xp_reward, requirement) VALUES
('first_lesson', '{"fa": "اولین قدم", "en": "First Step"}', '{"fa": "اولین درس را کامل کن", "en": "Complete your first lesson"}', 'learning', '🎯', 100, '{"type": "lessons_completed", "value": 1}'),
('streak_7', '{"fa": "استریک ۷ روزه", "en": "7-Day Streak"}', '{"fa": "۷ روز متوالی تمرین کن", "en": "Practice for 7 days straight"}', 'streak', '🔥', 150, '{"type": "streak_days", "value": 7}');

-- Insert sample vocabulary
INSERT INTO vocabulary (id, de, fa, en, level, category, part_of_speech, gender, example) VALUES
('hallo', 'Hallo', 'سلام', 'Hello', 'A1', 'greetings', 'interjection', NULL, '{"de": "Hallo, wie geht es dir?", "fa": "سلام، حالت چطوره؟"}'),
('guten_morgen', 'Guten Morgen', 'صبح بخیر', 'Good morning', 'A1', 'greetings', 'phrase', NULL, '{"de": "Guten Morgen! Hast du gut geschlafen?", "fa": "صبح بخیر! خوب خوابیدی؟"}');

COMMIT;