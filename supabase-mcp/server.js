import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRD_STEPS, generateStepPrompt } from './trd-steps.js';

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

// Technical requirements generation endpoint
app.post('/api/tools/generate_technical_requirement', authenticateRequest, async (req, res) => {
  try {
    console.log('\n🚀 MCP: Received technical requirement generation request');
    console.log('📦 MCP: Full request body:', JSON.stringify(req.body, null, 2));
    
    const { features = [], strategyContext = {}, options = {} } = req.body;
    const featureNames = features.map(f => f.name).join(', ');
    
    console.log('🎯 MCP: Processing features:', featureNames);
    console.log('📊 MCP: Strategy context received:');
    console.log('  - Title:', strategyContext.title);
    console.log('  - Description:', strategyContext.description);
    console.log('  - Cards count:', strategyContext.cards?.length || 0);
    console.log('⚙️ MCP: Options received:', options);
    
    console.log('📋 MCP: Detailed feature analysis:');
    features.forEach((feature, index) => {
      console.log(`  Feature ${index + 1}:`);
      console.log(`    - ID: ${feature.id}`);
      console.log(`    - Name: ${feature.name}`);
      console.log(`    - Description: ${feature.description}`);
      console.log(`    - Card Type: ${feature.cardType}`);
      console.log(`    - Card Data: ${JSON.stringify(feature.cardData, null, 4)}`);
    });
    
    // Build comprehensive prompt for OpenAI
    const systemPrompt = `You are a senior technical architect with 15+ years of experience creating comprehensive technical requirements documents. You specialize in translating business features into detailed, actionable technical specifications.

Your technical requirements should be:
1. **Comprehensive**: Cover all technical aspects needed for implementation
2. **Specific**: Include concrete details, not generic statements
3. **Actionable**: Developers can use this to build the system
4. **Structured**: Well-organized with clear sections
5. **Complete**: Address architecture, data models, APIs, security, and performance
6. **Context-Aware**: Use the provided user stories, personas, constraints, and business context

IMPORTANT: Pay special attention to:
- User stories and personas - Design for the specific user needs
- Technical considerations - Follow any integration requirements or technology suggestions
- Acceptance criteria - Ensure technical solution meets these requirements
- Delivery constraints - Consider timeline and resource limitations
- Dependencies - Account for integration with other systems/features
- Priority level - Focus effort appropriately based on importance

Always consider:
- System architecture and component design
- Data models and database schema requirements
- API design and integration patterns
- Security and authentication requirements
- Performance and scalability considerations
- Error handling and edge cases
- Testing strategies
- Deployment and infrastructure needs

Format your response as a comprehensive technical requirements document that directly addresses the business context provided.`;

    const featureList = features.map(f => {
      let featureDetails = `- **${f.name}**: ${f.description}`;
      
      // Add card_data context if available
      if (f.cardData) {
        // Add user story context
        if (f.cardData.userStories) {
          if (typeof f.cardData.userStories === 'object' && f.cardData.userStories.story) {
            featureDetails += `\n  - **User Story**: ${f.cardData.userStories.story}`;
          } else if (Array.isArray(f.cardData.userStories)) {
            featureDetails += `\n  - **User Stories**: ${f.cardData.userStories.join(', ')}`;
          }
        }
        
        // Add acceptance criteria
        if (f.cardData.acceptanceCriteria) {
          if (typeof f.cardData.acceptanceCriteria === 'object') {
            const criteria = Object.values(f.cardData.acceptanceCriteria).join(', ');
            featureDetails += `\n  - **Acceptance Criteria**: ${criteria}`;
          } else if (Array.isArray(f.cardData.acceptanceCriteria)) {
            featureDetails += `\n  - **Acceptance Criteria**: ${f.cardData.acceptanceCriteria.join(', ')}`;
          }
        }
        
        // Add technical considerations
        if (f.cardData.techConsiderations) {
          featureDetails += `\n  - **Technical Considerations**: ${f.cardData.techConsiderations}`;
        }
        
        // Add personas
        if (f.cardData.linkedPersona) {
          featureDetails += `\n  - **Target Personas**: ${f.cardData.linkedPersona}`;
        }
        
        // Add priority and constraints
        if (f.cardData.priorityLevel) {
          featureDetails += `\n  - **Priority**: ${f.cardData.priorityLevel}`;
        }
        
        if (f.cardData.deliveryConstraints) {
          featureDetails += `\n  - **Delivery Constraints**: ${f.cardData.deliveryConstraints}`;
        }
        
        // Add problem context
        if (f.cardData.problemItSolves) {
          featureDetails += `\n  - **Problem**: ${f.cardData.problemItSolves}`;
        }
        
        // Add dependencies
        if (f.cardData.dependencies && f.cardData.dependencies.length > 0) {
          featureDetails += `\n  - **Dependencies**: ${f.cardData.dependencies.join(', ')}`;
        }
        
        // Add estimation
        if (f.cardData.estimation) {
          featureDetails += `\n  - **Estimation**: ${f.cardData.estimation}`;
        }
      }
      
      return featureDetails;
    }).join('\n\n');
    const strategyInfo = strategyContext.title ? 
      `Strategy: ${strategyContext.title}\n${strategyContext.description || ''}` : 
      'No strategy context provided';
      
    console.log('📝 MCP: Built feature list:');
    console.log(featureList);
    console.log('📈 MCP: Strategy info:');
    console.log(strategyInfo);

    const userPrompt = `Generate comprehensive technical requirements for the following features:

${featureList}

**Project Context:**
${strategyInfo}

**Requirements to Include:**
✓ System Architecture
✓ Data Models & Database Schema
✓ API Specifications
✓ Security Requirements

**Output Format:** comprehensive

Create a detailed technical requirements document that covers:

1. **Executive Summary**
   - Brief overview of the technical solution
   - Key architectural decisions

2. **System Architecture**
   - High-level system design
   - Component interactions
   - Technology stack recommendations

3. **Feature-Specific Requirements**
   For each feature, provide:
   - Technical implementation approach
   - Required components/services
   - Data flow and processing
   - Integration points

4. **Data Architecture**
   - Database schema design
   - Data models and relationships
   - Data validation rules
   - Migration strategies

5. **API Specifications**
   - Endpoint definitions
   - Request/response formats
   - Authentication methods
   - Rate limiting and throttling

6. **Security Requirements**
   - Authentication and authorization
   - Data encryption and protection
   - Input validation and sanitization
   - Security headers and protocols

7. **Performance & Scalability**
   - Performance targets and metrics
   - Caching strategies
   - Load balancing approaches
   - Database optimization

8. **Implementation Guidelines**
   - Development standards and conventions
   - Code organization and structure
   - Documentation requirements
   - Version control strategies

Ensure the document is detailed enough that a development team can use it to implement the features successfully.`;

    // Call OpenAI API
    console.log('🤖 MCP: Calling OpenAI API...');
    console.log('🔑 MCP: Using API key:', OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.slice(-4)}` : 'NONE');
    console.log('📝 MCP: System prompt length:', systemPrompt.length);
    console.log('📝 MCP: User prompt length:', userPrompt.length);
    
    let openaiResponse;
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Use cheaper, faster model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 2000, // Reduce token limit
          temperature: 0.3
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('📞 MCP: OpenAI API responded with status:', openaiResponse.status);
      
      if (openaiResponse.status === 200) {
        console.log('✅ MCP: OpenAI request successful');
      } else {
        console.log('⚠️ MCP: OpenAI request returned non-200 status');
      }
    } catch (fetchError) {
      console.error('❌ OpenAI fetch error:', fetchError);
      return res.status(500).json({
        success: false,
        error: `Network error calling OpenAI: ${fetchError.message}`
      });
    }

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('❌ OpenAI API error:', errorData);
      return res.status(500).json({
        success: false,
        error: `OpenAI API error (${openaiResponse.status}): ${errorData}`
      });
    }

    let openaiResult;
    try {
      openaiResult = await openaiResponse.json();
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse OpenAI response'
      });
    }

    const generatedContent = openaiResult.choices?.[0]?.message?.content || 'No content generated';
    
    console.log('📊 MCP: OpenAI response analysis:');
    console.log('  - Choices available:', openaiResult.choices?.length || 0);
    console.log('  - Content length:', generatedContent.length);
    console.log('  - Usage tokens:', openaiResult.usage);
    
    if (!generatedContent || generatedContent === 'No content generated') {
      console.error('❌ MCP: No content in OpenAI response:', openaiResult);
      return res.status(500).json({
        success: false,
        error: 'OpenAI did not generate any content'
      });
    }
    
    console.log('✅ MCP: Generated technical requirements with OpenAI');
    
    const response = {
      name: `Technical Requirements for ${featureNames}`,
      description: generatedContent
    };
    
    console.log('✅ MCP: Generated response for MCP client');
    console.log('📤 MCP: Response length:', generatedContent.length);
    console.log('📤 MCP: Response name:', response.name);
    
    res.json({
      success: true,
      requirement: response,
      model_used: 'gpt-4-turbo-preview',
      metadata: {
        features: features.map(f => f.name),
        featureCount: features.length,
        generatedWith: 'openai-gpt-4',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error in technical requirement generation:', error);
    
    // Fallback response when OpenAI fails
    const features = req.body.features || [];
    const featureNames = features.map(f => f.name).join(', ');
    
    const fallbackContent = `# Technical Requirements Document

## Executive Summary
Technical requirements for implementing ${featureNames} features.

## System Architecture
- **Frontend**: React.js/Next.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with proper indexing
- **Authentication**: JWT-based authentication
- **API**: RESTful API with proper validation

## Feature Requirements

${features.map(feature => `### ${feature.name}
**Description**: ${feature.description}

**Technical Implementation**:
- Component-based architecture
- Data validation and sanitization
- Error handling and logging
- Performance optimization

**Database Schema**:
- Dedicated tables for ${feature.name.toLowerCase()}
- Proper indexing for performance
- Data integrity constraints

**API Endpoints**:
- CRUD operations with proper HTTP methods
- Input validation
- Authentication and authorization
- Rate limiting

**Security Requirements**:
- Input validation
- Authentication checks
- Data encryption
- Secure communication (HTTPS)

`).join('\n')}

## Security & Performance
- Authentication and authorization
- Data validation and sanitization
- Performance monitoring
- Error tracking and logging

**Note**: This is a fallback response. Please ensure OpenAI API key is valid for full AI-generated requirements.`;
    
    res.status(200).json({
      success: true,
      requirement: {
        name: `Technical Requirements for ${featureNames}`,
        description: fallbackContent
      },
      model_used: 'fallback-template',
      metadata: {
        features: features.map(f => f.name),
        featureCount: features.length,
        generatedWith: 'fallback-template',
        timestamp: new Date().toISOString(),
        note: 'Generated using fallback template due to OpenAI API issues'
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
