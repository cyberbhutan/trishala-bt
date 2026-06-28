const { Client } = require('pg');
const fs = require('fs');

const SERVICE_KEY = fs.readFileSync('/tmp/supabase_service_key.txt', 'utf8').trim();
const SQL = fs.readFileSync('/home/t0b3x/trishala/supabase-favorites.sql', 'utf8');

// Direct database connection using service_role JWT as password
const client = new Client({
  host: 'db.ekqnuqbfrwfgkhqmvvjc.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: SERVICE_KEY,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function main() {
  try {
    await client.connect();
    console.log('✓ Connected to PostgreSQL!');

    // Execute the SQL
    await client.query(SQL);
    console.log('✓ Favorites table created!');

    // Verify
    const { rows } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites'"
    );
    if (rows.length > 0) {
      console.log('✓ Favorites table verified in schema!');
    }

    await client.end();
    console.log('\n✅ All done! Favorites system is ready.');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    
    if (err.message.includes('password') || err.message.includes('authentication')) {
      console.log('\nThe service_role JWT cannot be used as a database password directly.');
      console.log('Need the actual database password from Supabase dashboard.');
      console.log('\nAlternative: Run the SQL manually at:');
      console.log('https://supabase.com/dashboard/project/ekqnuqbfrwfgkhqmvvjc/sql/new');
    } else if (err.message.includes('ETIMEDOUT') || err.message.includes('ENOTFOUND')) {
      console.log('\nCannot reach database host. Check network/firewall.');
    }
  }
}

main();
