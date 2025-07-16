// Test script to create a TRD card for debugging
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

async function createTestTRD() {
  console.log('🔧 Creating test TRD card...\n');
  
  try {
    // Create a TRD card with multi-item data
    const { data: newCard, error } = await supabase
      .from('cards')
      .insert([
        {
          title: 'Test TRD Card for Multi-Item Interface',
          description: 'This is a test TRD card to verify the multi-item interface is working correctly',
          card_type: 'trd',
          strategy_id: 1, // You may need to change this to a valid strategy ID
          priority: 'High',
          confidence_level: 'High',
          card_data: {
            system_overview: 'Test system overview for TRD multi-item interface',
            version: '1.0.0',
            status: 'draft'
          },
          multi_item_data: {
            api_endpoints: [
              {
                id: 'api-001',
                endpoint_id: 'EP-001',
                endpoint_path: '/api/v1/test',
                http_method: 'GET',
                description: 'Test API endpoint for debugging',
                request_format: {},
                response_format: {},
                authentication_required: true,
                status: 'draft',
                priority: 'medium',
                order_index: 0
              }
            ],
            security_controls: [
              {
                id: 'sec-001',
                control_id: 'SEC-001',
                control_title: 'Authentication Required',
                control_description: 'All API endpoints must require authentication',
                control_type: 'preventive',
                security_domain: 'application',
                implementation_method: 'JWT token validation',
                validation_criteria: 'Valid JWT token present in Authorization header',
                risk_level: 'medium',
                implementation_status: 'planned',
                order_index: 0
              }
            ],
            performance_requirements: [],
            test_cases: [],
            implementation_standards: [],
            infrastructure_components: [],
            data_models: []
          }
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating TRD card:', error);
      return;
    }

    console.log('✅ Test TRD card created successfully!');
    console.log('Card ID:', newCard.id);
    console.log('Title:', newCard.title);
    console.log('Card Type:', newCard.card_type);
    console.log('Multi-item Data:', JSON.stringify(newCard.multi_item_data, null, 2));
    
    console.log('\n📋 Instructions:');
    console.log('1. Open the Development Bank in your browser');
    console.log('2. Navigate to the Technical Requirements section');
    console.log('3. Find the card titled "Test TRD Card for Multi-Item Interface"');
    console.log('4. Click on it to open the modal');
    console.log('5. The TRD multi-item interface should now be visible');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the test
createTestTRD();