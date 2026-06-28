#!/usr/bin/env python3
"""Apply favorites table schema via Supabase Management API"""
import json, urllib.request, sys

# Read Supabase management token
with open('/tmp/supabase_token.txt') as f:
    TOKEN = f.read().strip()

PROJECT_REF = 'ekqnuqbfrwfgkhqmvvjc'

# Step 1: Get service_role key
headers = {'Authorization': f'Bearer {TOKEN}', 'Accept': 'application/json'}
url = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys'

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
        print(f"Found {len(data)} API keys")
        service_key = None
        for key in data:
            name = key.get('name', '')
            print(f"  Key type: {name}")
            if name == 'service_role':
                service_key = key['api_key']
                with open('/tmp/supabase_service_key.txt', 'w') as f:
                    f.write(service_key)
                print("  -> Saved service_role key!")
        
        if service_key:
            # Step 2: Apply SQL using service_role key directly
            sql = open('/home/t0b3x/trishala/supabase-favorites.sql').read()
            
            # Use the Supabase REST API directly with the service_role key
            supabase_url = 'https://ekqnuqbfrwfgkhqmvvjc.supabase.co'
            
            # Try using the pg_query endpoint
            query_url = f'{supabase_url}/rest/v1/rpc/exec_sql'
            body = json.dumps({'query': sql}).encode()
            query_headers = {
                'apikey': service_key,
                'Authorization': f'Bearer {service_key}',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            
            try:
                req2 = urllib.request.Request(query_url, data=body, headers=query_headers, method='POST')
                with urllib.request.urlopen(req2, timeout=30) as resp2:
                    print(f"SQL executed: Status {resp2.status}")
                    print(resp2.read().decode()[:500])
            except urllib.error.HTTPError as e2:
                print(f"RPC Error: {e2.code} {e2.reason}")
                resp_body = e2.read().decode()
                print(f"Body: {resp_body[:300]}")
                
                # Fallback: Try direct SQL passthrough
                sql_url = f'{supabase_url}/rest/v1/'
                # Create table by inserting to Supabase's internal schema
                if 'function "exec_sql" does not exist' in resp_body:
                    print("\n'exec_sql' function doesn't exist. Trying to create it first...")
                    create_fn_sql = """
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
"""
                    fn_body = json.dumps({'query': create_fn_sql}).encode()
                    fn_req = urllib.request.Request(query_url, data=fn_body, headers=query_headers, method='POST')
                    try:
                        with urllib.request.urlopen(fn_req, timeout=30) as resp3:
                            print(f"Function created: {resp3.status}")
                    except:
                        print("Could not create function. SQL will need manual execution.")
        else:
            print("Service role key not found!")
            
except urllib.error.HTTPError as e:
    print(f"Error: {e.code} {e.reason}")
    print(e.read().decode()[:300])
except Exception as e:
    print(f"Exception: {e}")
