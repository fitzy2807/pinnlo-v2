import { BlueprintConfig } from '../types'

export const businessModelConfig: BlueprintConfig = {
  id: 'business-model',
  name: 'Business Model',
  description: 'Define how your business creates, delivers, and captures value',
  category: 'Planning & Execution',
  icon: 'Building2',
  fields: [
    {
      id: 'modelType',
      name: 'Business Model Type',
      type: 'enum',
      required: true,
      options: ['B2B', 'B2C', 'B2B2C', 'Marketplace', 'Platform', 'Subscription', 'Freemium'],
      description: 'What type of business model is this?'
    },
    {
      id: 'valueProposition',
      name: 'Value Proposition',
      type: 'textarea',
      required: true,
      placeholder: 'What value do you create?',
      description: 'Core value delivered to customers'
    },
    {
      id: 'customerSegments',
      name: 'Customer Segments',
      type: 'array',
      required: true,
      description: 'Who are your target customers?'
    },
    {
      id: 'channels',
      name: 'Channels',
      type: 'array',
      required: true,
      description: 'How do you reach and deliver to customers?'
    },
    {
      id: 'customerRelationships',
      name: 'Customer Relationships',
      type: 'array',
      required: false,
      description: 'What type of relationships do you establish?'
    },
    {
      id: 'revenueStreams',
      name: 'Revenue Streams',
      type: 'array',
      required: true,
      description: 'How do you make money?'
    },
    {
      id: 'keyResources',
      name: 'Key Resources',
      type: 'array',
      required: true,
      description: 'What key resources do you need?'
    },
    {
      id: 'keyActivities',
      name: 'Key Activities',
      type: 'array',
      required: true,
      description: 'What key activities must you perform?'
    },
    {
      id: 'keyPartnerships',
      name: 'Key Partnerships',
      type: 'array',
      required: false,
      description: 'Who are your key partners and suppliers?'
    },
    {
      id: 'costStructure',
      name: 'Cost Structure',
      type: 'array',
      required: true,
      description: 'What are your major costs?'
    }
  ],
  defaultValues: {
    modelType: 'B2B',
    valueProposition: '',
    customerSegments: [],
    channels: [],
    customerRelationships: [],
    revenueStreams: [],
    keyResources: [],
    keyActivities: [],
    keyPartnerships: [],
    costStructure: []
  },
  validation: {
    required: ['modelType', 'valueProposition', 'customerSegments', 'channels', 'revenueStreams', 'keyResources', 'keyActivities', 'costStructure']
  },
  relationships: {
    linkedBlueprints: ['value-proposition', 'financial-projections'],
    requiredBlueprints: ['strategic-context']
  }
}