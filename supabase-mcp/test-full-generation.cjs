const fetch = require('node-fetch');

async function testFullGeneration() {
  console.log('Testing full AI generation workflow...');
  
  const testData = {
    cardId: 'test-card-123',
    blueprintType: 'features',
    cardTitle: 'User Authentication System',
    userId: '900903ff-4a27-4b57-b82b-73a0bb57d776',
    existingFields: {
      title: 'User Authentication System',
      description: 'Basic login functionality'
    }
  };
  
  console.log('Making request to MCP server...');
  console.log('Test data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3001/api/tools/generate_edit_mode_content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('=== SUCCESS ===');
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testFullGeneration().catch(console.error);