-- 채널 테이블: 사용자가 추적하는 YouTube 채널 정보
CREATE TABLE IF NOT EXISTS tracked_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  subscriber_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- 영상 테이블: 크롤링된 영상 정보
CREATE TABLE IF NOT EXISTS crawled_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  thumbnail_maxres TEXT,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_new BOOLEAN DEFAULT TRUE
);

-- 썸네일 다운로드 기록 테이블
CREATE TABLE IF NOT EXISTS thumbnail_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE tracked_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawled_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE thumbnail_downloads ENABLE ROW LEVEL SECURITY;

-- tracked_channels 정책
CREATE POLICY "Users can view their own tracked channels" ON tracked_channels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracked channels" ON tracked_channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked channels" ON tracked_channels
  FOR DELETE USING (auth.uid() = user_id);

-- crawled_videos 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view crawled videos" ON crawled_videos
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert crawled videos" ON crawled_videos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update crawled videos" ON crawled_videos
  FOR UPDATE USING (true);

-- thumbnail_downloads 정책
CREATE POLICY "Users can view their own downloads" ON thumbnail_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" ON thumbnail_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tracked_channels_user_id ON tracked_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_channels_channel_id ON tracked_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_crawled_videos_channel_id ON crawled_videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_crawled_videos_video_id ON crawled_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_crawled_videos_published_at ON crawled_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawled_videos_view_updated_at ON crawled_videos(view_updated_at);

