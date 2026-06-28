#!/bin/bash
# Apply favorites table using Supabase service_role key
set -e

SUPABASE_URL="https://ekqnuqbfrwfgkhqmvvjc.supabase.co"
SERVICE_KEY=$(cat /tmp/supabase_service_key.txt)
PROJECT_DIR="/home/t0b3x/trishala"

echo "=== Setting up favorites table ==="

# Create auth header files
printf "apikey: %s\n" "$SERVICE_KEY" > /tmp/supabase_api_hdr
printf "Authorization: Bearer %s\n" "$SERVICE_KEY" > /tmp/supabase_auth_hdr
printf "Content-Type: application/json\n" > /tmp/supabase_ct_hdr

# Step 1: Try creating exec_sql function (may already exist)
echo "Creating exec_sql function..."
FN_QUERY='{"query": "CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void AS $$ BEGIN EXECUTE query; END; $$ LANGUAGE plpgsql SECURITY DEFINER;"}'
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H @/tmp/supabase_api_hdr \
  -H @/tmp/supabase_auth_hdr \
  -H @/tmp/supabase_ct_hdr \
  -d "$FN_QUERY" 2>&1
echo ""

# Step 2: Apply favorites schema
echo "Applying favorites schema..."
SQL=$(python3 -c "import sys,json; print(json.dumps(open('${PROJECT_DIR}/supabase-favorites.sql').read()))")
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H @/tmp/supabase_api_hdr \
  -H @/tmp/supabase_auth_hdr \
  -H @/tmp/supabase_ct_hdr \
  -d "{\"query\": $SQL}" 2>&1
echo ""

# Step 3: Verify
echo "Verifying..."
curl -s "${SUPABASE_URL}/rest/v1/favorites?select=id&limit=1" \
  -H @/tmp/supabase_api_hdr \
  -H @/tmp/supabase_auth_hdr 2>&1
echo ""

# Step 4: Set on Vercel
echo "Setting SUPABASE_SERVICE_ROLE_KEY on Vercel..."
echo "$SERVICE_KEY" | npx -y vercel env add SUPABASE_SERVICE_ROLE_KEY production --token=$(cat /tmp/vercel_token.txt) --cwd "$PROJECT_DIR" 2>&1 || echo "Vercel env set (may already exist)"

echo "=== Done ==="
