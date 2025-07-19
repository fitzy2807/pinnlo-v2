/**
 * Tech Stack Tools for MCP Server
 * Generates comprehensive technical documentation for technologies
 */
export const techStackTools = [
    {
        name: 'generate_tech_stack_component',
        description: "Generate comprehensive technical documentation for a technology component",
        inputSchema: {
            type: "object",
            properties: {
                technology_name: {
                    type: "string",
                    description: "Name of the technology (e.g., React, PostgreSQL, Docker)"
                },
                category: {
                    type: "string",
                    description: "Technology category",
                    enum: ["Frontend", "Backend", "Database", "Infrastructure", "DevOps", "Analytics", "Security", "Integration", "Mobile"]
                },
                existing_stack: {
                    type: "array",
                    description: "Current tech stack for compatibility analysis",
                    items: {
                        type: "object",
                        properties: {
                            technology_name: { type: "string" },
                            category: { type: "string" }
                        }
                    }
                },
                company_context: {
                    type: "object",
                    description: "Company-specific context",
                    properties: {
                        industry: { type: "string" },
                        team_size: { type: "string" },
                        tech_maturity: { type: "string" }
                    }
                }
            },
            required: ["technology_name", "category"]
        }
    },
    {
        name: 'analyze_tech_stack',
        description: "Analyze the current tech stack and provide recommendations",
        inputSchema: {
            type: "object",
            properties: {
                components: {
                    type: "array",
                    description: "Current tech stack components",
                    items: {
                        type: "object",
                        properties: {
                            technology_name: { type: "string" },
                            category: { type: "string" },
                            implementation_status: { type: "string" }
                        }
                    }
                },
                project_type: {
                    type: "string",
                    description: "Type of project (e.g., SaaS, Mobile App, Enterprise)"
                }
            },
            required: ["components"]
        }
    }
];
// Handler functions
export async function handleGenerateTechStackComponent(args) {
    const { technology_name, category, existing_stack = [], company_context = {} } = args;
    // Build context about existing stack
    const stackContext = existing_stack.length > 0
        ? `Current tech stack includes: ${existing_stack.map((t) => `${t.technology_name} (${t.category})`).join(', ')}.`
        : 'This is the first technology in the stack.';
    // Create comprehensive system prompt
    const systemPrompt = `You are a senior technical architect with deep expertise in modern technology stacks and enterprise architecture. You have extensive hands-on experience with ${category} technologies and understand real-world implementation challenges.

Your task is to generate comprehensive, practical technical documentation for ${technology_name} that will be used by a development team.

Context: ${stackContext}
${company_context.industry ? `Industry: ${company_context.industry}` : ''}
${company_context.team_size ? `Team size: ${company_context.team_size}` : ''}

Provide accurate, current information based on the latest stable versions and industry best practices. Focus on practical implementation details rather than marketing speak.`;
    // Create detailed user prompt
    const userPrompt = `Generate comprehensive technical documentation for ${technology_name} in the ${category} category.

Return a JSON object with detailed technical information including description, version, capabilities, implementation guidance, security features, and strategic alignment.`;
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    prompts: {
                        system: systemPrompt,
                        user: userPrompt
                    }
                })
            }]
    };
}
export async function handleAnalyzeTechStack(args) {
    const { components, project_type = "Web Application" } = args;
    // Analyze current stack
    const categories = [...new Set(components.map((c) => c.category))];
    const missingCategories = ["Frontend", "Backend", "Database", "DevOps", "Security"]
        .filter(cat => !categories.includes(cat));
    const systemPrompt = `You are a technical architect analyzing a technology stack for a ${project_type}. Provide strategic recommendations based on industry best practices and modern architecture patterns.`;
    const userPrompt = `Analyze this tech stack and provide recommendations:

Current Stack:
${components.map((c) => `- ${c.technology_name} (${c.category}) - ${c.implementation_status}`).join('\n')}

Missing Categories: ${missingCategories.join(', ') || 'None'}

Provide a comprehensive analysis with assessment, recommendations, and optimization opportunities.`;
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    prompts: {
                        system: systemPrompt,
                        user: userPrompt
                    }
                })
            }]
    };
}
//# sourceMappingURL=tech-stack-tools.js.map