// Tool type will be inferred from the object structure
import { getSystemPrompt } from '../lib/supabase';
import fs from 'fs';
import path from 'path';
// Function to get blueprint field definitions dynamically from TypeScript config files
async function getBlueprintFields(blueprintType) {
    try {
        // Map blueprint types to their actual config file names
        const blueprintFileMap = {
            'features': 'feature',
            'epics': 'epic',
            'personas': 'persona',
            'valuePropositions': 'valueProposition',
            'value-proposition': 'valueProposition',
            'workstreams': 'workstream',
            'userJourneys': 'userJourney',
            'experienceSections': 'experienceSection',
            'serviceBlueprints': 'serviceBlueprint',
            'organisationalCapabilities': 'organisationalCapability',
            'gtmPlays': 'gtmPlay',
            'techRequirements': 'technicalRequirement',
            'strategicContext': 'strategicContext',
            'strategic-context': 'strategicContext',
            'customerExperience': 'customerJourney',
            'swot-analysis': 'swot',
            'competitive-analysis': 'competitiveAnalysis',
            'business-model': 'businessModel',
            'go-to-market': 'goToMarket',
            'risk-assessment': 'riskAssessment',
            'roadmap': 'roadmap',
            'vision': 'vision',
            'okr': 'okr',
            'kpis': 'kpi',
            'financial-projections': 'financialProjections',
            'cost-driver': 'costDriver',
            'revenue-driver': 'revenueDriver',
            'prd': 'prd',
            'trd': 'trd',
            'product-requirements': 'prd',
            'technical-requirements': 'trd',
            'tech-stack': 'techStack',
            'techStack': 'techStack',
            'problem-statement': 'problemStatement'
        };
        // Get the actual config file name
        const configFileName = blueprintFileMap[blueprintType] || blueprintType;
        const blueprintPath = path.join(process.cwd(), '..', 'src', 'components', 'blueprints', 'configs', `${configFileName}Config.ts`);
        console.log('Looking for blueprint config at:', blueprintPath);
        console.log('Blueprint file exists:', fs.existsSync(blueprintPath));
        if (fs.existsSync(blueprintPath)) {
            const fileContent = fs.readFileSync(blueprintPath, 'utf8');
            // Extract field definitions from the file - use greedy match to capture all fields
            const fieldsMatch = fileContent.match(/fields:\s*\[([\s\S]*)\],?\s*defaultValues/);
            console.log('Fields match found:', !!fieldsMatch);
            if (fieldsMatch) {
                // Parse the fields and format them for the prompt
                const fieldsText = fieldsMatch[1];
                console.log('Fields text length:', fieldsText.length);
                // Use a more robust approach to parse the field definitions
                // Find all field boundaries by looking for 'id:' patterns
                const fieldSeparatorRegex = /\s*\{\s*id:\s*['"`]([^'"`]+)['"`]/g;
                const fieldBoundaries = [];
                let match;
                while ((match = fieldSeparatorRegex.exec(fieldsText)) !== null) {
                    fieldBoundaries.push({
                        id: match[1],
                        startIndex: match.index,
                        matchLength: match[0].length
                    });
                }
                console.log('Found field boundaries:', fieldBoundaries.length);
                const fieldDescriptions = [];
                for (let i = 0; i < fieldBoundaries.length; i++) {
                    const currentField = fieldBoundaries[i];
                    const nextField = fieldBoundaries[i + 1];
                    const fieldStartIndex = currentField.startIndex;
                    const fieldEndIndex = nextField ? nextField.startIndex : fieldsText.length;
                    const fieldText = fieldsText.substring(fieldStartIndex, fieldEndIndex);
                    // Extract field properties
                    const nameMatch = fieldText.match(/name:\s*['"`]([^'"`]+)['"`]/);
                    const typeMatch = fieldText.match(/type:\s*['"`]([^'"`]+)['"`]/);
                    const requiredMatch = fieldText.match(/required:\s*(true|false)/);
                    const descriptionMatch = fieldText.match(/description:\s*['"`]([^'"`]+)['"`]/);
                    const placeholderMatch = fieldText.match(/placeholder:\s*['"`]([^'"`]+)['"`]/);
                    if (nameMatch && typeMatch) {
                        const fieldType = typeMatch[1];
                        const isRequired = requiredMatch ? requiredMatch[1] === 'true' : false;
                        const description = descriptionMatch ? descriptionMatch[1] : '';
                        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
                        // Map field types to expected JSON formats
                        let jsonType = 'string';
                        let example = '""';
                        switch (fieldType) {
                            case 'array':
                                jsonType = 'array of strings';
                                example = '["item1", "item2"]';
                                break;
                            case 'enum':
                                jsonType = 'string (enum)';
                                example = '"option1"';
                                break;
                            case 'textarea':
                                jsonType = 'string (multiline)';
                                example = '"Multi-line text content"';
                                break;
                            case 'number':
                                jsonType = 'number';
                                example = '0';
                                break;
                            case 'boolean':
                                jsonType = 'boolean';
                                example = 'true';
                                break;
                            default:
                                jsonType = 'string';
                                example = '""';
                        }
                        const fieldDesc = `- ${currentField.id}: ${nameMatch[1]} (${jsonType}) ${isRequired ? '[REQUIRED]' : '[OPTIONAL]'} - ${description || placeholder || 'No description'} - Example: ${example}`;
                        fieldDescriptions.push(fieldDesc);
                    }
                }
                console.log('Parsed field descriptions:', fieldDescriptions.length);
                if (fieldDescriptions.length > 0) {
                    return fieldDescriptions.join('\n');
                }
            }
        }
        // Fallback: Return basic field structure
        return `- title: Title (string) [REQUIRED] - Card title
- description: Description (string) [REQUIRED] - Card description
- tags: Tags (array of strings) [OPTIONAL] - Relevant tags
- strategicAlignment: Strategic Alignment (string) [OPTIONAL] - How this aligns with strategy`;
    }
    catch (error) {
        console.error('Error reading blueprint fields:', error);
        return `- title: Title (string) [REQUIRED] - Card title
- description: Description (string) [REQUIRED] - Card description
- tags: Tags (array of strings) [OPTIONAL] - Relevant tags`;
    }
}
// Helper function to generate prompt for SINGLE card with explicit field requirements
function generateSingleCardPrompt(contextSummary, targetBlueprint, fieldDefinitions, cardIndex, existingCards) {
    // PRD-specific field handling
    if (targetBlueprint === 'prd') {
        return `Generate ONE comprehensive Product Requirements Document (PRD) card based on the following context.

IMPORTANT: You must return a single JSON object with ALL 39 PRD fields populated with meaningful, specific content.

## Context Summary:
${contextSummary}

## REQUIRED JSON OUTPUT FORMAT:
{
  "title": "Clear, specific PRD title based on context",
  "description": "2-3 sentence description of this PRD's purpose and scope",
  "priority": "high",
  "confidence": {
    "level": "high",
    "rationale": "Explanation of confidence level based on context quality"
  },
  "blueprintFields": {
    // Document Control (5 fields)
    "prd_id": "PRD-" + Date.now(),
    "version": "1.0",
    "status": "draft",
    "product_manager": "Generated product manager name based on context",
    "last_reviewed": "2025-01-17",
    
    // Section 1: Product Overview (6 fields)
    "product_vision": "Specific, inspiring product vision based on context",
    "problem_statement": "Clear, detailed problem statement from context analysis",
    "solution_overview": "Comprehensive solution overview addressing the problem",
    "target_audience": "Specific target audience with demographics and use cases",
    "value_proposition": "Clear, compelling value proposition for users",
    "success_summary": "Detailed success criteria and expected outcomes",
    
    // Section 2: Requirements (5 fields)
    "user_stories": "5-10 user stories in format: As a [user], I want [feature] so that [benefit]",
    "functional_requirements": "8-15 detailed functional requirements with REQ-XXX IDs",
    "non_functional_requirements": "Performance, security, scalability, and quality requirements",
    "acceptance_criteria": "Specific, measurable acceptance criteria for each feature",
    "out_of_scope": "Clear list of items explicitly excluded from this PRD scope",
    
    // Section 3: User Experience (5 fields)
    "user_flows": "Detailed user flow descriptions for key scenarios",
    "wireframes_mockups": "References to wireframes, mockups, or design specifications",
    "interaction_design": "Specific interaction design requirements and patterns",
    "accessibility_requirements": "WCAG compliance and accessibility feature requirements",
    "mobile_considerations": "Mobile-specific requirements, responsive design needs",
    
    // Section 4: Business Context (6 fields)
    "business_objectives": "Clear, measurable business objectives this product supports",
    "revenue_model": "Detailed revenue generation strategy and monetization approach",
    "pricing_strategy": "Pricing model, strategy, and competitive positioning",
    "go_to_market_plan": "High-level go-to-market strategy and launch approach",
    "competitive_positioning": "Competitive analysis and differentiation strategy",
    "success_metrics": "Specific KPIs, metrics, and measurement framework",
    
    // Section 5: Implementation Planning (6 fields)
    "mvp_definition": "Clear definition of minimum viable product scope",
    "release_phases": "Phased release plan with timeline and feature breakdown",
    "feature_prioritization": "Framework and criteria for feature prioritization",
    "timeline_milestones": "Key milestones with dates, deliverables, and dependencies",
    "dependencies": "Technical, business, and external dependencies with resolution plans",
    "risks_and_mitigation": "Risk assessment with impact, probability, and mitigation strategies",
    
    // Section 6: Metadata & Relationships (6 fields)
    "linked_trds": "Related Technical Requirements Documents and their relationships",
    "linked_tasks": "Development tasks and work items derived from this PRD",
    "linked_features": "Feature cards and user stories that implement this PRD",
    "stakeholder_list": "Key stakeholders, their roles, and responsibilities",
    "tags": "Relevant tags for categorization and discovery",
    "implementation_notes": "Additional technical notes, constraints, and considerations"
  },
  "tags": ["prd", "product-requirements", "development"],
  "implementation": {
    "timeline": "Realistic implementation timeline based on scope",
    "dependencies": ["Key technical and business dependencies"],
    "successCriteria": ["Measurable success criteria for this PRD"]
  }
}

**CRITICAL REQUIREMENTS**:
- ALL 39 fields must be populated with meaningful, context-specific content
- NO placeholder text, "TBD", or generic content allowed
- Content must be professional-quality and production-ready
- Use the provided context to make all content relevant and specific
- Ensure consistency across all sections

**FINAL CHECK**: Verify all 39 blueprintFields are populated with substantive content before responding.`;
    }
    // TRD-specific field handling
    if (targetBlueprint === 'trd' || targetBlueprint === 'technical-requirements') {
        return `Generate ONE comprehensive Technical Requirements Document (TRD) card based on the following context.

IMPORTANT: You must return a single JSON object with ALL 52+ TRD fields populated with meaningful, specific technical content.

## Context Summary:
${contextSummary}

## REQUIRED JSON OUTPUT FORMAT:
{
  "title": "Clear, specific TRD title based on technical requirements",
  "description": "2-3 sentence description of this TRD's technical scope and purpose",
  "priority": "high",
  "confidence": {
    "level": "high",
    "rationale": "Explanation of confidence level based on technical context quality"
  },
  "blueprintFields": {
    // 1. Executive Summary (5 fields)
    "system_overview": "Comprehensive technical architecture overview with specific technologies and patterns",
    "business_purpose": "Business context and strategic alignment with measurable technical outcomes",
    "key_architectural_decisions": "Critical technical decisions with rationale and trade-offs",
    "strategic_alignment": "Alignment with company tech strategy and platform roadmap",
    "success_criteria": "Specific, measurable technical and business success metrics",
    
    // 2. System Architecture (8 fields)
    "high_level_design": "Overall system architecture with service decomposition and integration patterns",
    "component_interactions": "Inter-service communication protocols and data flow patterns",
    "technology_stack_frontend": "Frontend frameworks, libraries, and build tools with versions",
    "technology_stack_backend": "Backend frameworks, runtime environments, and middleware",
    "technology_stack_database": "Database systems, ORM, caching, and data storage solutions",
    "technology_stack_other": "Infrastructure components, monitoring, and deployment platforms",
    "integration_points": "External system integrations and third-party API dependencies",
    "data_flow": "Data movement patterns, transformation, and processing workflows",
    
    // 3. Feature-Specific Requirements (6 fields)
    "feature_overview": "Comprehensive feature scope and functionality description",
    "technical_approach": "Implementation strategy with algorithms and design patterns",
    "required_components": "Necessary technical components, services, and dependencies",
    "data_flow_processing": "Data processing workflows and transformation logic",
    "business_logic": "Core business rules, validation logic, and decision-making processes",
    "ui_requirements": "User interface components, interactions, and experience requirements",
    
    // 4. Data Architecture (5 fields)
    "database_schema": "Table structures, columns, data types, and constraints",
    "data_relationships": "Entity relationships, foreign keys, and referential integrity",
    "validation_rules": "Data validation constraints and business rule enforcement",
    "migration_strategies": "Database migration procedures and versioning approach",
    "data_governance": "Privacy policies, retention rules, and compliance requirements",
    
    // 5. API Specifications (5 fields)
    "endpoint_definitions": "REST API endpoints with paths, methods, and parameters",
    "request_response_formats": "JSON schemas and data validation specifications",
    "authentication_methods": "Authentication flows and authorization implementation",
    "rate_limiting": "Rate limiting policies, quotas, and throttling strategies",
    "error_handling": "Error response patterns, status codes, and recovery procedures",
    
    // 6. Security Requirements (5 fields)
    "authentication_authorization": "User authentication and access control mechanisms",
    "data_encryption": "Encryption at rest and in transit with key management",
    "input_validation": "Input sanitization and security filtering requirements",
    "security_headers": "HTTP security headers and browser protection mechanisms",
    "compliance_requirements": "Regulatory compliance and security standards",
    
    // 7. Performance & Scalability (5 fields)
    "performance_targets": "Specific performance metrics with measurable targets",
    "caching_strategies": "Multi-layer caching implementation and optimization",
    "load_balancing": "Load distribution strategies and traffic management",
    "database_optimization": "Database performance tuning and optimization approaches",
    "scaling_plans": "Horizontal and vertical scaling strategies with auto-scaling",
    
    // 8. Infrastructure Requirements (5 fields)
    "hosting_deployment": "Hosting platform and deployment architecture specifications",
    "environment_configurations": "Development, staging, and production environment setup",
    "monitoring_logging": "System monitoring, logging strategies, and alerting mechanisms",
    "backup_recovery": "Data backup procedures and disaster recovery planning",
    "resource_requirements": "Compute, storage, and network resource specifications",
    
    // 9. Testing Strategy (5 fields)
    "unit_testing": "Unit testing frameworks, coverage targets, and quality gates",
    "integration_testing": "Integration testing strategy and API validation approaches",
    "performance_testing": "Load testing scenarios and performance benchmarking",
    "security_testing": "Security testing procedures and vulnerability assessment",
    "user_acceptance_testing": "UAT criteria and stakeholder validation processes",
    
    // 10. Implementation Guidelines (5 fields)
    "development_standards": "Coding conventions and development best practices",
    "code_organization": "Project structure and architectural organization patterns",
    "documentation_requirements": "Technical documentation standards and requirements",
    "version_control": "Git workflows, branching strategies, and release management",
    "deployment_pipeline": "CI/CD pipeline stages and deployment automation",
    
    // 11. Metadata & Relationships (8 fields)
    "trd_id": "TRD-" + Date.now(),
    "version": "1.0.0",
    "status": "draft",
    "assigned_team": "Responsible development teams based on technical requirements",
    "linked_features": "Related PRDs and feature dependencies that this TRD implements",
    "dependencies": "Technical dependencies and prerequisites with resolution plans",
    "tags": "Relevant technical tags for categorization and discovery",
    "implementation_notes": "Additional technical considerations and constraints"
  },
  "tags": ["trd", "technical-requirements", "development", "architecture"],
  "implementation": {
    "timeline": "Realistic technical implementation timeline based on complexity",
    "dependencies": ["Key technical and infrastructure dependencies"],
    "successCriteria": ["Measurable technical success criteria for this TRD"]
  }
}

**CRITICAL REQUIREMENTS**:
- ALL 52+ fields must be populated with meaningful, technical content
- NO placeholder text, "TBD", or generic content allowed
- Content must be technically accurate and implementation-ready
- Use realistic technology choices and architectural patterns
- Include specific metrics, protocols, and technical specifications
- Ensure consistency across all technical sections

**FINAL CHECK**: Verify all 52+ blueprintFields are populated with substantive technical content before responding.`;
    }
    // Tech Stack-specific field handling
    if (targetBlueprint === 'tech-stack' || targetBlueprint === 'techStack') {
        return `Generate ONE comprehensive Technology Stack card based on the following context.

IMPORTANT: You must return a single JSON object with ALL 15 tech stack fields populated with meaningful, specific technology content.

## Context Summary:
${contextSummary}

## REQUIRED JSON OUTPUT FORMAT:
{
  "title": "Clear, specific tech stack title (e.g., 'Pinnlo V2 Strategy Platform Tech Stack')",
  "description": "2-3 sentence description of this technology stack's purpose and scope",
  "priority": "high",
  "confidence": {
    "level": "high",
    "rationale": "Explanation of confidence level based on context quality and technology choices"
  },
  "blueprintFields": {
    // === CORE INFORMATION FIELDS (5 fields) ===
    "stack_name": "Clear, descriptive name for this technology stack",
    "stack_type": "Type categorization (e.g., Full-Stack Web Application, Mobile App, API Service)",
    "architecture_pattern": "High-level architectural approach (e.g., Jamstack, Microservices, Serverless)",
    "primary_use_case": "Comprehensive business purpose and primary functionality",
    "last_updated": "Current date (YYYY-MM-DD format)",
    
    // === TECHNOLOGY CATEGORIES (8 tag fields) ===
    "frontend": ["React-18", "Next.js-14", "TypeScript", "Tailwind-CSS"],
    "backend": ["Node.js", "Express", "REST-APIs", "JWT-Auth"],
    "database": ["PostgreSQL", "Supabase", "Redis", "JSONB"],
    "infrastructure": ["Vercel", "CDN", "Docker", "Kubernetes"],
    "platforms": ["GitHub", "Slack", "Jira", "Analytics"],
    "ai": ["OpenAI-GPT-4", "Claude-3", "Embeddings", "Vector-DB"],
    "development": ["npm", "TypeScript", "Jest", "ESLint", "Git"],
    "integrations": ["Stripe", "SendGrid", "OAuth", "Webhooks"],
    
    // === CONTEXT FIELDS (2 fields) ===
    "key_decisions": "Document major technology choices, architecture decisions, and their rationale",
    "migration_notes": "Track technology evolution plans, upgrade schedules, and migration strategies"
  },
  "tags": ["tech-stack", "technology", "architecture"],
  "implementation": {
    "timeline": "Technology implementation and setup timeline",
    "dependencies": ["Key technical dependencies and prerequisites"],
    "successCriteria": ["Technology adoption and performance success criteria"]
  }
}

**TAG FORMAT GUIDELINES**:
- Use hyphenated naming (e.g., "Next.js-14", "PostgreSQL-15")
- Include version numbers when relevant
- Be specific and descriptive
- Focus on technologies actually in use or planned
- Each tag array should contain 3-8 relevant items

**CRITICAL REQUIREMENTS**:
- ALL 15 fields must be populated with meaningful, specific content
- NO placeholder text, "TBD", or generic content allowed
- Technology choices must be realistic and consistent
- Tag arrays must contain actual technologies, not descriptions
- Use context to inform realistic technology selections
- Ensure consistency across all technology categories

**FINAL CHECK**: Verify all 15 blueprintFields are populated with specific technology content before responding.`;
    }
    return `Generate ONE ${targetBlueprint} card (#${cardIndex}) based on the following context.

IMPORTANT: You must return a single JSON object (NOT an array). The response must be valid JSON that can be parsed.

## Context Summary:
${contextSummary}

## Existing ${targetBlueprint} Cards to avoid duplicating:
${existingCards.filter((c) => c.cardType === targetBlueprint).map((c) => `- ${c.title}`).join('\n') || 'None'}

## REQUIRED OUTPUT FORMAT:
You must return a single JSON object with the following structure:

{
  "title": "Clear, actionable title for this ${targetBlueprint} card",
  "description": "2-3 sentence description of this card's purpose and value",
  "priority": "high", // or "medium" or "low"
  "confidence": {
    "level": "high", // or "medium" or "low"
    "rationale": "Brief explanation of confidence level"
  },
  "blueprintFields": {
${fieldDefinitions.split('\n').map(line => {
        const match = line.match(/- (\w+): .* \[.*\] - (.*) - Example: (.*)$/);
        if (match) {
            const fieldId = match[1];
            const description = match[2];
            const example = match[3];
            return `    "${fieldId}": ${example} // ${description}`;
        }
        return '';
    }).filter(Boolean).join(',\n')}
  },
  "tags": ["relevant", "tags", "here"],
  "implementation": {
    "timeline": "Suggested timeline",
    "dependencies": ["Key dependencies"],
    "successCriteria": ["Measurable success criteria"]
  }
}

Ensure all required fields are populated with meaningful, specific content based on the context provided.`;
}
// Helper function to generate user prompt based on context (for multiple cards - keeping for backward compatibility)
function generateUserPrompt(contextSummary, targetBlueprint, count, existingCards, config) {
    const chunkSize = config?.chunk_size || 5;
    const actualCount = Math.min(count, chunkSize); // Respect chunk size limit
    return `Generate exactly ${actualCount} ${targetBlueprint} cards based on the following context.

IMPORTANT: You must return a JSON array containing exactly ${actualCount} card objects. Start your response with '[' and end with ']'.

## Context Summary:
${contextSummary}

## Existing ${targetBlueprint} Cards (avoid duplication):
${existingCards.filter((c) => c.cardType === targetBlueprint).map((c) => `- ${c.title}`).join('\n') || 'None'}

## Requirements:
1. Generate exactly ${actualCount} unique cards (no more, no less)
2. Each card must be actionable and specific
3. No duplicate titles or content
4. Cards should build on the context provided
5. Return as a JSON array: [card1, card2, card3${actualCount > 3 ? ', ...' : ''}]

Example format for ${actualCount} cards:
[
  {
    "title": "First ${targetBlueprint} Card Title",
    "description": "Clear description of this card's purpose and value",
    "priority": "high",
    "blueprintFields": { ... }
  },
  {
    "title": "Second ${targetBlueprint} Card Title", 
    "description": "Clear description of this card's purpose and value",
    "priority": "medium",
    "blueprintFields": { ... }
  }${actualCount > 2 ? `,
  {
    "title": "Third ${targetBlueprint} Card Title",
    "description": "Clear description of this card's purpose and value", 
    "priority": "medium",
    "blueprintFields": { ... }
  }` : ''}${actualCount > 3 ? '\n  // ... continue for all ' + actualCount + ' cards' : ''}
]`;
}
export const strategyCreatorTools = [
    {
        name: 'generate_universal_executive_summary',
        description: 'Generate executive summary using universal prompt that detects blueprint type',
        inputSchema: {
            type: 'object',
            properties: {
                cards: {
                    type: 'array',
                    description: 'Array of cards to analyze',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            card_type: { type: 'string' },
                            card_data: { type: 'object' }
                        }
                    }
                },
                blueprint_type: {
                    type: 'string',
                    description: 'Blueprint type hint (optional)'
                }
            },
            required: ['cards']
        }
    },
    {
        name: 'generate_context_summary',
        description: 'Generate comprehensive context summary from blueprint and intelligence cards',
        inputSchema: {
            type: 'object',
            properties: {
                blueprintCards: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            cardType: { type: 'string' },
                            blueprintFields: { type: 'object' }
                        }
                    }
                },
                intelligenceCards: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            category: { type: 'string' },
                            keyFindings: { type: 'array', items: { type: 'string' } },
                            relevanceScore: { type: 'number' }
                        }
                    }
                },
                intelligenceGroups: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            cardCount: { type: 'number' }
                        }
                    }
                },
                strategyName: { type: 'string' }
            },
            required: ['blueprintCards', 'intelligenceCards']
        }
    },
    {
        name: 'generate_strategy_cards',
        description: 'Generate strategy cards based on comprehensive context',
        inputSchema: {
            type: 'object',
            properties: {
                contextSummary: { type: 'string' },
                targetBlueprint: { type: 'string' },
                generationOptions: {
                    type: 'object',
                    properties: {
                        count: { type: 'number' },
                        style: { type: 'string' } // 'comprehensive', 'focused', 'innovative'
                    }
                },
                existingCards: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string' },
                            cardType: { type: 'string' }
                        }
                    }
                },
                preview_only: {
                    type: 'boolean',
                    description: 'Generate context preview instead of cards'
                }
            },
            required: ['contextSummary', 'targetBlueprint']
        }
    }
];
export async function handleGenerateUniversalExecutiveSummary(args) {
    try {
        const { cards, blueprint_type } = args;
        const systemPrompt = `You are an expert strategic analyst. Analyze the provided cards to automatically detect the blueprint type and generate a focused 3-5 bullet point executive summary.

**Detection Process:**
First, identify the blueprint type from the card content, titles, and field patterns. Blueprint types include: Strategic Context, Vision Statement, Value Proposition, Strategic Bet, Personas, Customer Journey, SWOT Analysis, Competitive Analysis, Market Insight, Experiment, OKRs, Problem Statement, Workstream, Epic, Feature, Business Model, Go-to-Market, GTM Play, Risk Assessment, Roadmap, User Journey, Experience Section, Service Blueprint, Organizational Capability, Tech Stack, Technical Requirement, Cost Driver, Revenue Driver, KPIs, and Financial Projections.

**Summary Framework by Type:**

**Strategy & Vision**: Focus on strategic landscape, competitive positioning, stakeholder considerations, vision scope/timeline, value creation, and differentiation.

**Research & Analysis**: Emphasize user insights, market forces, competitive dynamics, SWOT implications, personas' goals/pain points, journey stages, and improvement opportunities.

**Planning & Execution**: Highlight objectives, success criteria, timelines, ownership, dependencies, feature outcomes, business model mechanics, and go-to-market approach.

**Organizational & Technical**: Cover capability gaps, technical architecture, system requirements, tool justifications, implementation constraints, and strategic alignment.

**Measurement & Financial**: Detail metrics definitions, targets, revenue/cost drivers, scaling potential, financial projections, and performance visibility.

**Output Requirements:**
- Generate exactly 3-5 bullet points
- Each bullet should be specific, actionable, and grounded in card data
- Avoid generic statements; extract real insights
- Maintain strategic perspective while being tactically relevant
- Use clear, executive-level language
- Ensure bullets reflect meaningful insights that guide decision-making

**Format:**
Start with the detected blueprint type, then provide the summary bullets. Each bullet should capture strategic implications, not just descriptions. Focus on what stakeholders need to know to make informed decisions and understand strategic direction.`;
        const userPrompt = `Analyze these ${cards.length} cards${blueprint_type ? ` from the ${blueprint_type} blueprint` : ''}:

${cards.map((card, i) => `
Card ${i + 1}: ${card.title || 'Untitled'}
Description: ${card.description || 'No description'}
Type: ${card.card_type || 'Unknown'}
${card.card_data ? `Data: ${JSON.stringify(card.card_data, null, 2)}` : ''}
`).join('')}

Generate a JSON response with:
{
  "detected_blueprint": "Blueprint Type Name",
  "themes": ["theme 1", "theme 2", "theme 3"],
  "implications": ["implication 1", "implication 2"], 
  "nextSteps": ["step 1", "step 2"],
  "summary": "Overall strategic narrative"
}`;
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
                        metadata: {
                            blueprint_type: blueprint_type || 'auto-detect',
                            card_count: cards.length
                        }
                    })
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                }
            ],
            isError: true
        };
    }
}
export async function handleGenerateContextSummary(args) {
    try {
        const { blueprintCards, intelligenceCards, strategyName } = args;
        const systemPrompt = `You are a strategic planning expert. Analyze the provided blueprint cards and intelligence cards to create a comprehensive context summary for AI-powered strategy generation.

Your summary should:
1. Synthesize key insights from both blueprint and intelligence cards
2. Identify strategic patterns and opportunities
3. Highlight critical constraints and challenges
4. Provide actionable context for generating new strategy cards

Format the summary with clear sections and bullet points for readability.`;
        // Group blueprint cards by type
        const blueprintsByType = blueprintCards.reduce((acc, card) => {
            if (!acc[card.cardType])
                acc[card.cardType] = [];
            acc[card.cardType].push(card);
            return acc;
        }, {});
        // Group intelligence cards by category
        const intelligenceByCategory = intelligenceCards.reduce((acc, card) => {
            if (!acc[card.category])
                acc[card.category] = [];
            acc[card.category].push(card);
            return acc;
        }, {});
        const userPrompt = `Generate a comprehensive context summary for the strategy: "${strategyName || 'Unnamed Strategy'}"

## Blueprint Cards Analysis (${blueprintCards.length} cards)
${Object.entries(blueprintsByType).map(([type, cards]) => `
### ${type} (${cards.length} cards)
${cards.map((card) => `- **${card.title}**: ${card.description}`).join('\n')}
`).join('\n')}

## Intelligence Cards Analysis (${intelligenceCards.length} cards)
${Object.entries(intelligenceByCategory).map(([category, cards]) => `
### ${category} (${cards.length} cards)
${cards.map((card) => `- **${card.title}** (Relevance: ${card.relevanceScore}/10)
  Key Findings: ${card.keyFindings?.slice(0, 3).join('; ')}`).join('\n')}
`).join('\n')}

Create a strategic context summary that:
1. Identifies the core strategic themes
2. Highlights key opportunities and challenges
3. Notes important constraints and dependencies
4. Suggests focus areas for new card generation
5. Provides a cohesive narrative connecting all insights`;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        prompts: {
                            system: systemPrompt,
                            user: userPrompt
                        }
                    })
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                }
            ],
            isError: true
        };
    }
}
export async function handleGenerateStrategyCards(args) {
    console.log('🎯 MCP handleGenerateStrategyCards called with:', {
        targetBlueprint: args.targetBlueprint,
        preview_only: args.preview_only,
        count: args.generationOptions?.count,
        cardIndex: args.cardIndex
    });
    try {
        const { contextSummary, targetBlueprint, generationOptions = {}, existingCards = [], preview_only = false, cardIndex } = args;
        const { count = 3, style = 'comprehensive' } = generationOptions;
        // If preview_only is true, generate context preview instead of cards
        if (preview_only) {
            console.log('📋 Generating preview for:', targetBlueprint);
            return generateContextPreview(contextSummary, targetBlueprint, existingCards);
        }
        // Get dynamic field definitions for the blueprint type
        const fieldDefinitions = await getBlueprintFields(targetBlueprint);
        console.log('📋 Dynamic field definitions retrieved for:', targetBlueprint);
        console.log('🔍 Attempting to fetch database prompt...');
        // Try to get system prompt from database
        const dbPrompt = await getSystemPrompt('blueprint', targetBlueprint);
        // Determine if we're generating a single card or multiple
        const isSingleCardGeneration = cardIndex !== undefined && cardIndex > 0;
        if (dbPrompt) {
            console.log(`✅ Using database prompt for ${targetBlueprint}: ${dbPrompt.prompt_name}`);
            // Use Card Creator specific fields
            const config = dbPrompt.card_creator_config || {
                max_tokens: dbPrompt.max_tokens || 4000,
                chunk_size: 5,
                temperature: dbPrompt.temperature || 0.7
            };
            // Use generation_prompt if available, fallback to preview_prompt
            const generationPrompt = dbPrompt.generation_prompt || dbPrompt.preview_prompt;
            // Generate appropriate user prompt based on single vs multiple card generation
            const userPrompt = isSingleCardGeneration
                ? generateSingleCardPrompt(contextSummary, targetBlueprint, fieldDefinitions, cardIndex, existingCards)
                : generateUserPrompt(contextSummary, targetBlueprint, count, existingCards, config);
            console.log('📝 Generated user prompt for', isSingleCardGeneration ? `single card #${cardIndex}` : `${count} cards`);
            console.log(userPrompt);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            prompts: {
                                system: generationPrompt,
                                user: userPrompt
                            },
                            config: config,
                            isSingleCard: isSingleCardGeneration
                        })
                    }
                ]
            };
        }
        else {
            console.log('⚠️  No database prompt found, using fallback prompts');
        }
        // Get blueprint configuration
        const blueprintConfigs = {
            'vision': {
                fields: ['visionStatement', 'timeHorizon', 'successMetrics'],
                focus: 'long-term aspirational goals and measurable outcomes'
            },
            'strategic-context': {
                fields: ['marketEnvironment', 'competitiveLandscape', 'internalCapabilities'],
                focus: 'current situation analysis and strategic positioning'
            },
            'value-proposition': {
                fields: ['targetCustomer', 'painPoints', 'uniqueValue', 'differentiation'],
                focus: 'customer needs and unique value delivery'
            },
            'personas': {
                fields: ['demographics', 'behaviors', 'needs', 'painPoints', 'goals'],
                focus: 'detailed user profiles and behavioral patterns'
            },
            'okrs': {
                fields: ['objective', 'keyResults', 'timeframe', 'owner'],
                focus: 'measurable objectives and key results'
            },
            'business-model': {
                fields: ['revenueStreams', 'costStructure', 'keyActivities', 'keyResources'],
                focus: 'how the business creates and captures value'
            },
            'go-to-market': {
                fields: ['channels', 'messaging', 'pricing', 'launchPlan'],
                focus: 'market entry and growth strategies'
            }
        };
        const blueprintConfig = blueprintConfigs[targetBlueprint] || {
            fields: [],
            focus: 'strategic planning and execution'
        };
        const styleGuides = {
            'comprehensive': 'Provide detailed, thorough analysis with multiple perspectives',
            'focused': 'Be concise and action-oriented, focusing on key insights',
            'innovative': 'Think creatively and suggest unconventional approaches'
        };
        const systemPrompt = `You are a strategic planning expert specializing in ${targetBlueprint} blueprint cards. 
Generate high-quality strategy cards that are:
1. Directly relevant to the context summary
2. Actionable and specific
3. Aligned with the ${style} generation style: ${styleGuides[style]}
4. Complementary to existing cards without duplication

Each card should have comprehensive blueprint-specific fields that provide real value.`;
        // Generate appropriate user prompt based on single vs multiple card generation
        let userPrompt;
        if (isSingleCardGeneration) {
            userPrompt = generateSingleCardPrompt(contextSummary, targetBlueprint, fieldDefinitions, cardIndex, existingCards);
        }
        else {
            userPrompt = `Generate exactly ${count} ${targetBlueprint} cards based on the following strategic context.

IMPORTANT: You must return a JSON array containing exactly ${count} card objects. Start your response with '[' and end with ']'.

## Context Summary:
${contextSummary}

## Existing ${targetBlueprint} Cards (avoid duplication):
${existingCards.filter((c) => c.cardType === targetBlueprint).map((c) => `- ${c.title}`).join('\n') || 'None'}

## Blueprint Focus:
Generate cards focusing on: ${blueprintConfig.focus}

## Required Output Format:
Return a JSON array with exactly ${count} card objects. Example:
[
  {
    "title": "Clear, actionable title for card 1",
    "description": "2-3 sentence description of the card's purpose and value",
    "priority": "high",
    "confidence": {
      "level": "high",
      "rationale": "Brief explanation of confidence level"
    },
    "keyPoints": ["3-5 key insights or action items"],
    "blueprintFields": {
${fieldDefinitions.split('\n').map(line => {
                const match = line.match(/- (\w+): .* \[.*\] - (.*) - Example: (.*)$/);
                if (match) {
                    const fieldId = match[1];
                    const description = match[2];
                    const example = match[3];
                    return `      "${fieldId}": ${example} // ${description}`;
                }
                return '';
            }).filter(Boolean).join(',\n')}
    },
    "tags": ["relevant", "tags"],
    "relationships": ["Related card titles or concepts"],
    "implementation": {
      "timeline": "Suggested timeline",
      "dependencies": ["Key dependencies"],
      "successCriteria": ["Measurable success criteria"]
    }
  },
  {
    "title": "Clear, actionable title for card 2",
    "description": "2-3 sentence description of the card's purpose and value",
    "priority": "medium",
    // ... same structure as above
  }${count > 2 ? `,
  // ... continue for all ${count} cards` : ''}
]

Ensure you generate exactly ${count} unique, valuable, and actionable cards.`;
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        prompts: {
                            system: systemPrompt,
                            user: userPrompt
                        }
                    })
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                }
            ],
            isError: true
        };
    }
} // Generate context preview for Card Creator
export async function generateContextPreview(contextSummary, targetBlueprint, existingCards) {
    try {
        // Try to get system prompt from database  
        const dbPrompt = await getSystemPrompt('blueprint', targetBlueprint);
        if (dbPrompt) {
            console.log(`Using database prompt for preview: ${targetBlueprint}`);
            // For preview, use a simple prompt that provides the context
            const userPrompt = `Analyze the following strategic context and existing cards:

## Strategic Context:
${contextSummary}

## Existing ${targetBlueprint} Cards (${existingCards.filter(c => c.cardType === targetBlueprint).length}):
${existingCards.filter(c => c.cardType === targetBlueprint).map(c => `- ${c.title}: ${c.description || 'No description'}`).join('\n') || 'None yet'}

Provide your analysis based on the above context.`;
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            preview: true,
                            prompts: {
                                system: dbPrompt.preview_prompt || dbPrompt.generation_prompt,
                                user: userPrompt
                            },
                            metadata: {
                                targetBlueprint,
                                existingCardsCount: existingCards.filter(c => c.cardType === targetBlueprint).length,
                                contextLength: contextSummary.length
                            }
                        })
                    }
                ]
            };
        }
        // Get blueprint configuration for focus area
        const blueprintConfigs = {
            'vision': {
                focus: 'long-term aspirational goals and measurable outcomes',
                lens: 'strategic direction, market positioning, and future aspirations'
            },
            'strategic-context': {
                focus: 'current situation analysis and strategic positioning',
                lens: 'market environment, competitive landscape, and internal capabilities'
            },
            'value-proposition': {
                focus: 'customer needs and unique value delivery',
                lens: 'target customers, pain points, and differentiation opportunities'
            },
            'swot': {
                focus: 'strengths, weaknesses, opportunities, and threats',
                lens: 'internal capabilities and external market factors'
            },
            'technical-requirement': {
                focus: 'technical specifications, constraints, and implementation details',
                lens: 'system requirements, technical dependencies, and architectural considerations'
            },
            'feature': {
                focus: 'product features and user capabilities',
                lens: 'user needs, functional requirements, and feature prioritization'
            },
            'personas': {
                focus: 'detailed user profiles and behavioral patterns',
                lens: 'user demographics, behaviors, needs, and goals'
            },
            'okrs': {
                focus: 'measurable objectives and key results',
                lens: 'strategic objectives, success metrics, and accountability'
            },
            'business-model': {
                focus: 'how the business creates and captures value',
                lens: 'revenue streams, cost structure, and value creation'
            },
            'go-to-market': {
                focus: 'market entry and growth strategies',
                lens: 'target markets, channels, and competitive positioning'
            }
        };
        const blueprintConfig = blueprintConfigs[targetBlueprint] || {
            focus: 'strategic planning and execution',
            lens: 'key insights and strategic opportunities'
        };
        const systemPrompt = `You are a strategic analyst helping users understand how their source material will be interpreted for generating ${targetBlueprint} cards.

Your task is to preview how the AI will analyze and use the provided context to generate new cards. Write a clear, informative 2-3 paragraph preview that:

1. Explains how the source material relates to ${targetBlueprint} cards
2. Highlights the key themes and insights that will guide card generation
3. Indicates what aspects of the source material are most relevant
4. Sets appropriate expectations for the types of cards that will be generated

Focus specifically on: ${blueprintConfig.focus}
Analyze through the lens of: ${blueprintConfig.lens}

Write in a conversational, helpful tone that gives users confidence in the generation process.`;
        const userPrompt = `Analyze the following strategic context and existing cards:

## Strategic Context:
${contextSummary}

## Existing ${targetBlueprint} Cards (${existingCards.filter(c => c.cardType === targetBlueprint).length}):
${existingCards.filter(c => c.cardType === targetBlueprint).map(c => `- ${c.title}: ${c.description || 'No description'}`).join('\n') || 'None yet'}

Based on this context, provide strategic insights and recommendations for creating ${targetBlueprint} cards.`;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        preview: true,
                        prompts: {
                            system: systemPrompt,
                            user: userPrompt
                        },
                        metadata: {
                            targetBlueprint,
                            existingCardsCount: existingCards.filter(c => c.cardType === targetBlueprint).length,
                            contextLength: contextSummary.length
                        }
                    })
                }
            ]
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message
                    })
                }
            ],
            isError: true
        };
    }
}
//# sourceMappingURL=strategy-creator-tools.js.map