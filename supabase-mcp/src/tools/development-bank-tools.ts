// Tool type will be inferred from the object structure

export const developmentBankTools = [
  {
    name: 'generate_technical_requirement',
    description: 'Generate comprehensive technical requirements using Claude 4 based on selected features',
    inputSchema: {
      type: 'object',
      properties: {
        strategyContext: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            cards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  card_type: { type: 'string' }
                }
              }
            }
          }
        },
        features: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        },
        options: {
          type: 'object',
          properties: {
            model: { type: 'string', enum: ['claude-4', 'gpt-4'] },
            includeArchitecture: { type: 'boolean' },
            includeDataModels: { type: 'boolean' },
            includeAPIs: { type: 'boolean' },
            includeSecurityRequirements: { type: 'boolean' },
            format: { type: 'string', enum: ['comprehensive', 'concise'] }
          }
        }
      },
      required: ['features']
    }
  },
  {
    name: 'commit_trd_to_task_list',
    description: 'Commit a Technical Requirements Document to a structured task list with categories and tasks',
    inputSchema: {
      type: 'object',
      properties: {
        trdId: { type: 'string' },
        trdTitle: { type: 'string' },
        trdContent: {
          type: 'object',
          properties: {
            featureRequirements: { type: 'object' },
            technicalArchitecture: { type: 'object' },
            securityRequirements: { type: 'object' },
            performanceRequirements: { type: 'object' }
          }
        },
        strategyId: { type: 'string' },
        userId: { type: 'string' }
      },
      required: ['trdId', 'trdTitle', 'strategyId', 'userId']
    }
  }
];

export async function handleGenerateTechnicalRequirement(args: any) {
  try {
    console.log('🚀 Generating technical requirement with Claude 4');
    
    const { strategyContext, features, options = {} } = args;
    
    // Build comprehensive context
    const featureList = features.map((f: any) => `- **${f.name}**: ${f.description}`).join('\n');
    
    const strategyInfo = strategyContext ? 
      `Strategy: ${strategyContext.title}\n${strategyContext.description}\n\nRelated Cards:\n${strategyContext.cards?.map((c: any) => `- ${c.title}: ${c.description}`).join('\n') || 'None'}` : 
      'No strategy context provided';
    
    // Create comprehensive prompt for Claude 4
    const systemPrompt = `You are a senior technical architect with 15+ years of experience creating comprehensive technical requirements documents. You specialize in translating business features into detailed, actionable technical specifications.

Your technical requirements should be:
1. **Comprehensive**: Cover all technical aspects needed for implementation
2. **Specific**: Include concrete details, not generic statements
3. **Actionable**: Developers can use this to build the system
4. **Structured**: Well-organized with clear sections
5. **Complete**: Address architecture, data models, APIs, security, and performance

Always consider:
- System architecture and component design
- Data models and database schema requirements
- API design and integration patterns
- Security and authentication requirements
- Performance and scalability considerations
- Error handling and edge cases
- Testing strategies
- Deployment and infrastructure needs

Format your response as a comprehensive technical requirements document.`;

    const userPrompt = `Generate comprehensive technical requirements for the following features:

${featureList}

**Project Context:**
${strategyInfo}

**Requirements to Include:**
${options.includeArchitecture !== false ? '✓ System Architecture' : ''}
${options.includeDataModels !== false ? '✓ Data Models & Database Schema' : ''}
${options.includeAPIs !== false ? '✓ API Specifications' : ''}
${options.includeSecurityRequirements !== false ? '✓ Security Requirements' : ''}

**Output Format:** ${options.format || 'comprehensive'}

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

8. **Infrastructure Requirements**
   - Hosting and deployment needs
   - Environment configurations
   - Monitoring and logging
   - Backup and disaster recovery

9. **Testing Strategy**
   - Unit testing requirements
   - Integration testing approach
   - Performance testing criteria
   - Security testing protocols

10. **Implementation Guidelines**
    - Development standards and conventions
    - Code organization and structure
    - Documentation requirements
    - Version control strategies

Ensure the document is detailed enough that a development team can use it to implement the features successfully.`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            prompts: {
              system: systemPrompt,
              user: userPrompt
            },
            config: {
              model: options.model || 'claude-4', // Explicitly use Claude 4
              temperature: 0.3, // Lower temperature for more consistent technical output
              max_tokens: 4000
            },
            metadata: {
              features: features.map((f: any) => f.name),
              featureCount: features.length,
              generatedWith: 'claude-4',
              timestamp: new Date().toISOString()
            }
          })
        }
      ]
    };
  } catch (error: any) {
    console.error('❌ Error generating technical requirement:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Failed to generate technical requirement'
          })
        }
      ],
      isError: true
    };
  }
}

export async function handleCommitTrdToTaskList(args: any) {
  try {
    console.log('📋 MCP: Committing TRD to structured task list');
    console.log('📊 MCP: Input data:', JSON.stringify(args, null, 2));
    
    const { trdId, trdTitle, trdContent, strategyId, userId } = args;
    
    // Create system prompt for generating structured task list
    const systemPrompt = `You are a senior technical project manager who creates comprehensive implementation plans from Technical Requirements Documents.

Your task is to convert a TRD into a structured task list with 9 categories of development tasks. Each task should be:
1. **Specific and Actionable** - Can be completed by a developer in 1-5 days
2. **Well-Defined** - Clear acceptance criteria and definition of done
3. **Properly Categorized** - Fits into the correct implementation category
4. **Effort-Estimated** - Realistic story point estimates (1-13 scale)
5. **Dependency-Aware** - Understands what blocks what

You must create tasks across these 9 categories:
1. 🏗️ Infrastructure & Foundation (INFRA-001, INFRA-002, etc.)
2. 🔐 Security & Authentication (SEC-001, SEC-002, etc.)
3. 🗄️ Database & Data Management (DATA-001, DATA-002, etc.)
4. 🔄 Real-Time & Collaboration (RT-001, RT-002, etc.)
5. 🎨 Frontend & User Experience (FE-001, FE-002, etc.)
6. 🔌 API & Integration (API-001, API-002, etc.)
7. 🧪 Testing & Quality Assurance (QA-001, QA-002, etc.)
8. 📊 Monitoring & Observability (MON-001, MON-002, etc.)
9. 📚 Documentation & Knowledge Transfer (DOC-001, DOC-002, etc.)

Return a JSON object with this structure:
{
  "taskListMetadata": {
    "name": "Implementation Plan: [TRD Title]",
    "status": "Not Started",
    "priority": "Critical",
    "estimatedEffort": [total story points],
    "totalTasks": [number of tasks]
  },
  "categories": [
    {
      "id": "infrastructure",
      "name": "Infrastructure & Foundation", 
      "icon": "🏗️",
      "estimatedEffort": [category total points],
      "taskCount": [number of tasks in category]
    },
    // ... other categories
  ],
  "tasks": [
    {
      "taskId": "INFRA-001",
      "title": "Development Environment Setup",
      "category": "infrastructure",
      "priority": "Critical",
      "effort": 3,
      "status": "Not Started",
      "description": {
        "objective": "Configure local development environment with Docker",
        "businessValue": "Enables team productivity and consistent development",
        "technicalContext": "Based on TRD infrastructure requirements"
      },
      "acceptanceCriteria": [
        {"criterion": "Docker containers running locally", "status": "Not Started"},
        {"criterion": "Database migrations execute successfully", "status": "Not Started"},
        {"criterion": "All team members can run project locally", "status": "Not Started"}
      ],
      "dependencies": {
        "blocks": ["INFRA-002"],
        "blockedBy": [],
        "related": []
      },
      "technicalImplementation": {
        "approach": "Use Docker Compose for local development stack",
        "filesToCreate": [
          {"path": "docker-compose.yml", "status": "Not Started"},
          {"path": "Dockerfile", "status": "Not Started"},
          {"path": "README.md", "status": "Not Started"}
        ]
      },
      "definitionOfDone": [
        "All acceptance criteria met",
        "Code review approved", 
        "Tests passing with >90% coverage",
        "Documentation updated"
      ]
    },
    // ... more tasks
  ]
}`;

    const userPrompt = `Convert this Technical Requirements Document into a comprehensive implementation task list:

**TRD Title:** ${trdTitle}
**TRD ID:** ${trdId}

**TRD Content:**
${JSON.stringify(trdContent, null, 2)}

Create 15-25 specific, actionable development tasks distributed across all 9 categories. Each task should:

1. **Be derived from the TRD content** - Reference specific requirements, architecture decisions, security needs, etc.
2. **Include realistic effort estimates** - Use story points (1=very simple, 3=small, 5=medium, 8=large, 13=very large)
3. **Have clear acceptance criteria** - 2-5 specific, testable requirements
4. **Specify files to create** - Actual file paths and names developers will work on
5. **Define dependencies** - Which tasks block or depend on others
6. **Include implementation guidance** - Technical approach and considerations

Focus on:
- Infrastructure setup based on TRD architecture requirements
- Security implementation from TRD security requirements  
- Database design from TRD data architecture
- API development from TRD API specifications
- Frontend components from TRD user interface requirements
- Testing strategies from TRD quality requirements
- Monitoring from TRD performance requirements
- Documentation from TRD technical specifications

Make each task specific enough that a developer could pick it up and complete it without asking clarifying questions.`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            prompts: {
              system: systemPrompt,
              user: userPrompt
            },
            config: {
              model: 'claude-4',
              temperature: 0.3,
              max_tokens: 6000
            },
            metadata: {
              trdId,
              trdTitle,
              strategyId,
              userId,
              generatedWith: 'claude-4',
              timestamp: new Date().toISOString()
            }
          })
        }
      ]
    };
  } catch (error: any) {
    console.error('❌ MCP: Error committing TRD to task list:', error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Failed to commit TRD to task list'
          })
        }
      ],
      isError: true
    };
  }
}
