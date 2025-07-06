import { BlueprintConfig } from '../types'

export const epicConfig: BlueprintConfig = {
  id: 'epic',
  name: 'Epic',
  description: 'Large initiatives broken down into manageable features',
  category: 'Planning & Execution',
  icon: '🧱',
  fields: [
    {
      id: 'linkedWorkstreamId',
      name: 'Linked Workstream',
      type: 'text',
      required: false,
      placeholder: 'Workstream ID this epic belongs to',
      description: 'Which workstream does this epic support?'
    },
    {
      id: 'objectiveAlignment',
      name: 'Objective Alignment',
      type: 'textarea',
      required: true,
      placeholder: 'How does this epic align with business objectives?',
      description: 'Connection to strategic objectives'
    },
    {
      id: 'outcomes',
      name: 'Expected Outcomes',
      type: 'array',
      required: true,
      description: 'What outcomes will this epic deliver?'
    },
    {
      id: 'progressStatus',
      name: 'Progress Status',
      type: 'enum',
      required: true,
      options: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      description: 'Current status of this epic'
    },
    {
      id: 'milestones',
      name: 'Milestones',
      type: 'object',
      required: false,
      description: 'Key milestones and their target dates'
    },
    {
      id: 'associatedFeatures',
      name: 'Associated Features',
      type: 'array',
      required: false,
      description: 'Features that belong to this epic'
    },
    {
      id: 'successCriteria',
      name: 'Success Criteria',
      type: 'array',
      required: true,
      description: 'How will we measure the success of this epic?'
    },
    {
      id: 'acceptanceCriteria',
      name: 'Acceptance Criteria',
      type: 'array',
      required: false,
      description: 'High-level criteria for epic completion'
    },
    {
      id: 'stakeholders',
      name: 'Stakeholders',
      type: 'array',
      required: false,
      description: 'Key stakeholders for this epic'
    },
    {
      id: 'risks',
      name: 'Risks',
      type: 'array',
      required: false,
      description: 'Potential risks that could impact this epic'
    }
  ],
  defaultValues: {
    linkedWorkstreamId: '',
    objectiveAlignment: '',
    outcomes: [],
    progressStatus: 'Not Started',
    milestones: {},
    associatedFeatures: [],
    successCriteria: [],
    acceptanceCriteria: [],
    stakeholders: [],
    risks: []
  },
  validation: {
    required: ['objectiveAlignment', 'outcomes', 'progressStatus', 'successCriteria']
  },
  relationships: {
    linkedBlueprints: ['workstream', 'feature', 'okrs'],
    requiredBlueprints: ['strategic-context']
  }
}