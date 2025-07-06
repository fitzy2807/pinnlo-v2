import { BlueprintConfig } from '../types'

export const okrConfig: BlueprintConfig = {
  id: 'okrs',
  name: 'OKRs',
  description: 'Define objectives and key results for goal tracking',
  category: 'Planning & Execution',
  icon: '🎯',
  fields: [
    {
      id: 'objectiveType',
      name: 'Objective Type',
      type: 'enum',
      required: true,
      options: ['Company', 'Team', 'Individual', 'Product'],
      description: 'What level is this objective for?'
    },
    {
      id: 'timeframe',
      name: 'Timeframe',
      type: 'enum',
      required: true,
      options: ['Quarter', 'Half-Year', 'Annual'],
      description: 'Duration for this OKR'
    },
    {
      id: 'objective',
      name: 'Objective',
      type: 'textarea',
      required: true,
      placeholder: 'What do you want to achieve?',
      description: 'The qualitative goal you want to accomplish'
    },
    {
      id: 'keyResults',
      name: 'Key Results',
      type: 'array',
      required: true,
      description: 'Measurable outcomes that indicate objective success'
    },
    {
      id: 'currentProgress',
      name: 'Current Progress',
      type: 'number',
      required: false,
      placeholder: '0-100%',
      description: 'Current completion percentage',
      validation: {
        min: 0,
        max: 100
      }
    },
    {
      id: 'owner',
      name: 'Owner',
      type: 'text',
      required: true,
      placeholder: 'Who is responsible?',
      description: 'Person or team responsible for this OKR'
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'array',
      required: false,
      description: 'What other OKRs or initiatives does this depend on?'
    },
    {
      id: 'risks',
      name: 'Risks',
      type: 'array',
      required: false,
      description: 'What could prevent achieving this objective?'
    }
  ],
  defaultValues: {
    objectiveType: 'Team',
    timeframe: 'Quarter',
    objective: '',
    keyResults: [],
    currentProgress: 0,
    owner: '',
    dependencies: [],
    risks: []
  },
  validation: {
    required: ['objectiveType', 'timeframe', 'objective', 'keyResults', 'owner']
  },
  relationships: {
    linkedBlueprints: ['roadmap', 'kpis'],
    requiredBlueprints: ['strategic-context']
  }
}