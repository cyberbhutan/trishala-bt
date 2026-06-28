const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://ekqnuqbfrwfgkhqmvvjc.supabase.co'
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8').match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]

const supabase = createClient(supabaseUrl, anonKey)

const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-favorites.sql'), 'utf8')

async function main() {
  // Try to check if table exists
  const { data, error } = await supabase.from('favorites').select('id').limit(1)
  
  if (error && error.message?.includes('relation "favorites" does not exist')) {
    console.log('Table does not exist. Creating via SQL...')
    
    // Try RPC method
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql })
    if (rpcError) {
      console.log('RPC failed:', rpcError.message)
      console.log('\nYou need to run this SQL in the Supabase Dashboard SQL Editor:')
      console.log('Go to: https://supabase.com/dashboard/project/ekqnuqbfrwfgkhqmvvjc/sql/new')
      console.log('\n' + sql)
    } else {
      console.log('✓ Migration applied successfully!')
    }
  } else if (data) {
    console.log('✓ favorites table already exists!')
  } else if (error) {
    console.log('Error checking table:', error.message)
    
    // Try to create the exec_sql function first
    console.log('Attempting to create exec_sql function...')
    const createFn = `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`
    const { error: fnError } = await supabase.rpc('exec_sql', { query: createFn })
    if (fnError) {
      console.log('Cannot create function:', fnError.message)
      console.log('\nPlease run the SQL manually in the Supabase Dashboard.')
      console.log('SQL file: supabase-favorites.sql')
    }
  }
}

main().catch(console.error)
