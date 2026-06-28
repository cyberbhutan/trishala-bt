#!/usr/bin/env python3
"""Get Supabase service_role key and apply favorites table schema"""
import json, urllib.request, sys, os

def main():
    with open('/tmp/supabase_token.txt') as f:
        token = f.read..._REF = 'ekqnuqbfrwfgkhqmvvjc'
    
    # Step 1: Get API keys
    print("Fetching API keys...")
    url = f'https://api.supabase.com/v1/projects/{PROJECT_REF}/api-keys'
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            print(f"Found {len(data)} API keys")
            
            service_key = None
            for key in data:
                name = key.get('name', '')
                if name == 'service_role':
                    service_key = key['api_key']
                    print(f"Got service_role key: {service_key[:20]}...")
                    break
            
            if service_key:
                # Save to file
                with open('/tmp/supabase_service_key.txt', 'w') as f:
                    f.write(service_key)
                print("Saved to /tmp/supabase_service_key.txt")
                
                # Step 2: Set on Vercel
                import subprocess
                result = subprocess.run(
                    ['npx', 'vercel', 'env', 'add', 'SUPABASE_SERVICE_ROLE_KEY', 'production'],
                    input=service_key.encode(),
                    capture_output=True,
                    timeout=30,
                    cwd='/home/t0b3x/trishala'
                )
                print(f"Vercel env set: {result.stdout.decode()[:200]}")
                
                # Step 3: Apply SQL directly using service_role
                print("\nApplying favorites schema...")
                sql = open('/home/t0b3x/trishala/supabase-favorites.sql').read()
                
                # Use Supabase SQL endpoint
                supabase_url = 'https://ekqnuqbfrwfgkhqmvvjc.supabase.co'
                sql_headers = {
                    'apikey': service_key,
                    'Authorization': f'Bearer {service_key}',
                    'Content-Type': 'application/json',
                }
                
                # Try exec_sql RPC first
                rpc_url = f'{supabase_url}/rest/v1/rpc/exec_sql'
                body = json.dumps({'query': sql}).encode()
                
                try:
                    req2 = urllib.request.Request(rpc_url, data=body, headers=sql_headers, method='POST')
                    with urllib.request.urlopen(req2, timeout=30) as resp2:
                        print(f"SQL applied via RPC! Status: {resp2.status}")
                except urllib.error.HTTPError as e:
                    err_body = e.read().decode()
                    if 'does not exist' in err_body:
                        print("Creating exec_sql function first...")
                        create_fn = json.dumps({'query': '''
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
'''}).encode()
                        fn_req = urllib.request.Request(rpc_url, data=create_fn, headers=sql_headers, method='POST')
                        try:
                            with urllib.request.urlopen(fn_req, timeout=30) as resp3:
                                print(f"Function created: {resp3.status}")
                            # Retry the original SQL
                            retry_req = urllib.request.Request(rpc_url, data=body, headers=sql_headers, method='POST')
                            with urllib.request.urlopen(retry_req, timeout=30) as resp4:
                                print(f"SQL applied! Status: {resp4.status}")
                        except Exception as e3:
                            print(f"Could not create function: {e3}")
                            print("\nPlease add this SQL manually in Supabase Dashboard:")
                            print(open('/home/t0b3x/trishala/supabase-favorites.sql').read())
                    else:
                        print(f"RPC Error: {e.code} {err_body[:300]}")
                        print("\nManual SQL to run:")
                        print(open('/home/t0b3x/trishala/supabase-favorites.sql').read())
            else:
                print("No service_role key found!")
                for k in data:
                    print(f"  Available: {k.get('name')}")
                    
    except urllib.error.HTTPError as e:
        print(f"API Error: {e.code} {e.reason}")
        print(e.read().decode()[:300])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
