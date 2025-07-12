/**
 * Tech Stack Tools for MCP Server
 * Generates comprehensive technical documentation for technologies
 */

export const techStackTools = {
  /**
   * Generate comprehensive tech stack component information
   */
  generate_tech_stack_component: {
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
    },
    handler: async ({ technology_name, category, existing_stack = [], company_context = {} }) => {
      // Build context about existing stack
      const stackContext = existing_stack.length > 0 
        ? `Current tech stack includes: ${existing_stack.map(t => `${t.technology_name} (${t.category})`).join(', ')}.`
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

Return a JSON object with the following structure and detailed information:

{
  "description": "A clear, concise description of what this technology is and its primary purpose (2-3 sentences)",
  
  "vendor": "The company or organization that maintains this technology",
  
  "version_current": "The latest stable version number (be specific, e.g., '18.2.0' not just '18')",
  
  "license_type": "The software license (e.g., MIT, Apache 2.0, Proprietary)",
  
  "language_ecosystem": "Primary programming language or ecosystem (e.g., JavaScript, Python, Java)",
  
  "primary_functions": [
    "List 4-6 core capabilities this technology provides",
    "Be specific about what problems it solves",
    "Focus on unique features that differentiate it"
  ],
  
  "technical_specifications": {
    "performance_characteristics": "Describe performance capabilities, benchmarks, and limits (e.g., requests/second, memory usage)",
    "scalability_limits": "Explain horizontal/vertical scaling capabilities and practical limits",
    "resource_requirements": "Minimum and recommended CPU, memory, storage requirements",
    "security_features": ["Built-in security features", "Compliance certifications", "Security best practices"]
  },
  
  "our_implementation": {
    "version_used": "Recommend which version to use for production (might be different from latest)",
    "key_features_enabled": ["List features that should be enabled for most use cases", "Include security features"],
    "custom_configurations": ["Important configuration changes from defaults", "Performance tuning recommendations"],
    "performance_optimizations": ["Specific optimizations for production use", "Caching strategies", "Connection pooling"]
  },
  
  "integration_capabilities": {
    "apis_supported": ["REST", "GraphQL", "gRPC", "WebSocket", etc.],
    "data_formats": ["JSON", "XML", "Protocol Buffers", etc.],
    "authentication_methods": ["OAuth2", "JWT", "API Keys", "SAML", etc.],
    "communication_patterns": ["Synchronous", "Asynchronous", "Event-driven", "Pub/Sub"]
  },
  
  "our_integrations": {
    "connects_to": ["List specific technologies it commonly integrates with from the ${category} ecosystem"],
    "data_flow_patterns": ["Request/Response", "Streaming", "Batch", "Real-time"],
    "authentication_implementation": "Recommended auth approach for this technology",
    "error_handling_strategy": "Best practices for error handling and recovery"
  },
  
  "development_patterns": {
    "build_tools": ["Common build tools used with this technology"],
    "testing_frameworks": ["Recommended testing tools and frameworks"],
    "deployment_targets": ["Where this typically runs: Cloud, On-premise, Edge, Containers"]
  },
  
  "our_workflow": {
    "build_process": "Typical build process and tools (e.g., 'npm run build with Webpack')",
    "testing_approach": "Recommended testing strategy (unit, integration, e2e)",
    "deployment_method": "Common deployment approach (e.g., 'Docker containers on Kubernetes')",
    "ci_cd_integration": "How to integrate with CI/CD pipelines"
  },
  
  "dependencies": {
    "runtime_dependencies": ["Critical runtime dependencies and versions"],
    "development_dependencies": ["Key development dependencies"],
    "peer_dependencies": ["Technologies that must be present but not directly installed"]
  },
  
  "ecosystem_compatibility": {
    "works_with": ["Other technologies it integrates well with"],
    "common_libraries": ["Popular libraries in this ecosystem"]
  },
  
  "performance_features": {
    "optimization_techniques": ["Specific performance optimization methods"],
    "monitoring_options": ["APM tools, metrics libraries, profiling tools"],
    "caching_strategies": ["Built-in caching capabilities and recommendations"]
  },
  
  "security_capabilities": {
    "built_in_protections": ["Security features included out of the box"],
    "secure_coding_practices": ["Security best practices specific to this technology"],
    "vulnerability_scanning": "Recommended security scanning tools"
  },
  
  "common_issues": {
    "typical_problems": ["List 3-5 common issues developers face with this technology"],
    "debugging_tools": ["Tools and techniques for debugging"],
    "community_resources": ["Stack Overflow tags", "Discord/Slack communities", "Forums"]
  },
  
  "our_support": {
    "documentation_location": "Where internal documentation should be stored",
    "internal_expertise": ["Roles that should have expertise (e.g., 'Senior Frontend Engineers')"],
    "escalation_path": "Who to contact for complex issues",
    "known_issues": "Any known issues specific to our environment"
  },
  
  "implementation_guidance": {
    "typical_tasks": ["Common implementation tasks", "Configuration steps", "Integration patterns"],
    "code_patterns": {
      "initialization": "Basic setup code example",
      "common_usage": "Most frequent usage pattern"
    },
    "quality_requirements": {
      "code_coverage": "Recommended test coverage percentage",
      "performance_benchmarks": "Key metrics to monitor"
    }
  },
  
  "strategic_alignment": "How this technology aligns with modern ${category} architecture patterns and where the industry is heading",
  
  "priority_rationale": "Why this technology should be considered ${existing_stack.length > 10 ? 'High' : 'Medium'} priority in the stack",
  
  "confidence_rationale": "Level of industry adoption and maturity of this technology"
}

Ensure all information is accurate, practical, and based on real-world usage. Focus on actionable insights that developers can immediately use.`;

      // Return structured response for MCP
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
  },

  /**
   * Analyze tech stack for completeness and recommendations
   */
  analyze_tech_stack: {
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
    },
    handler: async ({ components, project_type = "Web Application" }) => {
      // Analyze current stack
      const categories = [...new Set(components.map(c => c.category))];
      const missingCategories = ["Frontend", "Backend", "Database", "DevOps", "Security"]
        .filter(cat => !categories.includes(cat));

      const systemPrompt = `You are a technical architect analyzing a technology stack for a ${project_type}. Provide strategic recommendations based on industry best practices and modern architecture patterns.`;

      const userPrompt = `Analyze this tech stack and provide recommendations:

Current Stack:
${components.map(c => `- ${c.technology_name} (${c.category}) - ${c.implementation_status}`).join('\n')}

Missing Categories: ${missingCategories.join(', ') || 'None'}

Provide a JSON response with:
{
  "stack_assessment": {
    "completeness_score": 0-100,
    "maturity_level": "Basic|Intermediate|Advanced|Enterprise",
    "strengths": ["List key strengths of current stack"],
    "gaps": ["List missing components or capabilities"],
    "risks": ["Technical debt or security risks"]
  },
  "recommendations": {
    "immediate_needs": [
      {
        "category": "Category name",
        "suggestion": "Specific technology recommendation",
        "reason": "Why this is needed"
      }
    ],
    "future_considerations": ["Technologies to consider as you scale"],
    "deprecation_candidates": ["Technologies that should be phased out"]
  },
  "integration_opportunities": ["Ways to better integrate existing components"],
  "security_recommendations": ["Security improvements needed"],
  "performance_optimizations": ["Performance improvements possible"]
}`;

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
  }
};