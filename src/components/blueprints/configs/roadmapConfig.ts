import { BlueprintConfig } from '../types'

export const roadmapConfig: BlueprintConfig = {
  id: 'roadmap',
  name: 'Roadmap',
  description: 'Plan timeline and milestones for strategy execution',
  category: 'Planning & Execution',
  icon: '📅',
  fields: [
    {
      id: 'roadmapType',
      name: 'Roadmap Type',
      type: 'enum',
      required: true,
      options: ['Product', 'Technology', 'Strategic', 'Marketing', 'Implementation'],
      description: 'What type of roadmap is this?'
    },
    {
      id: 'timeHorizon',
      name: 'Time Horizon',
      type: 'enum',
      required: true,
      options: ['3 Months', '6 Months', '1 Year', '2 Years', '3+ Years'],
      description: 'What timeframe does this roadmap cover?'
    },
    {
      id: 'themes',
      name: 'Strategic Themes',
      type: 'array',
      required: true,
      description: 'High-level themes organizing the roadmap'
    },
    {
      id: 'milestones',
      name: 'Key Milestones',
      type: 'array',
      required: true,
      description: 'Major milestones and target dates'
    },
    {
      id: 'initiatives',
      name: 'Initiatives',
      type: 'array',
      required: true,
      description: 'Specific initiatives and projects'
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'array',
      required: false,
      description: 'Dependencies between initiatives'
    },
    {
      id: 'resources',
      name: 'Resource Requirements',
      type: 'object',
      required: false,
      description: 'Resources needed for execution'
    },
    {
      id: 'risks',
      name: 'Execution Risks',
      type: 'array',
      required: false,
      description: 'Risks to roadmap delivery'
    },
    {
      id: 'successCriteria',
      name: 'Success Criteria',
      type: 'array',
      required: true,
      description: 'How success will be measured'
    }
  ],
  defaultValues: {
    roadmapType: 'Strategic',
    timeHorizon: '1 Year',
    themes: [],
    milestones: [],
    initiatives: [],
    dependencies: [],
    resources: {},
    risks: [],
    successCriteria: []
  },
  validation: {
    required: ['roadmapType', 'timeHorizon', 'themes', 'milestones', 'initiatives', 'successCriteria']
  },
  relationships: {
    linkedBlueprints: ['okrs', 'implementation-plan'],
    requiredBlueprints: ['strategic-context']
  }
}