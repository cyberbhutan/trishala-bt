-- Trishala.bt — Business Listings Platform for Bhutan
-- Run this in Supabase SQL Editor

-- 1. CATEGORIES
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BUSINESSES
CREATE TABLE businesses (
  id BIGSERIAL PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  area TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  cover_image TEXT,
  logo_url TEXT,
  photos TEXT[] DEFAULT '{}',
  whatsapp TEXT,
  facebook TEXT,
  instagram TEXT,
  hours JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free','featured','spotlight')),
  views_count BIGINT DEFAULT 0,
  inquiry_count BIGINT DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_tier ON businesses(tier);
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- 3. BUSINESS CATEGORIES (many-to-many)
CREATE TABLE business_categories (
  business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (business_id, category_id)
);

-- 4. REVIEWS
CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  photos TEXT[] DEFAULT '{}',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- 5. INQUIRIES
CREATE TABLE inquiries (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inquiries_business ON inquiries(business_id);

-- 6. SUBSCRIPTIONS (premium tiers)
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('featured','spotlight')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'BTN',
  payment_method TEXT,
  payment_ref TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_business ON subscriptions(business_id);

-- 7. PAGE VIEWS (analytics)
CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  business_id BIGINT REFERENCES businesses(id) ON DELETE CASCADE,
  visitor_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pageviews_business ON page_views(business_id);
CREATE INDEX idx_pageviews_date ON page_views(created_at);

-- 8. USER PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Businesses: public can view approved; owners can manage own
CREATE POLICY "Public can view approved businesses" ON businesses
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners can manage own businesses" ON businesses
  FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Admins can manage all" ON businesses
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Reviews: anyone can read approved; authenticated users can create
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Inquiries: business owners see their own
CREATE POLICY "Owners can view inquiries" ON inquiries
  FOR SELECT USING (EXISTS (SELECT 1 FROM businesses WHERE id = inquiries.business_id AND owner_id = auth.uid()));

-- Profiles: users can read/update own
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update business rating on review change
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE business_id = NEW.business_id AND is_approved = TRUE),
    review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id AND is_approved = TRUE)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_insert_update
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- Seed categories
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Restaurants & Cafés', 'restaurants', 'Places to eat and drink', 'utensils'),
  ('Hotels & Guesthouses', 'hotels', 'Accommodation and lodging', 'building'),
  ('Shopping & Retail', 'shopping', 'Shops and retail stores', 'shopping-bag'),
  ('Services', 'services', 'Professional and personal services', 'briefcase'),
  ('Health & Medical', 'health', 'Hospitals, clinics, pharmacies', 'heart-pulse'),
  ('Education & Training', 'education', 'Schools, colleges, tutors', 'book-open'),
  ('Automotive', 'automotive', 'Car dealers, mechanics, rentals', 'car'),
  ('Real Estate', 'real-estate', 'Property agents, rentals, developers', 'home'),
  ('Technology', 'technology', 'IT services, web dev, electronics', 'monitor'),
  ('Travel & Transport', 'travel', 'Tour operators, taxis, buses', 'plane'),
  ('Beauty & Wellness', 'beauty', 'Salons, spas, fitness', 'sparkles'),
  ('Construction & Trades', 'construction', 'Builders, electricians, plumbers', 'hard-hat');
