// Batched Task Generation Tools for Development Bank
export const batchedDevelopmentBankTools = [
    {
        name: 'commit_trd_to_task_list_batched',
        description: 'Convert a TRD into structured task lists using intelligent batching to avoid token limits',
        inputSchema: {
            type: 'object',
            properties: {
                trdId: { type: 'string' },
                trdTitle: { type: 'string' },
                trdContent: { type: 'object' },
                strategyId: { type: 'string' },
                userId: { type: 'string' }
            },
            required: ['trdId', 'trdTitle', 'strategyId', 'userId']
        }
    }
];
export async function handleCommitTrdToTaskListBatched(args) {
    console.log('🎯 MCP: Starting batched TRD to task list conversion');
    console.log('📊 MCP: Input data:', JSON.stringify(args, null, 2));
    const { trdId, trdTitle, trdContent, strategyId, userId } = args;
    try {
        // Step 1: Generate task list metadata and structure
        const metadataPrompt = {
            system: `You are a senior technical project manager. Your task is to analyze a TRD and create the overall structure and metadata for an implementation task list.

Return ONLY a JSON object with this structure:
{
  "taskListMetadata": {
    "name": "Implementation Plan: [TRD Title]",
    "status": "Not Started", 
    "priority": "Critical",
    "estimatedEffort": [total estimated story points],
    "totalTasks": [estimated number of tasks]
  },
  "categories": [
    {
      "id": "infrastructure",
      "name": "Infrastructure & Foundation",
      "icon": "🏗️", 
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks]
    },
    {
      "id": "security", 
      "name": "Security & Authentication",
      "icon": "🔐",
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks]
    },
    {
      "id": "database",
      "name": "Database & Data Management", 
      "icon": "🗄️",
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks]
    },
    {
      "id": "real-time",
      "name": "Real-Time & Collaboration",
      "icon": "🔄", 
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks]
    },
    {
      "id": "frontend",
      "name": "Frontend & User Experience",
      "icon": "🎨",
      "estimatedEffort": [category points], 
      "taskCount": [estimated tasks]
    },
    {
      "id": "api",
      "name": "API & Integration",
      "icon": "🔌",
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks] 
    },
    {
      "id": "testing",
      "name": "Testing & Quality Assurance",
      "icon": "🧪",
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks]
    },
    {
      "id": "monitoring", 
      "name": "Monitoring & Observability",
      "icon": "📊",
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks]
    },
    {
      "id": "documentation",
      "name": "Documentation & Knowledge Transfer", 
      "icon": "📚",
      "estimatedEffort": [category points],
      "taskCount": [estimated tasks]
    }
  ],
  "batches": [
    {
      "batchId": 1,
      "categories": ["infrastructure", "security", "database"],
      "description": "Foundation & Security"
    },
    {
      "batchId": 2, 
      "categories": ["real-time", "frontend", "api"],
      "description": "Application Layer"
    },
    {
      "batchId": 3,
      "categories": ["testing", "monitoring", "documentation"], 
      "description": "Quality & Operations"
    }
  ]
}`,
            user: `Analyze this TRD and create the task list structure:

**TRD Title:** ${trdTitle}
**TRD ID:** ${trdId}

**TRD Content:** ${JSON.stringify(trdContent, null, 2)}

Create realistic estimates for effort and task counts based on the TRD complexity. Each category should have 2-4 tasks typically.`
        };
        // Step 2: Generate category-specific task generation prompts
        const categoryPrompts = {
            batch1: {
                system: `You are a senior technical project manager creating specific implementation tasks.

Create tasks for Infrastructure, Security, and Database categories based on the TRD.

Return ONLY a JSON object with this structure:
{
  "tasks": [
    {
      "taskId": "INFRA-001",
      "title": "Specific Task Title", 
      "category": "infrastructure",
      "priority": "Critical|High|Medium|Low",
      "effort": 1-13,
      "status": "Not Started",
      "description": {
        "objective": "Clear objective statement",
        "businessValue": "Business value explanation", 
        "technicalContext": "Technical context from TRD"
      },
      "acceptanceCriteria": [
        {"criterion": "Specific testable requirement", "status": "Not Started"}
      ],
      "dependencies": {
        "blocks": ["TASK-IDs that this blocks"],
        "blockedBy": ["TASK-IDs that block this"],
        "related": ["Related task IDs"]
      },
      "technicalImplementation": {
        "approach": "Technical approach description",
        "filesToCreate": [
          {"path": "specific/file/path.ext", "status": "Not Started"}
        ]
      },
      "definitionOfDone": [
        "All acceptance criteria met",
        "Code review approved", 
        "Tests passing with >90% coverage",
        "Documentation updated"
      ]
    }
  ]
}`,
                user: `Create 2-4 specific tasks each for Infrastructure, Security, and Database categories based on this TRD:

**TRD Title:** ${trdTitle}
**Key Requirements:** 
- Infrastructure: ${JSON.stringify(trdContent?.technicalArchitecture?.infrastructureArchitecture || {}, null, 2)}
- Security: ${JSON.stringify(trdContent?.securityRequirements || {}, null, 2)} 
- Database: ${JSON.stringify(trdContent?.technicalArchitecture?.systemArchitecture?.dataArchitecture || {}, null, 2)}

Create actionable tasks with realistic dependencies and effort estimates.`
            },
            batch2: {
                system: `You are a senior technical project manager creating specific implementation tasks.

Create tasks for Real-Time, Frontend, and API categories based on the TRD.

Return ONLY a JSON object with the same task structure as batch 1.`,
                user: `Create 2-4 specific tasks each for Real-Time, Frontend, and API categories based on this TRD:

**TRD Title:** ${trdTitle}
**Key Requirements:**
- Real-Time: ${JSON.stringify(trdContent?.apiSpecifications?.realTimeApis || {}, null, 2)}
- Frontend: ${JSON.stringify(trdContent?.featureRequirements || {}, null, 2)}
- API: ${JSON.stringify(trdContent?.apiSpecifications?.restfulApis || {}, null, 2)}

Create actionable tasks with realistic dependencies and effort estimates.`
            },
            batch3: {
                system: `You are a senior technical project manager creating specific implementation tasks.

Create tasks for Testing, Monitoring, and Documentation categories based on the TRD.

Return ONLY a JSON object with the same task structure as previous batches.`,
                user: `Create 2-4 specific tasks each for Testing, Monitoring, and Documentation categories based on this TRD:

**TRD Title:** ${trdTitle}
**Key Requirements:**
- Testing: ${JSON.stringify(trdContent?.testScenarios || {}, null, 2)}
- Monitoring: ${JSON.stringify(trdContent?.successMetrics || {}, null, 2)}
- Documentation: Based on all TRD sections

Create actionable tasks with realistic dependencies and effort estimates.`
            }
        };
        // Return the orchestration plan
        return {
            success: true,
            orchestrationPlan: {
                metadata: metadataPrompt,
                batches: categoryPrompts,
                config: {
                    model: 'gpt-4o',
                    temperature: 0.3,
                    max_tokens: 4000 // Smaller batches = smaller token requirements
                }
            },
            metadata: {
                trdId,
                trdTitle,
                strategyId,
                userId,
                batchingStrategy: 'three-batch-approach',
                estimatedTokens: '12000 total (4000 per call)',
                timestamp: new Date().toISOString()
            }
        };
    }
    catch (error) {
        console.error('❌ MCP: Error in batched task list generation:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
//# sourceMappingURL=development-bank-tools-batched.js.map