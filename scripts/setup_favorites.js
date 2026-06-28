const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ekqnuqbfrwfgkhqmvvjc.supabase.co';
const SERVICE_KEY = fs.readFileSync('/tmp/supabase_service_key.txt', 'utf8').trim();
const SQL = fs.readFileSync('/home/t0b3x/trishala/supabase-favorites.sql', 'utf8');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('Creating favorites table...');

  // Method 1: Execute SQL directly via a workaround
  // Supabase allows executing SQL through the REST API if we use
  // a function call to a built-in PostgreSQL function

  // Try creating exec_sql function first by using a SECURITY DEFINER approach
  // We need to find a way to execute raw SQL...

  // Check if there are any built-in functions we can abuse
  const { data: functions, error: fnError } = await supabase.rpc('extensions', {});
  console.log('Extensions:', functions, fnError?.message || 'ok');

  // Method: Use the database.raw() equivalent through the service client
  // The service_key can execute SQL by calling the function directly
  // via the /rest/v1/rpc/ endpoint with custom SQL

  // Actually let's try using pg_database to execute a query
  // Supabase has a built-in function called "execute_sql" sometimes
  for (const fn of ['exec_sql', 'execute_sql', 'run_sql', 'pgm_execute']) {
    const { data, error } = await supabase.rpc(fn, { query: SQL });
    if (!error) {
      console.log(`✓ Success with function "${fn}"!`);
      console.log(data);
      return;
    }
    console.log(`  ${fn}: ${error?.message || 'ok'}`);
  }

  // Last resort - try to create the table by just querying it
  // The service role might have auto-create permissions
  console.log('\nTrying to insert into favorites directly...');
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: '00000000-0000-0000-0000-000000000000', item_type: 'business', item_id: 0 })
    .select();

  if (error) {
    console.log('Insert failed:', error.message);
    console.log('\n❌ Cannot create table automatically.');
    console.log('Please run this SQL in the Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/ekqnuqbfrwfgkhqmvvjc/sql/new');
    console.log('\n' + SQL);
  } else {
    console.log('✓ Table exists!');
    // Clean up test data
    await supabase.from('favorites').delete().eq('user_id', '00000000-0000-0000-0000-000000000000');
  }
}

main().catch(console.error);
