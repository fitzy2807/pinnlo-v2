import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('🔑 OpenAI Key loaded:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : 'NOT FOUND');

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY environment variable is required');
  console.log('Make sure it\'s set in .env.local file');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Simple OpenAI call helper
async function callOpenAI(systemPrompt, userPrompt) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: errorData };
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content || 'No content generated';
    
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Technical requirements generation endpoint
app.post('/api/tools/generate_technical_requirement', authenticateRequest, async (req, res) => {
  try {
    console.log('🚀 Received technical requirement generation request');
    
    const { features = [] } = req.body;
    const featureNames = features.map(f => f.name).join(', ');
    
    console.log('🎯 Processing features:', featureNames);
    
    // Simple, focused prompt
    const systemPrompt = `You are a technical architect. Create concise technical requirements.`;
    
    const featureList = features.map(f => `- ${f.name}: ${f.description}`).join('\n');
    
    const userPrompt = `Create technical requirements for these features:
${featureList}

Include:
- System architecture overview
- Database design basics  
- API endpoints needed
- Security requirements
- Implementation notes

Keep response under 1000 tokens.`;

    console.log('🤖 Calling OpenAI API...');
    
    const openaiResult = await callOpenAI(systemPrompt, userPrompt);
    
    if (!openaiResult.success) {
      console.error('❌ OpenAI call failed:', openaiResult.error);
      
      // Fallback response
      const fallbackContent = `# Technical Requirements for ${featureNames}

## System Architecture
- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: JWT tokens

## Database Design
${features.map(f => `- ${f.name}: Dedicated table with proper indexing`).join('\n')}

## API Endpoints
${features.map(f => `- ${f.name}: CRUD operations with validation`).join('\n')}

## Security
- Input validation and sanitization
- Authentication on all endpoints  
- HTTPS only
- Rate limiting

## Implementation Notes
- Follow REST conventions
- Include proper error handling
- Add logging and monitoring
- Write comprehensive tests

*Note: Generated with fallback template*`;

      return res.json({
        success: true,
        requirement: {
          name: `Technical Requirements for ${featureNames}`,
          description: fallbackContent
        },
        model_used: 'fallback',
        metadata: {
          features: features.map(f => f.name),
          featureCount: features.length,
          generatedWith: 'fallback',
          timestamp: new Date().toISOString()
        }
      });
    }

    console.log('✅ Generated technical requirements');
    
    const response = {
      name: `Technical Requirements for ${featureNames}`,
      description: openaiResult.content
    };
    
    res.json({
      success: true,
      requirement: response,
      model_used: 'gpt-3.5-turbo',
      metadata: {
        features: features.map(f => f.name),
        featureCount: features.length,
        generatedWith: 'openai-gpt-3.5',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error in technical requirement generation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
