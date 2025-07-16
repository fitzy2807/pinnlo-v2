const testCases = [
  {
    blueprintType: 'vision',
    cardTitle: 'Test Vision 2025',
    existingFields: { timeHorizon: '5 years' }
  },
  {
    blueprintType: 'epic',
    cardTitle: 'Mobile App Redesign',
    existingFields: {}
  },
  {
    blueprintType: 'technical-requirement',
    cardTitle: 'API Architecture',
    existingFields: { techStack: 'Node.js, PostgreSQL' }
  }
];

async function testGeneration() {
  console.log('Testing Edit Mode AI Generator...\n');
  
  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.blueprintType}...`);
    
    try {
      const response = await fetch('http://localhost:3002/api/ai/edit-mode/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Note: In real usage, authentication would be handled by the app
        },
        body: JSON.stringify({
          cardId: 'test-' + Date.now(),
          ...testCase,
          userId: 'test-user'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log(`  ${data.type}: ${data.message || data.error || 'Complete'}`);
              
              if (data.type === 'complete') {
                console.log(`  ✅ Generated ${Object.keys(data.fields || {}).length} fields`);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testGeneration().catch(console.error);
}

export { testGeneration };