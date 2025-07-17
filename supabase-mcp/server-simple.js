import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GitHubAnalysisOrchestrator } from './dist/tools/github-analysis-agents.js';

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

// Generic edit mode content generation endpoint
app.post('/api/tools/generate_edit_mode_content', authenticateRequest, async (req, res) => {
  try {
    console.log('🚀 Received edit mode content generation request');
    
    const { blueprintType, cardTitle, strategyId, userId, existingFields } = req.body;
    
    console.log('🎯 Processing request:', { blueprintType, cardTitle, strategyId, userId });
    
    // Enhanced blueprint-specific prompts and field mappings
    const blueprintConfig = {
      strategicContext: {
        prompt: 'You are a strategic context expert. Create comprehensive strategic context analysis.',
        fields: ['description', 'strategicAlignment', 'keyObjectives', 'successMetrics', 'stakeholders', 'tags']
      },
      customerExperience: {
        prompt: 'You are a customer experience expert. Create detailed customer journey analysis.',
        fields: ['description', 'customerSegment', 'touchpoints', 'painPoints', 'opportunities', 'tags']
      },
      experienceSections: {
        prompt: 'You are an experience design expert. Create detailed experience section analysis.',
        fields: ['description', 'userActions', 'systemResponses', 'improvements', 'metrics', 'tags']
      },
      vision: {
        prompt: 'You are a strategic vision expert. Create an inspiring, actionable vision statement.',
        fields: ['description', 'visionStatement', 'strategicAlignment', 'keyPillars', 'tags']
      },
      swot: {
        prompt: 'You are a strategic analyst. Create a balanced SWOT analysis.',
        fields: ['description', 'strengths', 'weaknesses', 'opportunities', 'threats', 'tags']
      },
      epic: {
        prompt: 'You are an agile expert. Create user-centered epic descriptions with clear acceptance criteria.',
        fields: ['description', 'userStory', 'acceptanceCriteria', 'businessValue', 'tags']
      },
      'technical-requirement': {
        prompt: 'You are a technical architect. Create detailed technical requirements.',
        fields: ['description', 'technicalSpecs', 'dependencies', 'riskAssessment', 'tags']
      },
      'business-model': {
        prompt: 'You are a business strategist. Create viable business model components.',
        fields: ['description', 'valueProposition', 'revenueStreams', 'keyResources', 'tags']
      },
      okr: {
        prompt: 'You are an OKR expert. Create measurable objectives and key results.',
        fields: ['description', 'objective', 'keyResults', 'successMetrics', 'tags']
      }
    };
    
    const config = blueprintConfig[blueprintType] || {
      prompt: 'You are a strategic planning expert.',
      fields: ['description', 'strategicAlignment', 'tags']
    };
    
    const systemPrompt = config.prompt;
    
    const fieldList = config.fields.map(field => `- ${field}: Appropriate content for this field`).join('\n');
    
    const userPrompt = `Create comprehensive content for a ${blueprintType} card titled "${cardTitle}".

Generate a JSON response with these specific fields:
${fieldList}

Requirements:
- Make content specific to the card title "${cardTitle}"
- Ensure professional, actionable content
- Fill all required fields appropriately
- Use the exact field names specified above

Return ONLY a JSON object with the field names as keys and appropriate content as values.`;
    
    console.log('🤖 Calling OpenAI API...');
    
    const openaiResult = await callOpenAI(systemPrompt, userPrompt);
    
    if (!openaiResult.success) {
      console.error('❌ OpenAI call failed:', openaiResult.error);
      
      // Fallback response using proper field names
      const fallbackFields = {};
      config.fields.forEach(field => {
        if (field === 'description') {
          fallbackFields[field] = `Generated content for ${cardTitle} ${blueprintType} card. Please review and customize as needed.`;
        } else if (field === 'strategicAlignment') {
          fallbackFields[field] = `This ${blueprintType} aligns with strategic objectives and supports ${cardTitle}.`;
        } else if (field === 'tags') {
          fallbackFields[field] = [blueprintType, 'strategic', 'planning'];
        } else {
          fallbackFields[field] = `Please customize this ${field} content for your specific needs.`;
        }
      });
      
      return res.json({
        success: true,
        fields: fallbackFields,
        model_used: 'fallback',
        metadata: {
          blueprintType,
          cardTitle,
          generatedWith: 'fallback',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    console.log('✅ Generated edit mode content');
    
    // Try to parse as JSON, fallback to proper field structure
    let fields;
    try {
      fields = JSON.parse(openaiResult.content);
    } catch {
      // If JSON parsing fails, create fields using proper field names
      fields = {};
      config.fields.forEach((field, index) => {
        if (field === 'description') {
          fields[field] = openaiResult.content;
        } else if (field === 'tags') {
          fields[field] = [blueprintType, 'AI-generated'];
        } else {
          fields[field] = `AI-generated ${field} content for ${cardTitle}`;
        }
      });
    }
    
    res.json({
      success: true,
      fields,
      model_used: 'gpt-3.5-turbo',
      metadata: {
        blueprintType,
        cardTitle,
        generatedWith: 'openai-gpt-3.5',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error in edit mode content generation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Parse repository URL helper function
function parseRepositoryUrl(url) {
  try {
    let cleanUrl = url.replace(/^https?:\/\/github\.com\//, '');
    cleanUrl = cleanUrl.replace(/\.git$/, '');
    
    const parts = cleanUrl.split('/');
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1]
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Simple GitHub Analysis endpoint (fallback)
app.post('/api/tools/analyze_github_repository', async (req, res) => {
  try {
    const { repository_url, github_token, user_id } = req.body;
    
    console.log('🔍 GitHub Analysis Request (Simple):', { repository_url, user_id });
    
    // Parse repository URL
    const repoInfo = parseRepositoryUrl(repository_url);
    if (!repoInfo) {
      console.error('❌ Invalid repository URL format:', repository_url);
      return res.status(400).json({ error: 'Invalid repository URL format' });
    }
    
    // Initialize GitHub API client
    const github = {
      headers: {
        'Authorization': `Bearer ${github_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PINNLO-MCP-Agent'
      }
    };

    // Get repository information
    const repoResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, {
      headers: github.headers
    });

    if (!repoResponse.ok) {
      console.error('❌ Failed to fetch repository:', repoResponse.status);
      return res.status(500).json({ error: `Failed to fetch repository: ${repoResponse.status}` });
    }

    const repository = await repoResponse.json();
    
    // Analyze package.json for dependencies
    const packageResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/package.json`, {
      headers: github.headers
    });

    let dependencies = {};
    let frameworks = [];

    if (packageResponse.ok) {
      const packageData = await packageResponse.json();
      const packageContent = JSON.parse(Buffer.from(packageData.content, 'base64').toString());
      
      dependencies = {
        ...(packageContent.dependencies || {}),
        ...(packageContent.devDependencies || {})
      };

      // Detect frameworks from dependencies
      if (dependencies['next']) frameworks.push('Next.js');
      if (dependencies['react']) frameworks.push('React');
      if (dependencies['vue']) frameworks.push('Vue.js');
      if (dependencies['angular']) frameworks.push('Angular');
      if (dependencies['express']) frameworks.push('Express');
      if (dependencies['@supabase/supabase-js']) frameworks.push('Supabase');
      if (dependencies['tailwindcss']) frameworks.push('Tailwind CSS');
      if (dependencies['typescript']) frameworks.push('TypeScript');
    }

    // Return analysis results
    const result = {
      content: [{
        type: "text",
        text: JSON.stringify({
          dependencies,
          frameworks,
          repository_info: {
            name: repository.name,
            full_name: repository.full_name,
            description: repository.description,
            language: repository.language,
            size: repository.size,
            updated_at: repository.updated_at,
            default_branch: repository.default_branch
          },
          files_analyzed: 1,
          package_files: packageResponse.ok ? ['package.json'] : [],
          analysis_method: 'simple'
        })
      }]
    };

    console.log('✅ Simple analysis complete');
    res.json(result);

  } catch (error) {
    console.error('❌ GitHub analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze GitHub repository' });
  }
});

// Comprehensive GitHub Analysis (Three-Agent System)
app.post('/api/tools/analyze_github_repository_comprehensive', async (req, res) => {
  try {
    const { repository_url, github_token, analysis_depth = 'standard', focus_areas = [], user_id } = req.body;
    
    console.log('🎯 Comprehensive GitHub Analysis Request:', {
      repository_url,
      user_id,
      analysis_depth,
      focus_areas
    });
    
    // Create orchestrator and run three-agent analysis
    const orchestrator = new GitHubAnalysisOrchestrator(
      github_token,
      repository_url,
      user_id,
      analysis_depth,
      focus_areas
    );

    const result = await orchestrator.orchestrate();

    const response = {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };

    console.log('✅ Comprehensive analysis complete');
    res.json(response);

  } catch (error) {
    console.error('❌ Comprehensive GitHub analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze GitHub repository comprehensively' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
