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
CREATE POLICY "Users read own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own favorites" ON favorites;
CREATE POLICY "Users insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own favorites" ON favorites;
CREATE POLICY "Users delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON favorites(item_type, item_id);
`

async function applyViaPg() {
  try {
    const { Client } = require('pg')
    const client = new Client({
      host: 'db.ekqnuqbfrwfgkhqmvvjc.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    })
    await client.connect()
    await client.query(SQL)
    await client.end()
    return { success: true, method: 'pg' }
  } catch (err: any) {
    return { success: false, method: 'pg', error: err.message }
  }
}

async function applyViaSupabase() {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    // Try to create exec_sql function and run SQL
    const createFn = `CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void AS $$ BEGIN EXECUTE query; END; $$ LANGUAGE plpgsql SECURITY DEFINER;`
    
    // Try a different approach - use the pg client internally
    const { error } = await supabase.rpc('exec_sql', { query: SQL })
    if (error) {
      // Try to create the function first
      const fnResult = await supabase.rpc('exec_sql', { query: createFn })
      if (fnResult.error) {
        // Method 3: Try inserting via direct table access (won't work for DDL)
        return { success: false, method: 'supabase', error: error.message }
      }
      // Retry
      const retry = await supabase.rpc('exec_sql', { query: SQL })
      if (retry.error) {
        return { success: false, method: 'supabase', error: retry.error.message }
      }
    }
    return { success: true, method: 'supabase' }
  } catch (err: any) {
    return { success: false, method: 'supabase', error: err.message }
  }
}

async function applyViaFetch() {
  try {
    // Direct HTTP call to Supabase REST API with service key
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    // Create exec_sql function first via direct query
    const createFn = `CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void AS $$ BEGIN EXECUTE query; END; $$ LANGUAGE plpgsql SECURITY DEFINER;`
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'apikey': svcKey!,
        'Authorization': `Bearer ${svcKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: SQL }),
    })
    
    if (!response.ok) {
      const text = await response.text()
      return { success: false, method: 'fetch', error: text }
    }
    return { success: true, method: 'fetch' }
  } catch (err: any) {
    return { success: false, method: 'fetch', error: err.message }
  }
}

export async function GET() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    return NextResponse.json({ 
      error: 'No SUPABASE_SERVICE_ROLE_KEY configured',
      note: 'Set it in Vercel env vars: vercel env add SUPABASE_SERVICE_ROLE_KEY production'
    }, { status: 500 })
  }

  const results: any[] = []
  
  // Try method 1: Direct PostgreSQL
  const pgResult = await applyViaPg()
  results.push(pgResult)
  if (pgResult.success) {
    return NextResponse.json({ message: '✓ Migration applied via direct DB connection', results })
  }

  // Try method 2: Supabase JS client
  const supabaseResult = await applyViaSupabase()
  results.push(supabaseResult)
  if (supabaseResult.success) {
    return NextResponse.json({ message: '✓ Migration applied via Supabase client', results })
  }

  return NextResponse.json({
    error: 'Could not apply migration automatically',
    results,
    sql: SQL,
    instruction: 'Run this SQL in your Supabase Dashboard: https://supabase.com/dashboard/project/ekqnuqbfrwfgkhqmvvjc/sql/new'
  }, { status: 500 })
}
