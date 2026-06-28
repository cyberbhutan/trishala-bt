#!/usr/bin/env python3
"""Execute SQL on Supabase project via Management API"""
import json, urllib.request

PROJECT_REF = 'ekqnuqbfrwfgkhqmvvjc'

# Read management token
with open('/tmp/supabase_token.txt') as f:
    TOKEN = f.read().strip()

# Read SQL
with open('/home/t0b3x/trishala/supabase-favorites.sql') as f:
    SQL = f.read()

# Execute SQL via Management API
url = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/sql'
body = json.dumps({'query': SQL}).encode()
headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

print(f"Executing SQL ({len(SQL)} chars)...")
req = urllib.request.Request(url, data=body, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = resp.read().decode()
        print(f"Status: {resp.status}")
        print(f"Response: {result[:500]}")
except urllib.error.HTTPError as e:
    err = e.read().decode()
    print(f"HTTP Error: {e.code} {e.reason}")
    print(f"Body: {err[:500]}")
except Exception as e:
    print(f"Error: {e}")
