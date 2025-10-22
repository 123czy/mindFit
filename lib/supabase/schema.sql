-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  twitter TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  tags TEXT[],
  is_paid BOOLEAN DEFAULT false,
  price NUMERIC(20, 6),
  paid_content TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(20, 6) NOT NULL,
  currency TEXT DEFAULT 'mUSDT',
  image_url TEXT,
  file_url TEXT,
  category TEXT,
  stock INTEGER,
  sales_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_wallet TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_wallet TEXT NOT NULL,
  amount NUMERIC(20, 6) NOT NULL,
  currency TEXT DEFAULT 'mUSDT',
  tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post_purchases table (for paid posts)
CREATE TABLE IF NOT EXISTS public.post_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  buyer_wallet TEXT NOT NULL,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_wallet TEXT NOT NULL,
  amount NUMERIC(20, 6) NOT NULL,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(buyer_id, post_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_wallet_address ON public.posts(wallet_address);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_wallet_address ON public.products(wallet_address);
CREATE INDEX IF NOT EXISTS idx_products_post_id ON public.products(post_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON public.purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON public.purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_seller_id ON public.purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);

CREATE INDEX IF NOT EXISTS idx_post_purchases_buyer_id ON public.post_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_post_purchases_post_id ON public.post_purchases(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (true);

-- RLS Policies for posts table
CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (true);

-- RLS Policies for products table
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own products" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own products" ON public.products
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own products" ON public.products
  FOR DELETE USING (true);

-- RLS Policies for purchases table
CREATE POLICY "Purchases are viewable by buyer and seller" ON public.purchases
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own purchases" ON public.purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own purchases" ON public.purchases
  FOR UPDATE USING (true);

-- RLS Policies for post_purchases table
CREATE POLICY "Post purchases are viewable by buyer and seller" ON public.post_purchases
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own post purchases" ON public.post_purchases
  FOR INSERT WITH CHECK (true);

-- RLS Policies for comments table
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (true);

-- RLS Policies for likes table
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own likes" ON public.likes
  FOR DELETE USING (true);

