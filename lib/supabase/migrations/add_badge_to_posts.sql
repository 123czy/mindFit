-- 为 posts 表添加 badge 字段，用于标识帖子的特殊标签（热门、精选、新作、推荐等）
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS badge TEXT;

-- 添加索引以优化按 badge 查询
CREATE INDEX IF NOT EXISTS idx_posts_badge ON public.posts(badge) WHERE badge IS NOT NULL;

