#!/usr/bin/env python3
"""Get Supabase database password"""
import json, urllib.request

PROJECT_REF = 'ekqnuqbfrwfgkhqmvvjc'

with open('/tmp/supabase_token.txt') as f:
    TOKEN=f.read...n

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'Accept': 'application/json',
}

endpoints = [
    'config/database/pooler',
    'types/database-password',
    'settings/database',
]

for ep in endpoints:
    url = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/{ep}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read().decode()
            print(f'=== {ep} ({resp.status}) ===')
            print(data[:500])
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f'=== {ep} ({e.code}) ===')
        print(err[:200])
    print()
