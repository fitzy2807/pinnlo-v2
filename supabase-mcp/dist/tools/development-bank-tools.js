// Tool type will be inferred from the object structure
export const developmentBankTools = [
    {
        name: 'generate_tech_stack_recommendations',
        description: 'Generate AI-powered technology stack recommendations based on project requirements',
        inputSchema: {
            type: 'object',
            properties: {
                companyProfile: {
                    type: 'object',
                    properties: {
                        size: {
                            type: 'string',
                            enum: ['startup', 'growth', 'enterprise']
                        },
                        budget: {
                            type: 'object',
                            properties: {
                                min: { type: 'number' },
                                max: { type: 'number' },
                                currency: { type: 'string' }
                            }
                        },
                        teamSize: { type: 'number' },
                        existingSkills: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    },
                    required: ['size', 'budget']
                },
                projectRequirements: {
                    type: 'object',
                    properties: {
                        projectType: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        features: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        constraints: {
                            type: 'object',
                            properties: {
                                hasRealtime: { type: 'boolean' },
                                hasAuth: { type: 'boolean' },
                                hasPayments: { type: 'boolean' },
                                scalability: { type: 'boolean' },
                                performance: { type: 'string' },
                                compliance: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            }
                        }
                    },
                    required: ['projectType']
                },
                strategyContext: {
                    type: 'object',
                    properties: {
                        vision: { type: 'string' },
                        targetMarket: { type: 'string' },
                        timeframe: { type: 'string' },
                        cards: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    cardType: { type: 'string' },
                                    techConsiderations: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            },
            required: ['companyProfile', 'projectRequirements']
        }
    },
    {
        name: 'generate_technical_specification',
        description: 'Generate technical specifications from feature cards and tech stack',
        inputSchema: {
            type: 'object',
            properties: {
                features: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            userStories: { type: 'object' },
                            acceptanceCriteria: { type: 'object' },
                            techConsiderations: { type: 'string' },
                            dependencies: { type: 'array', items: { type: 'string' } },
                            linkedPersona: { type: 'string' }
                        }
                    }
                },
                epics: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            outcomes: { type: 'array' },
                            successCriteria: { type: 'array' }
                        }
                    }
                },
                techStack: {
                    type: 'object',
                    properties: {
                        stackName: { type: 'string' },
                        layers: { type: 'object' }
                    }
                },
                options: {
                    type: 'object',
                    properties: {
                        format: {
                            type: 'string',
                            enum: ['ai-ready', 'markdown', 'detailed']
                        },
                        includeExamples: { type: 'boolean' },
                        includeDiagrams: { type: 'boolean' }
                    }
                }
            },
            required: ['features', 'techStack']
        }
    },
    {
        name: 'generate_test_scenarios',
        description: 'Generate test scenarios from feature acceptance criteria',
        inputSchema: {
            type: 'object',
            properties: {
                features: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            acceptanceCriteria: { type: 'object' },
                            userStories: { type: 'object' },
                            linkedPersona: { type: 'string' }
                        }
                    }
                },
                techStack: {
                    type: 'object',
                    properties: {
                        stackName: { type: 'string' },
                        layers: { type: 'object' }
                    }
                },
                options: {
                    type: 'object',
                    properties: {
                        includeEdgeCases: { type: 'boolean' },
                        includeTestData: { type: 'boolean' },
                        format: { type: 'string', enum: ['bdd', 'standard', 'ai-ready'] }
                    }
                }
            },
            required: ['features']
        }
    },
    {
        name: 'generate_task_list',
        description: 'Generate development tasks from features and epics',
        inputSchema: {
            type: 'object',
            properties: {
                features: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            dependencies: { type: 'array', items: { type: 'string' } },
                            estimation: { type: 'string' }
                        }
                    }
                },
                epics: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            milestones: { type: 'object' }
                        }
                    }
                },
                techStack: {
                    type: 'object',
                    properties: {
                        stackName: { type: 'string' },
                        layers: { type: 'object' }
                    }
                }
            },
            required: ['features', 'techStack']
        }
    }
];
export async function handleGenerateTechStackRecommendations(args) {
    try {
        // Debug: Preparing tech stack recommendation request
        const { companyProfile, projectRequirements, strategyContext } = args;
        // Build the prompt for AI
        const systemPrompt = `You are an expert technology architect helping companies choose the right tech stack.
Your recommendations should be:
1. Practical and proven in production
2. Aligned with team skills and budget
3. Scalable for future growth
4. Based on current best practices (as of 2024)
5. Include specific version numbers where relevant

For each recommendation, provide:
- Clear rationale for why it fits their needs
- Monthly cost estimates
- Pros and cons
- Common pairings with other technologies`;
        const userPrompt = `Generate 2-3 tech stack recommendations for:

Company Profile:
- Size: ${companyProfile.size}
- Budget: ${companyProfile.budget.min}-${companyProfile.budget.max} ${companyProfile.budget.currency}/month
- Team Size: ${companyProfile.teamSize || 'Not specified'}
- Existing Skills: ${companyProfile.existingSkills?.join(', ') || 'Not specified'}

Project Requirements:
- Type: ${projectRequirements.projectType.join(', ')}
- Key Features: ${projectRequirements.features?.join(', ') || 'Standard web app features'}
- Constraints: ${JSON.stringify(projectRequirements.constraints)}

${strategyContext ? `Strategy Context:
- Vision: ${strategyContext.vision || 'Not specified'}
- Target Market: ${strategyContext.targetMarket || 'Not specified'}
- Timeframe: ${strategyContext.timeframe || 'Not specified'}` : ''}

Return a JSON array with 2-3 recommendations. Each should have:
{
  "stackName": "Descriptive name",
  "stackType": "ai-generated",
  "layers": {
    "frontend": [{ "vendor": "...", "product": "...", "version": "...", "pricing": { "model": "free|freemium|usage|seat|flat", "monthlyCost": 0 }, "rationale": "..." }],
    "backend": [...],
    "database": [...],
    "infrastructure": [...],
    "auth": [...],
    "monitoring": [...]
  },
  "metadata": {
    "totalMonthlyCost": 0,
    "confidenceScore": 0.0-1.0,
    "strengths": ["..."],
    "considerations": ["..."],
    "bestFor": "..."
  }
}`;
        // Return the prepared prompt data for the HTTP server or API to process
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
                            model: 'gpt-4-turbo-preview',
                            temperature: 0.7,
                            responseFormat: 'json'
                        },
                        requestData: args
                    })
                }
            ]
        };
    }
    catch (error) {
        console.error('❌ Error preparing tech stack recommendation request:', error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message || 'Failed to prepare recommendation request'
                    })
                }
            ],
            isError: true
        };
    }
}
export async function handleGenerateTechnicalSpecification(args) {
    try {
        // Debug: Generating technical specification
        const { features, epics, techStack, options = {} } = args;
        const format = options.format || 'ai-ready';
        // Extract key information from features
        const featureRequirements = features.map((f) => ({
            title: f.title,
            stories: f.userStories,
            acceptance: f.acceptanceCriteria,
            technical: f.techConsiderations,
            dependencies: f.dependencies || []
        }));
        // Build tech context
        const techContext = Object.entries(techStack.layers)
            .map(([layer, choices]) => `${layer}: ${choices.map((c) => c.product).join(', ')}`).join('\n');
        // Create the specification prompt
        const systemPrompt = `You are a senior technical architect creating comprehensive technical specifications.
Your specifications should be:
1. Detailed and actionable for developers
2. Specific to the chosen tech stack
3. Include concrete implementation details
4. Address security, performance, and scalability
5. Follow industry best practices

Format: ${format === 'ai-ready' ? 'Optimized for AI coding assistants' :
            format === 'markdown' ? 'Well-structured markdown documentation' :
                'Detailed technical documentation'}`;
        const userPrompt = `Generate a technical specification for the following features:

Features:
${JSON.stringify(featureRequirements, null, 2)}

${epics ? `Epics Context:\n${JSON.stringify(epics.map((e) => ({ title: e.title, outcomes: e.outcomes })), null, 2)}\n` : ''}

Tech Stack:
${techContext}

Create a comprehensive technical specification that includes:
1. Overview and objectives
2. System architecture
3. Data models and schemas
4. API specifications
5. Security requirements
6. Performance considerations
7. Implementation guidelines
8. Testing approach

${format === 'ai-ready' ? 'Format the output to be easily consumed by AI coding assistants like Claude or Cursor.' :
            format === 'markdown' ? 'Use proper markdown formatting with headers, code blocks, and lists.' :
                'Provide detailed technical documentation suitable for a development team.'}

${options.includeExamples ? 'Include code examples for key implementations.' : ''}
${options.includeDiagrams ? 'Include mermaid diagrams for architecture and data flow.' : ''}`;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        tool: 'generate_technical_specification',
                        prompt: {
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: userPrompt }
                            ],
                            model: 'gpt-4-turbo-preview',
                            temperature: 0.7,
                            max_tokens: 4000
                        }
                    })
                }
            ]
        };
    }
    catch (error) {
        console.error('❌ Error preparing technical specification:', error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message || 'Failed to prepare specification'
                    })
                }
            ],
            isError: true
        };
    }
}
export async function handleGenerateTestScenarios(args) {
    try {
        // Debug: Generating test scenarios
        const { features, techStack, options = {} } = args;
        const format = options.format || 'ai-ready';
        const systemPrompt = `You are a QA architect creating comprehensive test scenarios.
Create test scenarios that:
1. Cover all acceptance criteria
2. Include positive, negative, and edge cases
3. Are specific to the tech stack
4. Include test data examples
5. Follow ${format} format`;
        const userPrompt = `Generate test scenarios for these features:
${JSON.stringify(features, null, 2)}

Tech Stack: ${techStack.stackName}

Create scenarios in ${format} format with:
- Happy path tests
- Error scenarios
- Edge cases
- Performance tests
- Security tests
${options.includeTestData ? 'Include sample test data' : ''}`;
        return {
            success: true,
            tool: 'generate_test_scenarios',
            prompt: {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4-turbo-preview',
                temperature: 0.7
            }
        };
    }
    catch (error) {
        console.error('❌ Error preparing test scenarios:', error);
        return { success: false, error: error.message };
    }
}
export async function handleGenerateTaskList(args) {
    try {
        // Debug: Generating task list
        const { features, epics, techStack } = args;
        const systemPrompt = `You are a technical project manager breaking down features into development tasks.
Create tasks that:
1. Are atomic and completable in 1-3 days
2. Include clear acceptance criteria
3. Consider dependencies
4. Are specific to the tech stack
5. Include effort estimates`;
        const userPrompt = `Break down these features into development tasks:
${JSON.stringify(features, null, 2)}

${epics ? `Epics context:\n${JSON.stringify(epics, null, 2)}\n` : ''}

Tech Stack: ${techStack.stackName}

For each task provide:
- Task title
- Description
- Dependencies
- Effort estimate (hours)
- Acceptance criteria
- Implementation notes`;
        return {
            success: true,
            tool: 'generate_task_list',
            prompt: {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'gpt-4-turbo-preview',
                temperature: 0.7
            }
        };
    }
    catch (error) {
        console.error('❌ Error preparing task list:', error);
        return { success: false, error: error.message };
    }
}
//# sourceMappingURL=development-bank-tools.js.map