import { BlueprintConfig } from '../types'

export const strategicContextConfig: BlueprintConfig = {
  id: 'strategicContext',
  name: 'Strategic Context',
  description: 'Define the strategic context and foundation for your strategy',
  category: 'Core Strategy',
  icon: '🎯',
  fields: [
    {
      id: 'marketContext',
      name: 'Market Context',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the current market situation...',
      description: 'Overview of the market environment and conditions'
    },
    {
      id: 'competitiveLandscape',
      name: 'Competitive Landscape',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the competitive environment...',
      description: 'Analysis of competitors and competitive dynamics'
    },
    {
      id: 'keyTrends',
      name: 'Key Trends',
      type: 'array',
      required: false,
      description: 'Important trends affecting your strategy'
    },
    {
      id: 'stakeholders',
      name: 'Key Stakeholders',
      type: 'array',
      required: true,
      description: 'Important stakeholders for this strategic context'
    },
    {
      id: 'constraints',
      name: 'Strategic Constraints',
      type: 'array',
      required: false,
      description: 'Limitations or constraints that affect strategy'
    },
    {
      id: 'opportunities',
      name: 'Strategic Opportunities',
      type: 'array',
      required: false,
      description: 'Key opportunities identified in this context'
    },
    {
      id: 'timeframe',
      name: 'Strategic Timeframe',
      type: 'enum',
      required: true,
      options: ['3 months', '6 months', '1 year', '2-3 years', '3+ years'],
      description: 'Timeframe for this strategic context'
    }
  ],
  defaultValues: {
    marketContext: '',
    competitiveLandscape: '',
    keyTrends: [],
    stakeholders: [],
    constraints: [],
    opportunities: [],
    timeframe: '1 year'
  },
  validation: {
    required: ['marketContext', 'competitiveLandscape', 'stakeholders', 'timeframe']
  }
}