import { BlueprintConfig } from '../types'

export const valuePropositionConfig: BlueprintConfig = {
  id: 'valuePropositions',
  name: 'Value Proposition',
  description: 'Define the unique value you provide to customers',
  category: 'Core Strategy',
  icon: '💎',
  fields: [
    {
      id: 'customerSegment',
      name: 'Customer Segment',
      type: 'text',
      required: true,
      placeholder: 'Who is this value proposition for?',
      description: 'Target customer segment for this value proposition'
    },
    {
      id: 'problemSolved',
      name: 'Problem Solved',
      type: 'textarea',
      required: true,
      placeholder: 'What problem does this solve?',
      description: 'The core problem or pain point being addressed'
    },
    {
      id: 'gainCreated',
      name: 'Gain Created',
      type: 'textarea',
      required: true,
      placeholder: 'What value or benefit do we provide?',
      description: 'The positive outcomes and benefits delivered'
    },
    {
      id: 'alternativeSolutions',
      name: 'Alternative Solutions',
      type: 'array',
      required: false,
      description: 'What other solutions exist for this problem?'
    },
    {
      id: 'differentiator',
      name: 'Key Differentiator',
      type: 'textarea',
      required: true,
      placeholder: 'What makes this unique?',
      description: 'What sets this apart from alternatives'
    }
  ],
  defaultValues: {
    customerSegment: '',
    problemSolved: '',
    gainCreated: '',
    alternativeSolutions: [],
    differentiator: ''
  },
  validation: {
    required: ['customerSegment', 'problemSolved', 'gainCreated', 'differentiator']
  },
  relationships: {
    linkedBlueprints: ['personas', 'customer-journey'],
    requiredBlueprints: ['strategic-context']
  }
}