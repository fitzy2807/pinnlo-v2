import { BlueprintConfig } from '../types'

export const organisationalCapabilityConfig: BlueprintConfig = {
  id: 'organisationalCapabilities',
  name: 'Organisational Capability',
  description: 'Assess and plan organizational capabilities needed for strategy execution',
  category: 'Management',
  icon: '🏗️',
  fields: [
    {
      id: 'capabilityArea',
      name: 'Capability Area',
      type: 'text',
      required: true,
      placeholder: 'e.g., Data Analytics, Customer Service, Product Development',
      description: 'What capability area does this address?'
    },
    {
      id: 'capabilityType',
      name: 'Capability Type',
      type: 'enum',
      required: true,
      options: ['Technical', 'Process', 'People', 'Cultural', 'Systems', 'Knowledge'],
      description: 'What type of organizational capability is this?'
    },
    {
      id: 'maturityLevel',
      name: 'Current Maturity Level',
      type: 'enum',
      required: true,
      options: ['Low', 'Medium', 'High', 'Excellent'],
      description: 'Current organizational maturity in this capability'
    },
    {
      id: 'targetMaturityLevel',
      name: 'Target Maturity Level',
      type: 'enum',
      required: true,
      options: ['Low', 'Medium', 'High', 'Excellent'],
      description: 'Desired maturity level for this capability'
    },
    {
      id: 'requiredToDeliver',
      name: 'Required to Deliver',
      type: 'textarea',
      required: true,
      placeholder: 'What strategic outcomes require this capability?',
      description: 'How this capability supports strategy delivery'
    },
    {
      id: 'currentGap',
      name: 'Current Gap',
      type: 'textarea',
      required: true,
      placeholder: 'What is missing or needs improvement?',
      description: 'Gap between current and required capability level'
    },
    {
      id: 'developmentPlan',
      name: 'Development Plan',
      type: 'textarea',
      required: false,
      placeholder: 'How will we build this capability?',
      description: 'Plan for developing this capability'
    },
    {
      id: 'owners',
      name: 'Capability Owners',
      type: 'array',
      required: true,
      description: 'Teams or individuals responsible for this capability'
    },
    {
      id: 'timeline',
      name: 'Development Timeline',
      type: 'text',
      required: false,
      placeholder: 'e.g., 6 months, Q2 2024',
      description: 'Timeline for capability development'
    },
    {
      id: 'successMetrics',
      name: 'Success Metrics',
      type: 'array',
      required: false,
      description: 'How will we measure capability improvement?'
    }
  ],
  defaultValues: {
    capabilityArea: '',
    capabilityType: 'Process',
    maturityLevel: 'Low',
    targetMaturityLevel: 'High',
    requiredToDeliver: '',
    currentGap: '',
    developmentPlan: '',
    owners: [],
    timeline: '',
    successMetrics: []
  },
  validation: {
    required: ['capabilityArea', 'capabilityType', 'maturityLevel', 'targetMaturityLevel', 'requiredToDeliver', 'currentGap', 'owners']
  },
  relationships: {
    linkedBlueprints: ['okrs', 'workstream', 'roadmap'],
    requiredBlueprints: ['strategic-context']
  }
}