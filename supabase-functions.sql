-- Run these functions in Supabase SQL Editor after the schema

-- Increment view count
CREATE OR REPLACE FUNCTION increment_view_count(business_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE businesses SET views_count = views_count + 1
  WHERE id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment inquiry count
CREATE OR REPLACE FUNCTION increment_inquiry_count(business_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE businesses SET inquiry_count = inquiry_count + 1
  WHERE id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
