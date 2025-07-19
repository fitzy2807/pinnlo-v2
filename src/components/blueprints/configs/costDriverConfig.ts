import { BlueprintConfig } from '../types'

export const costDriverConfig: BlueprintConfig = {
  id: 'costDriver',
  name: 'Cost Driver',
  description: 'Analyze and track major cost factors and their scaling impact',
  category: 'Measurement',
  icon: '💸',
  fields: [
    {
      id: 'costType',
      name: 'Cost Type',
      type: 'enum',
      required: true,
      options: ['Build', 'Operations', 'People', 'Licensing', 'Infrastructure', 'Marketing', 'Compliance', 'Maintenance'],
      description: 'What category of cost is this?'
    },
    {
      id: 'costDescription',
      name: 'Cost Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe this cost driver in detail',
      description: 'Detailed description of what drives this cost'
    },
    {
      id: 'estimatedCost',
      name: 'Estimated Cost',
      type: 'number',
      required: true,
      placeholder: 'Annual cost estimate',
      description: 'Estimated annual cost (in your currency)'
    },
    {
      id: 'costFrequency',
      name: 'Cost Frequency',
      type: 'enum',
      required: true,
      options: ['One-time', 'Monthly', 'Quarterly', 'Annual', 'Per-user', 'Per-transaction'],
      description: 'How often does this cost occur?'
    },
    {
      id: 'scalingImpact',
      name: 'Scaling Impact',
      type: 'textarea',
      required: true,
      placeholder: 'How does this cost change as we scale?',
      description: 'How this cost behaves as the business grows'
    },
    {
      id: 'costOwner',
      name: 'Cost Owner',
      type: 'text',
      required: true,
      placeholder: 'Team or person responsible',
      description: 'Who owns and manages this cost?'
    },
    {
      id: 'mitigationOptions',
      name: 'Cost Mitigation Options',
      type: 'array',
      required: false,
      description: 'Ways to reduce or optimize this cost'
    },
    {
      id: 'businessImpact',
      name: 'Business Impact',
      type: 'textarea',
      required: false,
      placeholder: 'How does this cost impact business outcomes?',
      description: 'Impact on business performance and profitability'
    },
    {
      id: 'trackingMethod',
      name: 'Tracking Method',
      type: 'text',
      required: false,
      placeholder: 'How is this cost tracked and measured?',
      description: 'Method for monitoring and tracking this cost'
    },
    {
      id: 'optimizationPlan',
      name: 'Optimization Plan',
      type: 'textarea',
      required: false,
      placeholder: 'Plan for optimizing this cost over time',
      description: 'Strategy for managing and optimizing this cost'
    }
  ],
  defaultValues: {
    costType: 'Operations',
    costDescription: '',
    estimatedCost: 0,
    costFrequency: 'Annual',
    scalingImpact: '',
    costOwner: '',
    mitigationOptions: [],
    businessImpact: '',
    trackingMethod: '',
    optimizationPlan: ''
  },
  validation: {
    required: ['costType', 'costDescription', 'estimatedCost', 'costFrequency', 'scalingImpact', 'costOwner']
  },
  relationships: {
    linkedBlueprints: ['financial-projections', 'revenue-driver', 'roadmap'],
    requiredBlueprints: ['strategic-context']
  }
}