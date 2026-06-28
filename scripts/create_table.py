#!/usr/bin/env python3
"""Create favorites table via Supabase Management API"""
import json, urllib.request

PROJECT_REF = 'ekqnuqbfrwfgkhqmvvjc'

# Read tokens at runtime
with open('/tmp/supabase_token.txt') as f:
    TOKEN = f.read().strip()

with open('/tmp/supabase_service_key.txt') as f:
    SVC_KEY = f.read().strip()

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

# Step 1: Create exec_sql function
print("Step 1: Creating exec_sql function...")
create_fn = "CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void AS $func$ BEGIN EXECUTE query; END; $func$ LANGUAGE plpgsql SECURITY DEFINER;"

try:
    body = json.dumps({'query': create_fn}).encode()
    req = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{PROJECT_REF}/sql',
        data=body, headers=headers, method='POST'
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f"  Status: {resp.status}")
except urllib.error.HTTPError as e:
    err = e.read().decode()
    print(f"  Error: {e.code} {err[:200]}")

# Step 2: Create favorites table
print("Step 2: Creating favorites table...")
fav_sql = open('/home/t0b3x/trishala/supabase-favorites.sql').read()

try:
    body = json.dumps({'query': fav_sql}).encode()
    req = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{PROJECT_REF}/sql',
        data=body, headers=headers, method='POST'
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f"  Status: {resp.status}")
except urllib.error.HTTPError as e:
    err = e.read().decode()
    print(f"  Error: {e.code} {err[:300]}")

# Step 3: Verify
print("Step 3: Verifying...")
try:
    svc_headers = {
        'apikey': SVC_KEY,
        'Authorization': f'Bearer {SVC_KEY}',
    }
    req = urllib.request.Request(
        f'https://{PROJECT_REF}.supabase.co/rest/v1/favorites?select=id&limit=1',
        headers=svc_headers
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(f"  Verified! Status: {resp.status}")
except urllib.error.HTTPError as e:
    err = e.read().decode()
    print(f"  Verify: {e.code} {err[:200]}")

print("\nDone!")
