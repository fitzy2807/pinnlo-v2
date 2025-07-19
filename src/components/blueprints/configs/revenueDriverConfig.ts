import { BlueprintConfig } from '../types'

export const revenueDriverConfig: BlueprintConfig = {
  id: 'revenueDriver',
  name: 'Revenue Driver',
  description: 'Identify and track revenue opportunities and growth factors',
  category: 'Measurement',
  icon: '💰',
  fields: [
    {
      id: 'revenueType',
      name: 'Revenue Type',
      type: 'enum',
      required: true,
      options: ['Subscription', 'One-Time', 'Transaction-based', 'Advertising', 'Commission', 'Licensing', 'Services', 'Other'],
      description: 'What type of revenue model is this?'
    },
    {
      id: 'revenueDescription',
      name: 'Revenue Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe this revenue opportunity',
      description: 'Detailed description of the revenue source'
    },
    {
      id: 'estimatedRevenue',
      name: 'Estimated Revenue',
      type: 'number',
      required: true,
      placeholder: 'Annual revenue potential',
      description: 'Estimated annual revenue potential (in your currency)'
    },
    {
      id: 'revenueFrequency',
      name: 'Revenue Frequency',
      type: 'enum',
      required: true,
      options: ['One-time', 'Monthly', 'Quarterly', 'Annual', 'Per-transaction', 'Per-user'],
      description: 'How often does this revenue occur?'
    },
    {
      id: 'scalingPotential',
      name: 'Scaling Potential',
      type: 'textarea',
      required: true,
      placeholder: 'How can this revenue scale?',
      description: 'How this revenue can grow with business scaling'
    },
    {
      id: 'targetMarket',
      name: 'Target Market',
      type: 'text',
      required: true,
      placeholder: 'Who will pay for this?',
      description: 'Target customer segment for this revenue'
    },
    {
      id: 'assumptions',
      name: 'Key Assumptions',
      type: 'array',
      required: true,
      description: 'Critical assumptions underlying this revenue projection'
    },
    {
      id: 'validationStatus',
      name: 'Validation Status',
      type: 'enum',
      required: false,
      options: ['Not Validated', 'Partially Validated', 'Validated', 'Proven'],
      description: 'How validated is this revenue opportunity?'
    },
    {
      id: 'implementationEffort',
      name: 'Implementation Effort',
      type: 'enum',
      required: false,
      options: ['Low', 'Medium', 'High', 'Very High'],
      description: 'Effort required to implement this revenue stream'
    },
    {
      id: 'timeline',
      name: 'Implementation Timeline',
      type: 'text',
      required: false,
      placeholder: 'When can this revenue be realized?',
      description: 'Timeline for implementing this revenue opportunity'
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'array',
      required: false,
      description: 'What must be in place for this revenue to be realized?'
    },
    {
      id: 'risks',
      name: 'Revenue Risks',
      type: 'array',
      required: false,
      description: 'Risks that could prevent this revenue from materializing'
    }
  ],
  defaultValues: {
    revenueType: 'Subscription',
    revenueDescription: '',
    estimatedRevenue: 0,
    revenueFrequency: 'Annual',
    scalingPotential: '',
    targetMarket: '',
    assumptions: [],
    validationStatus: 'Not Validated',
    implementationEffort: 'Medium',
    timeline: '',
    dependencies: [],
    risks: []
  },
  validation: {
    required: ['revenueType', 'revenueDescription', 'estimatedRevenue', 'revenueFrequency', 'scalingPotential', 'targetMarket', 'assumptions']
  },
  relationships: {
    linkedBlueprints: ['financial-projections', 'cost-driver', 'value-proposition', 'gtm-play'],
    requiredBlueprints: ['strategic-context']
  }
}