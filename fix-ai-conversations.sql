-- fix-ai-conversations.sql
-- رفع مشکل created_at در جدول ai_conversations

-- 1. تنظیم مقادیر null برای created_at و updated_at
UPDATE ai_conversations SET 
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW())
WHERE created_at IS NULL OR updated_at IS NULL;

-- 2. اطمینان از اینکه ستون‌ها NOT NULL هستند
ALTER TABLE ai_conversations ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE ai_conversations ALTER COLUMN updated_at SET NOT NULL;

-- 3. تنظیم مقدار پیش‌فرض
ALTER TABLE ai_conversations ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE ai_conversations ALTER COLUMN updated_at SET DEFAULT NOW();