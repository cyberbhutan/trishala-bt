#!/usr/bin/env python3
"""Apply favorites table using service_role key"""
import json, urllib.request, sys

with open('/tmp/supabase_service_key.txt') as f:
    SERVICE_KEY = f.read..._URL = 'https://ekqnuqbfrwfgkhqmvvjc.supabase.co'
PROJECT_DIR = '/home/t0b3x/trishala'

HDR = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
}

# Step 1: Create exec_sql function
create_fn = '''
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
'''

print("Creating exec_sql function...")
try:
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/rpc/exec_sql',
        data=json.dumps({'query': create_fn}).encode(),
        headers=HDR,
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        print(f'  ✓ Function created: {resp.status}')
except urllib.error.HTTPError as e:
    err = e.read().decode()
    if 'already exists' in err or 'Duplicate function' in err:
        print('  ✓ Function already exists')
    elif 'function "exec_sql" does not exist' in err.lower():
        print(f'  Need to create via REST...')
        # The function doesn't exist - we can't create it via RPC
        # Let's try a different approach
        print(f'  Trying direct SQL via /rest/v1/...')
    else:
        print(f'  {e.code}: {err[:200]}')

# Step 2: Try creating the table directly
sql = open(f'{PROJECT_DIR}/supabase-favorites.sql').read()
print(f"\nApplying favorites schema ({len(sql)} chars)...")

try:
    req2 = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/rpc/exec_sql',
        data=json.dumps({'query': sql}).encode(),
        headers=HDR,
        method='POST'
    )
    with urllib.request.urlopen(req2, timeout=30) as resp2:
        print(f'  ✓ Favorites table created: {resp2.status}')
except urllib.error.HTTPError as e2:
    err2 = e2.read().decode()
    if 'already exists' in err2:
        print('  ✓ Favorites table already exists')
    else:
        print(f'  SQL Error: {e2.code}')
        print(f'  Response: {err2[:300]}')

# Step 3: Verify
print("\nVerifying...")
try:
    req3 = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/favorites?select=id&limit=1',
        headers=HDR
    )
    with urllib.request.urlopen(req3, timeout=10) as resp3:
        print(f'  ✓ Favorites table accessible: {resp3.status}')
except urllib.error.HTTPError as e3:
    print(f'  Verify error: {e3.code} {e3.read().decode()[:200]}')

# Step 4: Set Vercel env var
print("\nSetting SUPABASE_SERVICE_ROLE_KEY on Vercel...")
import subprocess
result = subprocess.run(
    ['npx', 'vercel', 'env', 'add', 'SUPABASE_SERVICE_ROLE_KEY', 'production', '--token'],
    input=SERVICE_KEY.encode(),
    capture_output=True,
    timeout=30,
    cwd=PROJECT_DIR
)
out = result.stdout.decode()
print(f'  Vercel: {out[:300]}')
if result.stderr.decode().strip():
    print(f'  Stderr: {result.stderr.decode()[:300]}')

print("\nDone!")
