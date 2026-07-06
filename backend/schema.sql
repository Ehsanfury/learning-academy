-- ============================================
-- Learning Academy Database Schema
-- Version: 2.0 - Updated to match models
-- ============================================

-- ============================================
-- 👤 Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar VARCHAR(255),
    bio TEXT,
    role VARCHAR(20) DEFAULT 'user',
    language VARCHAR(10) DEFAULT 'fa',
    theme VARCHAR(20) DEFAULT 'light',
    native_language VARCHAR(10) DEFAULT 'fa',
    learning_goal VARCHAR(10) DEFAULT 'A1',
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 50,
    notifications BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    streak_reminder BOOLEAN DEFAULT true,
    auto_play_audio BOOLEAN DEFAULT false,
    refresh_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    last_active_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ============================================
-- 📝 Lessons Table
-- ============================================
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_number INTEGER NOT NULL,
    unit INTEGER,
    title JSONB,
    level VARCHAR(5) NOT NULL,
    cefr VARCHAR(5),
    description JSONB,
    content JSONB,
    sections JSONB,
    xp_reward INTEGER DEFAULT 50,
    perfect_bonus_xp INTEGER DEFAULT 25,
    estimated_minutes INTEGER DEFAULT 20,
    total_sections INTEGER DEFAULT 0,
    prerequisites JSONB,
    is_active BOOLEAN DEFAULT true,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 📊 Lesson Progress Table
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started',
    score INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    answers JSONB,
    time_spent INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- ============================================
-- 🏆 Achievements Table
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL,
    description JSONB,
    icon VARCHAR(50),
    category VARCHAR(50),
    xp_reward INTEGER DEFAULT 0,
    condition_type VARCHAR(50),
    condition_value INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 👤 User Achievements Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    is_earned BOOLEAN DEFAULT false,
    is_viewed BOOLEAN DEFAULT false,
    progress INTEGER DEFAULT 0,
    earned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- ============================================
-- 📖 Vocabulary Table
-- ============================================
CREATE TABLE IF NOT EXISTS vocabularies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    de VARCHAR(255) NOT NULL,
    fa VARCHAR(255) NOT NULL,
    en VARCHAR(255),
    gender VARCHAR(10),
    plural VARCHAR(255),
    pronunciation VARCHAR(255),
    category VARCHAR(50),
    level VARCHAR(5),
    example JSONB,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 📚 Word Progress Table (Spaced Repetition)
-- ============================================
CREATE TABLE IF NOT EXISTS word_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
    ease_factor DECIMAL(5,2) DEFAULT 2.5,
    interval INTEGER DEFAULT 1,
    repetitions INTEGER DEFAULT 0,
    next_review_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

-- ============================================
-- 💬 AI Conversations Table
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sender VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 🧑‍🏫 Mentors Table
-- ============================================
CREATE TABLE IF NOT EXISTS mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specialties JSONB,
    languages JSONB,
    levels JSONB,
    hourly_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    total_sessions INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 📅 Mentor Sessions Table
-- ============================================
CREATE TABLE IF NOT EXISTS mentor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    review TEXT,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 📚 Stories Table
-- ============================================
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(5) NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    icon VARCHAR(50),
    paragraphs JSONB,
    quiz JSONB,
    xp_reward INTEGER DEFAULT 30,
    estimated_minutes INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 📖 Story Progress Table
-- ============================================
CREATE TABLE IF NOT EXISTS story_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'not_started',
    completed_at TIMESTAMP,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, story_id)
);

-- ============================================
-- 🎭 Scenarios Table
-- ============================================
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(5) NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    icon VARCHAR(50),
    start_message JSONB,
    steps JSONB,
    xp_reward INTEGER DEFAULT 50,
    estimated_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 📊 XP History Table
-- ============================================
CREATE TABLE IF NOT EXISTS xp_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    total_xp INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL,
    source_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 🔄 Refresh Tokens Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 📧 Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 🔍 Indexes
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp);
CREATE INDEX IF NOT EXISTS idx_users_streak ON users(streak);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_date);

-- Lessons
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit);

-- Progress
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);

-- Vocabulary
CREATE INDEX IF NOT EXISTS idx_vocabularies_de ON vocabularies(de);
CREATE INDEX IF NOT EXISTS idx_vocabularies_category ON vocabularies(category);
CREATE INDEX IF NOT EXISTS idx_vocabularies_level ON vocabularies(level);

-- Word Progress
CREATE INDEX IF NOT EXISTS idx_word_progress_user ON word_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_word_progress_review ON word_progress(next_review_date);

-- AI Conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);

-- Refresh Tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON user_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON user_refresh_tokens(expires_at);