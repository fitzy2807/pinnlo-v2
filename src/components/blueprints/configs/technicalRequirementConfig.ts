import { BlueprintConfig } from '../types'

export const technicalRequirementConfig: BlueprintConfig = {
  id: 'technical-requirement',
  name: 'Technical Requirement',
  description: 'Define detailed technical specifications and implementation requirements',
  category: 'Planning & Execution',
  icon: '🧠',
  fields: [
    {
      id: 'requirementType',
      name: 'Requirement Type',
      type: 'enum',
      required: true,
      options: ['System Integration', 'API Design', 'Infrastructure', 'Data Flow', 'Security/Compliance', 'Migration', 'Performance Optimization', 'DevOps Tooling', 'Other'],
      description: 'What type of technical requirement is this?'
    },
    {
      id: 'businessNeed',
      name: 'Business Need',
      type: 'textarea',
      required: true,
      placeholder: 'Why is this technical requirement needed?',
      description: 'Business justification for this technical requirement'
    },
    {
      id: 'linkedFeatureIds',
      name: 'Linked Features',
      type: 'array',
      required: false,
      description: 'Features that depend on this technical requirement'
    },
    {
      id: 'functionalDescription',
      name: 'Functional Description',
      type: 'textarea',
      required: true,
      placeholder: 'What should this system/component do?',
      description: 'Detailed functional specification'
    },
    {
      id: 'nonFunctionalRequirements',
      name: 'Non-Functional Requirements',
      type: 'object',
      required: false,
      description: 'Performance, scalability, security, and other NFRs'
    },
    {
      id: 'systemContext',
      name: 'System Context',
      type: 'textarea',
      required: false,
      placeholder: 'How does this fit into the broader system?',
      description: 'Context within the overall system architecture'
    },
    {
      id: 'integrationPoints',
      name: 'Integration Points',
      type: 'array',
      required: false,
      description: 'Systems, APIs, or services this will integrate with'
    },
    {
      id: 'externalDependencies',
      name: 'External Dependencies',
      type: 'array',
      required: false,
      description: 'Third-party services, libraries, or systems required'
    },
    {
      id: 'knownRisks',
      name: 'Known Risks',
      type: 'array',
      required: false,
      description: 'Technical risks and potential issues'
    },
    {
      id: 'teamRequired',
      name: 'Team Required',
      type: 'text',
      required: false,
      placeholder: 'What team skills are needed?',
      description: 'Team composition and skills needed for implementation'
    },
    {
      id: 'engineeringEstimation',
      name: 'Engineering Estimation',
      type: 'text',
      required: false,
      placeholder: 'Development effort estimate',
      description: 'Estimated development time and complexity'
    },
    {
      id: 'implementationPhases',
      name: 'Implementation Phases',
      type: 'object',
      required: false,
      description: 'Phased approach to implementation'
    },
    {
      id: 'testingStrategy',
      name: 'Testing Strategy',
      type: 'textarea',
      required: false,
      placeholder: 'How will this be tested?',
      description: 'Testing approach and quality assurance'
    },
    {
      id: 'definitionOfDone',
      name: 'Definition of Done',
      type: 'array',
      required: false,
      description: 'Criteria that must be met for completion'
    },
    {
      id: 'monitoringAndObservability',
      name: 'Monitoring & Observability',
      type: 'textarea',
      required: false,
      placeholder: 'How will this be monitored in production?',
      description: 'Monitoring, logging, and observability requirements'
    }
  ],
  defaultValues: {
    requirementType: 'Other',
    businessNeed: '',
    linkedFeatureIds: [],
    functionalDescription: '',
    nonFunctionalRequirements: {},
    systemContext: '',
    integrationPoints: [],
    externalDependencies: [],
    knownRisks: [],
    teamRequired: '',
    engineeringEstimation: '',
    implementationPhases: {},
    testingStrategy: '',
    definitionOfDone: [],
    monitoringAndObservability: ''
  },
  validation: {
    required: ['requirementType', 'businessNeed', 'functionalDescription']
  },
  relationships: {
    linkedBlueprints: ['feature', 'tech-stack', 'epic'],
    requiredBlueprints: ['strategic-context']
  }
}