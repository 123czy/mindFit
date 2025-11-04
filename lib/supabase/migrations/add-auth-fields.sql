-- 添加认证相关字段到 users 表
-- 支持多种登录方式：邮箱、微信、Google

-- 添加 email 字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
  END IF;
END $$;

-- 添加 wechat_unionid 字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'wechat_unionid'
  ) THEN
    ALTER TABLE public.users ADD COLUMN wechat_unionid TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_users_wechat_unionid ON public.users(wechat_unionid);
  END IF;
END $$;

-- 添加 google_id 字段（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'google_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN google_id TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id);
  END IF;
END $$;

-- 添加 auth_user_id 字段，关联 Supabase Auth 的用户ID
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
  END IF;
END $$;

-- 注意：wallet_address 字段已存在，但现在是可选的（可以为 NULL）
-- 如果需要，可以修改 wallet_address 的约束，使其可以为 NULL
-- ALTER TABLE public.users ALTER COLUMN wallet_address DROP NOT NULL;
