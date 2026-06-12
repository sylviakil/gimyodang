-- 기묘당 (奇妙堂) Supabase 스키마
-- Supabase SQL Editor에 붙여넣고 실행하십시오.

-- 1. stories 테이블
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_status TEXT,
  era TEXT NOT NULL DEFAULT 'joseon'
    CHECK (era IN ('joseon', 'modern')),
  desire_type TEXT NOT NULL,
  desire_content TEXT NOT NULL,
  confection_original TEXT NOT NULL,
  confection_name TEXT NOT NULL,
  confection_ingredients TEXT NOT NULL,
  confection_effect TEXT NOT NULL,
  confection_price TEXT NOT NULL,   -- 대가: NOT NULL 강제 (불변 법칙)
  ending_content TEXT NOT NULL,
  ending_tone TEXT CHECK (ending_tone IN ('warm', 'cold', 'open')),
  card_visual_config JSONB,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. likes 테이블
CREATE TABLE IF NOT EXISTS likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, story_id)
);

-- 3. RLS 정책
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 이야기 읽기" ON stories
  FOR SELECT USING (is_public = true);

CREATE POLICY "본인 이야기 작성" ON stories
  FOR INSERT WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

CREATE POLICY "본인 이야기 수정" ON stories
  FOR UPDATE USING (auth.uid() = author_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "좋아요 읽기" ON likes
  FOR SELECT USING (true);

CREATE POLICY "좋아요 추가" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "좋아요 삭제" ON likes
  FOR DELETE USING (auth.uid() = user_id);
