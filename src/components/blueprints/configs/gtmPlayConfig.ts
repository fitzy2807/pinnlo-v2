import { BlueprintConfig } from '../types'

export const gtmPlayConfig: BlueprintConfig = {
  id: 'gtmPlays',
  name: 'Go-To-Market Play',
  description: 'Define go-to-market strategies and execution plans',
  category: 'Planning & Execution',
  icon: '🚀',
  fields: [
    {
      id: 'playType',
      name: 'GTM Play Type',
      type: 'enum',
      required: true,
      options: ['Product Launch', 'Market Entry', 'Customer Acquisition', 'Expansion', 'Retention'],
      description: 'What type of go-to-market play is this?'
    },
    {
      id: 'targetAudience',
      name: 'Target Audience',
      type: 'textarea',
      required: true,
      placeholder: 'Who are we targeting with this GTM play?',
      description: 'Primary audience for this go-to-market effort'
    },
    {
      id: 'valueProposition',
      name: 'Value Proposition',
      type: 'textarea',
      required: true,
      placeholder: 'What unique value are we offering?',
      description: 'Core value proposition for this GTM play'
    },
    {
      id: 'launchChannels',
      name: 'Launch Channels',
      type: 'array',
      required: true,
      description: 'Channels we will use to reach our audience (digital, events, sales, etc.)'
    },
    {
      id: 'messaging',
      name: 'Key Messaging',
      type: 'textarea',
      required: true,
      placeholder: 'Core messages and positioning',
      description: 'Key messages and positioning for this play'
    },
    {
      id: 'timing',
      name: 'Launch Timing',
      type: 'text',
      required: true,
      placeholder: 'When will this GTM play be executed?',
      description: 'Timeline and key dates for execution'
    },
    {
      id: 'budget',
      name: 'Budget',
      type: 'text',
      required: false,
      placeholder: 'Estimated budget for this play',
      description: 'Budget allocated for this GTM effort'
    },
    {
      id: 'successMetrics',
      name: 'Success Metrics',
      type: 'array',
      required: true,
      description: 'How will we measure the success of this GTM play?'
    },
    {
      id: 'risks',
      name: 'Risks & Mitigations',
      type: 'array',
      required: false,
      description: 'Key risks and how we plan to mitigate them'
    },
    {
      id: 'competitiveResponse',
      name: 'Expected Competitive Response',
      type: 'textarea',
      required: false,
      placeholder: 'How might competitors respond?',
      description: 'Anticipated competitive reactions and our counter-strategies'
    }
  ],
  defaultValues: {
    playType: 'Product Launch',
    targetAudience: '',
    valueProposition: '',
    launchChannels: [],
    messaging: '',
    timing: '',
    budget: '',
    successMetrics: [],
    risks: [],
    competitiveResponse: ''
  },
  validation: {
    required: ['playType', 'targetAudience', 'valueProposition', 'launchChannels', 'messaging', 'timing', 'successMetrics']
  },
  relationships: {
    linkedBlueprints: ['value-proposition', 'personas', 'competitive-analysis'],
    requiredBlueprints: ['strategic-context']
  }
}