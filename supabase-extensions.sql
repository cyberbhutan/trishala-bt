-- Claim Requests table (for "Claim this Business" feature)
CREATE TABLE IF NOT EXISTS claim_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own claims" ON claim_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own claims" ON claim_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage claims" ON claim_requests FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE INDEX IF NOT EXISTS idx_claim_requests_business ON claim_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_user ON claim_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);

-- Reports table (for "Report Listing" feature)
CREATE TABLE IF NOT EXISTS reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own reports" ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read reports" ON reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE INDEX IF NOT EXISTS idx_reports_item ON reports(item_type, item_id);

-- GRANT permissions
GRANT ALL ON claim_requests TO service_role, anon;
GRANT USAGE ON SEQUENCE claim_requests_id_seq TO service_role, anon;
GRANT ALL ON reports TO service_role, anon;
GRANT USAGE ON SEQUENCE reports_id_seq TO service_role, anon;
