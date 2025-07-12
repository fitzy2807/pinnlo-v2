// TRD Generation Steps Configuration
export const TRD_STEPS = [
  {
    id: 'business-context',
    name: 'Business Context Analysis',
    dependencies: [],
    systemPrompt: `You are a business analyst. Extract strategic objectives and success metrics from features.`,
    fields: ['businessContext']
  },
  {
    id: 'system-architecture',
    name: 'System Architecture Design',
    dependencies: ['business-context'],
    systemPrompt: `You are a solutions architect. Design high-level system architecture and technology stack.`,
    fields: ['systemArchitecture']
  },
  {
    id: 'functional-requirements',
    name: 'Functional Requirements',
    dependencies: ['business-context'],
    systemPrompt: `You are a requirements engineer. Break features into detailed functional requirements.`,
    fields: ['functionalRequirements']
  },
  {
    id: 'data-architecture',
    name: 'Data Architecture & APIs',
    dependencies: ['system-architecture', 'functional-requirements'],
    systemPrompt: `You are a data architect. Design database schemas and API specifications.`,
    fields: ['dataModel', 'apiSpecifications']
  },
  {
    id: 'security-performance',
    name: 'Security & Performance',
    dependencies: ['system-architecture'],
    systemPrompt: `You are a security architect. Define security and performance requirements.`,
    fields: ['securityRequirements', 'performanceRequirements']
  }
];

export function generateStepPrompt(step, features, previousResults) {
  const featureList = features.map(f => `- ${f.name}: ${f.description}`).join('\n');
  
  const contextFromPrevious = Object.entries(previousResults)
    .map(([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`)
    .join('\n\n');

  return `${step.systemPrompt}

Features to analyze:
${featureList}

${contextFromPrevious ? `Previous analysis results:\n${contextFromPrevious}\n` : ''}

Generate ${step.fields.join(', ')} for these features. Return as structured JSON.
Focus only on ${step.name.toLowerCase()} - be specific and actionable.
Maximum 1000 tokens.`;
}
