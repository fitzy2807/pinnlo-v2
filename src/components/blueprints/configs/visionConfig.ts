import { BlueprintConfig } from '../types'

export const visionConfig: BlueprintConfig = {
  id: 'vision',
  name: 'Vision Statement',
  description: 'Define your long-term vision and aspirational goals',
  category: 'Core Strategy',
  icon: '👁️',
  fields: [
    {
      id: 'visionType',
      name: 'Vision Type',
      type: 'enum',
      required: true,
      options: ['Product', 'Company', 'Mission'],
      description: 'What type of vision statement is this?'
    },
    {
      id: 'timeHorizon',
      name: 'Time Horizon',
      type: 'text',
      required: true,
      placeholder: 'e.g., 5 years, 2030, Long-term',
      description: 'What timeframe does this vision cover?'
    },
    {
      id: 'guidingPrinciples',
      name: 'Guiding Principles',
      type: 'array',
      required: false,
      description: 'Core principles that guide this vision'
    },
    {
      id: 'inspirationSource',
      name: 'Inspiration Source',
      type: 'textarea',
      required: false,
      placeholder: 'What inspired this vision?',
      description: 'Sources of inspiration for this vision statement'
    }
  ],
  defaultValues: {
    visionType: 'Company',
    timeHorizon: '5 years',
    guidingPrinciples: [],
    inspirationSource: ''
  },
  validation: {
    required: ['visionType', 'timeHorizon']
  }
}