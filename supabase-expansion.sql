-- ═══════════════════════════════════════════════════════════════════
-- Trishala.bt — Platform Expansion: Classifieds, Services, Jobs
-- ═══════════════════════════════════════════════════════════════════

-- ============================================================
-- SECTION 1: CLASSIFIEDS
-- ============================================================

CREATE TABLE classified_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE classifieds (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12,2),
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed','negotiable','free','exchange')),
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new','like-new','good','fair','used')),
  category_id BIGINT REFERENCES classified_categories(id) ON DELETE SET NULL,
  location TEXT,
  city TEXT,
  images TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','expired','deleted')),
  views_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classifieds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active classifieds" ON classifieds FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create classifieds" ON classifieds FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own classifieds" ON classifieds FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- SECTION 2: SERVICES (Marketplace)
-- ============================================================

CREATE TABLE service_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id BIGINT REFERENCES service_categories(id) ON DELETE SET NULL,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed','hourly','quote','free')),
  price NUMERIC(12,2),
  location TEXT,
  city TEXT,
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count BIGINT DEFAULT 0,
  booking_count BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
  views_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved services" ON services FOR SELECT USING (status = 'approved');
CREATE POLICY "Providers can manage own services" ON services FOR ALL USING (provider_id = auth.uid());

CREATE TABLE service_bookings (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  message TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can create bookings" ON service_bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Clients can view own bookings" ON service_bookings FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Providers can view own bookings" ON service_bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM services WHERE id = service_bookings.service_id AND provider_id = auth.uid())
);

CREATE TABLE service_reviews (
  id BIGSERIAL PRIMARY KEY,
  service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read service reviews" ON service_reviews FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can review services" ON service_reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- SECTION 3: JOBS
-- ============================================================

CREATE TABLE job_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
  id BIGSERIAL PRIMARY KEY,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  category_id BIGINT REFERENCES job_categories(id) ON DELETE SET NULL,
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time','part-time','contract','internship','volunteer')),
  work_type TEXT DEFAULT 'on-site' CHECK (work_type IN ('on-site','remote','hybrid')),
  location TEXT,
  city TEXT,
  salary_min NUMERIC(10,2),
  salary_max NUMERIC(10,2),
  salary_currency TEXT DEFAULT 'BTN',
  salary_period TEXT DEFAULT 'monthly' CHECK (salary_period IN ('hourly','daily','monthly','yearly')),
  application_email TEXT,
  application_url TEXT,
  application_deadline DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','filled','expired','draft')),
  views_count BIGINT DEFAULT 0,
  application_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Employers can manage own jobs" ON jobs FOR ALL USING (employer_id = auth.uid());

CREATE TABLE job_applications (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','shortlisted','rejected','hired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants can apply" ON job_applications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Applicants can view own applications" ON job_applications FOR SELECT USING (applicant_id = auth.uid());
CREATE POLICY "Employers can view applications" ON job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE id = job_applications.job_id AND employer_id = auth.uid())
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Classified categories
INSERT INTO classified_categories (name, slug, icon) VALUES
  ('Electronics & Gadgets', 'electronics', 'monitor'),
  ('Vehicles', 'vehicles', 'car'),
  ('Property & Rentals', 'property', 'home'),
  ('Furniture & Home', 'furniture', 'sofa'),
  ('Fashion & Beauty', 'fashion', 'shirt'),
  ('Books & Learning', 'books', 'book'),
  ('Sports & Outdoors', 'sports', 'bike'),
  ('Pets & Animals', 'pets', 'dog'),
  ('Food & Agriculture', 'food', 'apple'),
  ('Services Offered', 'services-offered', 'briefcase');

-- Service categories
INSERT INTO service_categories (name, slug, icon, description) VALUES
  ('Home Services', 'home-services', 'home', 'Plumbers, electricians, painters, cleaners'),
  ('Tech & IT', 'tech-it', 'monitor', 'Web dev, IT support, repairs, design'),
  ('Health & Wellness', 'health-wellness', 'heart', 'Massage, yoga, fitness training'),
  ('Beauty & Grooming', 'beauty-grooming', 'sparkles', 'Salon, barber, makeup, nails'),
  ('Education & Tutoring', 'education-tutoring', 'book', 'Tutors, language classes, coaching'),
  ('Transport & Delivery', 'transport-delivery', 'truck', 'Taxi, delivery, moving, courier'),
  ('Photography & Video', 'photography-video', 'camera', 'Photographers, videographers, editing'),
  ('Events & Catering', 'events-catering', 'calendar', 'Event planning, catering, decor'),
  ('Legal & Financial', 'legal-financial', 'scale', 'Lawyers, accountants, consultants'),
  ('Automotive Services', 'automotive-services', 'wrench', 'Mechanics, repairs, car wash');

-- Job categories
INSERT INTO job_categories (name, slug, icon) VALUES
  ('Information Technology', 'information-technology', 'monitor'),
  ('Hospitality & Tourism', 'hospitality-tourism', 'building'),
  ('Education & Training', 'education-training', 'book'),
  ('Healthcare & Medical', 'healthcare-medical', 'heart'),
  ('Sales & Marketing', 'sales-marketing', 'trending-up'),
  ('Construction & Engineering', 'construction-engineering', 'hard-hat'),
  ('Finance & Accounting', 'finance-accounting', 'scale'),
  ('Government & Civil Service', 'government-civil', 'shield'),
  ('Retail & Customer Service', 'retail-customer', 'shopping-bag'),
  ('Transport & Logistics', 'transport-logistics', 'truck');

-- ============================================================
-- FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION increment_classified_view(id BIGINT)
RETURNS VOID AS $$ BEGIN
  UPDATE classifieds SET views_count = views_count + 1 WHERE id = $1;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_service_view(id BIGINT)
RETURNS VOID AS $$ BEGIN
  UPDATE services SET views_count = views_count + 1 WHERE id = $1;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_job_view(id BIGINT)
RETURNS VOID AS $$ BEGIN
  UPDATE jobs SET views_count = views_count + 1 WHERE id = $1;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_job_applications(id BIGINT)
RETURNS VOID AS $$ BEGIN
  UPDATE jobs SET application_count = application_count + 1 WHERE id = $1;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$ BEGIN
  UPDATE services SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM service_reviews WHERE service_id = NEW.service_id),
    review_count = (SELECT COUNT(*) FROM service_reviews WHERE service_id = NEW.service_id)
  WHERE id = NEW.service_id;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_service_review
  AFTER INSERT OR UPDATE ON service_reviews FOR EACH ROW EXECUTE FUNCTION update_service_rating();
