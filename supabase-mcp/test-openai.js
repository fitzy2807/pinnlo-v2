import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, '../.env.local') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔑 Testing OpenAI API Key:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.slice(-4)}` : 'NOT FOUND');

if (!OPENAI_API_KEY) {
  console.error('❌ No OpenAI API key found');
  process.exit(1);
}

// Simple test call
async function testOpenAI() {
  try {
    console.log('🧪 Testing OpenAI API with simple prompt...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Use cheaper model for testing
        messages: [
          { role: 'user', content: 'Say "Hello World" if you can read this.' }
        ],
        max_tokens: 50,
        temperature: 0
      })
    });

    console.log('📞 Response status:', response.status);
    console.log('📞 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Success! OpenAI responded:', result.choices[0]?.message?.content);
    console.log('💰 Usage:', result.usage);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOpenAI();
