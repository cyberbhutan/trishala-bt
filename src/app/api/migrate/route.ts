import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SQL = `
CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('business', 'classified', 'service', 'job')),
  item_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own favorites" ON favorites;
CREATE POLICY "Users read own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own favorites" ON favorites;
CREATE POLICY "Users insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own favorites" ON favorites;
CREATE POLICY "Users delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);
`

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ 
      error: 'No service role key configured',
      note: 'Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars'
    }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey
  )

  // Try to check if table exists first
  const { error: checkError } = await supabase.from('favorites').select('id').limit(1)
  if (!checkError) {
    return NextResponse.json({ message: 'favorites table already exists' })
  }

  // Try to execute SQL via direct query
  const { error } = await supabase.rpc('exec_sql', { query: SQL })
  if (error) {
    // Try creating the function first
    const createFn = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    const fnResult = await supabase.rpc('exec_sql', { query: createFn })
    if (fnResult.error) {
      return NextResponse.json({
        error: 'Cannot create exec_sql function',
        details: fnResult.error.message,
        sql: SQL
      }, { status: 500 })
    }
    
    // Retry
    const retryResult = await supabase.rpc('exec_sql', { query: SQL })
    if (retryResult.error) {
      return NextResponse.json({
        error: retryResult.error.message,
        sql: SQL
      }, { status: 500 })
    }
  }

  // Verify
  const { error: verifyError } = await supabase.from('favorites').select('id').limit(1)
  if (verifyError) {
    return NextResponse.json({
      error: 'Table created but query failed',
      details: verifyError.message
    }, { status: 500 })
  }

  return NextResponse.json({ message: '✓ favorites table created successfully' })
}
