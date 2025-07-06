import { BlueprintConfig } from '../types'

export const workstreamConfig: BlueprintConfig = {
  id: 'workstream',
  name: 'Workstream',
  description: 'Organize work into manageable streams with clear ownership',
  category: 'Planning & Execution',
  icon: '🔨',
  fields: [
    {
      id: 'objective',
      name: 'Objective',
      type: 'textarea',
      required: true,
      placeholder: 'What is this workstream trying to achieve?',
      description: 'The main goal of this workstream'
    },
    {
      id: 'duration',
      name: 'Duration',
      type: 'text',
      required: true,
      placeholder: 'e.g., 3 months, Q1 2024, 8 weeks',
      description: 'How long will this workstream run?'
    },
    {
      id: 'successCriteria',
      name: 'Success Criteria',
      type: 'textarea',
      required: true,
      placeholder: 'How will we know this workstream is successful?',
      description: 'Clear criteria for workstream success'
    },
    {
      id: 'teamsInvolved',
      name: 'Teams Involved',
      type: 'array',
      required: true,
      description: 'Which teams are participating in this workstream?'
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'array',
      required: false,
      description: 'What other workstreams or initiatives does this depend on?'
    },
    {
      id: 'keyMilestones',
      name: 'Key Milestones',
      type: 'array',
      required: false,
      description: 'Major milestones within this workstream'
    },
    {
      id: 'resourceRequirements',
      name: 'Resource Requirements',
      type: 'textarea',
      required: false,
      placeholder: 'People, budget, tools, etc.',
      description: 'What resources are needed for this workstream?'
    },
    {
      id: 'risks',
      name: 'Risks',
      type: 'array',
      required: false,
      description: 'What could prevent this workstream from succeeding?'
    }
  ],
  defaultValues: {
    objective: '',
    duration: '',
    successCriteria: '',
    teamsInvolved: [],
    dependencies: [],
    keyMilestones: [],
    resourceRequirements: '',
    risks: []
  },
  validation: {
    required: ['objective', 'duration', 'successCriteria', 'teamsInvolved']
  },
  relationships: {
    linkedBlueprints: ['okrs', 'epic', 'roadmap'],
    requiredBlueprints: ['strategic-context']
  }
}