import { BlueprintConfig } from '../types'

export const goToMarketConfig: BlueprintConfig = {
  id: 'goToMarket',
  name: 'Go-to-Market Strategy',
  description: 'Plan how to bring your product or service to market',
  category: 'Planning & Execution',
  icon: '🚀',
  fields: [
    {
      id: 'launchType',
      name: 'Launch Type',
      type: 'enum',
      required: true,
      options: ['New Product', 'New Market', 'New Feature', 'Market Expansion', 'Relaunch'],
      description: 'What type of go-to-market is this?'
    },
    {
      id: 'targetMarket',
      name: 'Target Market',
      type: 'textarea',
      required: true,
      placeholder: 'Who is your target market?',
      description: 'Primary market you\'re targeting'
    },
    {
      id: 'marketSize',
      name: 'Market Size',
      type: 'text',
      required: false,
      placeholder: 'TAM, SAM, SOM estimates',
      description: 'Total addressable market size'
    },
    {
      id: 'positioning',
      name: 'Market Positioning',
      type: 'textarea',
      required: true,
      placeholder: 'How will you position in the market?',
      description: 'Your unique position in the market'
    },
    {
      id: 'messagingStrategy',
      name: 'Messaging Strategy',
      type: 'textarea',
      required: true,
      placeholder: 'Key messages and value props',
      description: 'Core messaging and value propositions'
    },
    {
      id: 'salesStrategy',
      name: 'Sales Strategy',
      type: 'textarea',
      required: true,
      placeholder: 'How will you sell?',
      description: 'Sales approach and methodology'
    },
    {
      id: 'marketingChannels',
      name: 'Marketing Channels',
      type: 'array',
      required: true,
      description: 'Channels for reaching your market'
    },
    {
      id: 'launchTimeline',
      name: 'Launch Timeline',
      type: 'array',
      required: false,
      description: 'Key milestones and dates'
    },
    {
      id: 'successMetrics',
      name: 'Success Metrics',
      type: 'array',
      required: true,
      description: 'How will you measure success?'
    },
    {
      id: 'budget',
      name: 'Budget',
      type: 'text',
      required: false,
      placeholder: 'Marketing and launch budget',
      description: 'Budget allocated for go-to-market'
    }
  ],
  defaultValues: {
    launchType: 'New Product',
    targetMarket: '',
    marketSize: '',
    positioning: '',
    messagingStrategy: '',
    salesStrategy: '',
    marketingChannels: [],
    launchTimeline: [],
    successMetrics: [],
    budget: ''
  },
  validation: {
    required: ['launchType', 'targetMarket', 'positioning', 'messagingStrategy', 'salesStrategy', 'marketingChannels', 'successMetrics']
  },
  relationships: {
    linkedBlueprints: ['value-proposition', 'personas', 'competitive-analysis'],
    requiredBlueprints: ['strategic-context', 'value-proposition']
  }
}