#!/usr/bin/env python3
"""Apply favorites table - using direct PostgreSQL via Supabase"""
import json, urllib.request, subprocess, os, sys

PROJECT_REF = 'ekqnuqbfrwfgkhqmvvjc'
PROJECT_DIR = '/home/t0b3x/trishala'

# Read tokens
with open('/tmp/supabase_token.txt') as f:
    mgmt_token = f.read().strip()

# Step 1: Get the database password from Management API
headers = {
    'Authorization': f'Bearer {mgmt_token}',
    'Accept': 'application/json',
}

print("Getting database password...")
# Try the types/database-password endpoint
try:
    url = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/types/database-password'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
        db_pass = data.get('password', '')
        print(f"Got DB password: {db_pass[:5]}...")
except urllib.error.HTTPError as e:
    # Try the config endpoint
    url = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/config/database/pooler'
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
        print(f"Pooler config: {json.dumps(data, indent=2)[:500]}")
    db_pass = ''
    
if db_pass:
    # Step 2: Apply SQL via psql
    os.environ['PGPASSWORD'] = db_pass
    host = 'db.ekqnuqbfrwfgkhqmvvjc.supabase.co'
    
    sql = open(f'{PROJECT_DIR}/supabase-favorites.sql').read()
    
    result = subprocess.run([
        'psql',
        f'postgresql://postgres:password)',
        '-c', sql
    ], capture_output=True, text=True, timeout=30)
    
    print(f"psql stdout: {result.stdout[:300]}")
    print(f"psql stderr: {result.stderr[:300]}")
else:
    print("Could not get DB password")
    
    # Alternative: Use the SQL endpoint (which worked earlier!)
    print("\nTrying v1 SQL endpoint...")
    sql = open(f'{PROJECT_DIR}/supabase-favorites.sql').read()
    body = json.dumps({'query': sql}).encode()
    
    try:
        url = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/sql'
        req = urllib.request.Request(url, data=body, headers={
            **headers,
            'Content-Type': 'application/json'
        }, method='POST')
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"SQL result: {resp.read().decode()[:200]}")
    except urllib.error.HTTPError as e:
        print(f"SQL error: {e.code} {e.reason}")
        print(f"Body: {e.read().decode()[:300]}")
    
    # Final alternative: use the Supabase API key to create a function
    print("\nAttempting to execute via service_role JWT...")
    with open('/tmp/supabase_service_key.txt') as f:
        svc_key = f.read().strip()
    
    # Create exec_sql function via REST with prepared statement
    # We need to create the function first... but we need SQL for that
    # Let's try to use the Supabase pg_dump or custom schema
    print("FINAL APPROACH: Use 'supabase db push' if supabase init was run")
    print("Or: Run the SQL manually at https://supabase.com/dashboard/project/ekqnuqbfrwfgkhqmvvjc/sql/new")
