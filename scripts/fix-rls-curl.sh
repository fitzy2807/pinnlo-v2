#!/bin/bash

# Database connection details
SUPABASE_URL="https://cdbzwjyqagqvdtmucidg.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYnp3anlxYWdxdmR0bXVjaWRnIiwicm9sZSI6InNlcnZpY2Vfc2VydmljZV9yb2xlIiwiaWF0IjoxNzM2MTkyMjA5LCJleHAiOjIwNTE3NjgyMDl9.cFtR3qvFGIqVhKdWJyU7zZsrsVf4XwSuGPmMrTYAcec"

echo "🚀 Starting comprehensive RLS fix for Pinnlo V2..."
echo ""

# Step 1: Update strategy ownership
echo "Step 1: Updating strategy ownership..."
UPDATE_RESPONSE=$(curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/strategies?id=in.(2,4)" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "userId": "900903ff-4a27-4b57-b82b-73a0bb57d776",
    "updatedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")'"
  }')

if [ $? -eq 0 ]; then
  echo "✅ Success"
  echo "Updated strategies: $UPDATE_RESPONSE"
else
  echo "❌ Error updating strategies"
fi

echo ""
echo "Step 2-3: RLS Policy Management"
echo "================================================"
echo "IMPORTANT: The RLS policies must be updated through the Supabase Dashboard."
echo ""
echo "Please follow these steps:"
echo "1. Go to: ${SUPABASE_URL}/project/cdbzwjyqagqvdtmucidg/editor"
echo "2. Open the SQL Editor"
echo "3. Copy and paste the following SQL commands:"
echo ""
echo "-- Drop existing broken RLS policies"
echo "DROP POLICY IF EXISTS \"Users can view cards from their strategies\" ON cards;"
echo "DROP POLICY IF EXISTS \"Users can insert cards to their strategies\" ON cards;"
echo "DROP POLICY IF EXISTS \"Users can update cards in their strategies\" ON cards;"
echo "DROP POLICY IF EXISTS \"Users can delete cards from their strategies\" ON cards;"
echo ""
echo "-- Create corrected RLS policies with proper type casting"
echo "CREATE POLICY \"Users can view cards from their strategies\" ON cards"
echo "  FOR SELECT USING ("
echo "    strategy_id IN ("
echo "      SELECT id FROM strategies "
echo "      WHERE \"userId\" = auth.uid()::text"
echo "    )"
echo "  );"
echo ""
echo "CREATE POLICY \"Users can insert cards to their strategies\" ON cards"
echo "  FOR INSERT WITH CHECK ("
echo "    strategy_id IN ("
echo "      SELECT id FROM strategies "
echo "      WHERE \"userId\" = auth.uid()::text"
echo "    )"
echo "  );"
echo ""
echo "CREATE POLICY \"Users can update cards in their strategies\" ON cards"
echo "  FOR UPDATE USING ("
echo "    strategy_id IN ("
echo "      SELECT id FROM strategies "
echo "      WHERE \"userId\" = auth.uid()::text"
echo "    )"
echo "  );"
echo ""
echo "CREATE POLICY \"Users can delete cards from their strategies\" ON cards"
echo "  FOR DELETE USING ("
echo "    strategy_id IN ("
echo "      SELECT id FROM strategies "
echo "      WHERE \"userId\" = auth.uid()::text"
echo "    )"
echo "  );"
echo ""
echo "================================================"
echo ""

# Step 4: Test card creation
echo "Step 4: Testing card creation..."
CARD_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/cards" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "strategy_id": 2,
    "title": "CC RLS Fix Test Card",
    "description": "Created by Claude Code to validate RLS fix",
    "card_type": "strategic-context",
    "priority": "High",
    "confidence_level": "High",
    "strategic_alignment": "Testing RLS implementation",
    "tags": ["CC", "RLS-Fix", "Test"],
    "card_data": {"marketContext": "Automated RLS testing"}
  }')

if [ $? -eq 0 ]; then
  echo "✅ Success"
  echo "Created card: $CARD_RESPONSE"
else
  echo "❌ Error creating test card"
fi

echo ""
echo "🔍 Verifying the fix..."
# Verify strategies
VERIFY_RESPONSE=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/strategies?id=in.(2,4)&select=id,userId" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}")

echo "Strategies verified: $VERIFY_RESPONSE"

# Count cards
CARD_COUNT=$(curl -s -X HEAD \
  "${SUPABASE_URL}/rest/v1/cards?strategy_id=in.(2,4)" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Prefer: count=exact" \
  -I | grep -i "content-range" | sed 's/.*\///')

echo "Total cards in strategies 2 and 4: $CARD_COUNT"

echo ""
echo "📊 Summary:"
echo "==========="
echo "1. Strategy ownership update attempted"
echo "2. RLS policies SQL provided (execute in Supabase Dashboard)"
echo "3. Test card creation attempted"
echo "4. Verification completed"
echo ""
echo "Next steps:"
echo "1. Execute the RLS policy SQL in Supabase Dashboard"
echo "2. Test card creation in your application"