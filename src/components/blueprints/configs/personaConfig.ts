import { BlueprintConfig } from '../types'

export const personaConfig: BlueprintConfig = {
  id: 'personas',
  name: 'Personas',
  description: 'Define detailed user personas and customer segments',
  category: 'Research & Analysis',
  icon: '👥',
  fields: [
    {
      id: 'personaType',
      name: 'Persona Type',
      type: 'enum',
      required: true,
      options: ['Primary', 'Secondary', 'Anti-Persona'],
      description: 'What type of persona is this?'
    },
    {
      id: 'demographics',
      name: 'Demographics',
      type: 'object',
      required: true,
      description: 'Age, location, role, income, etc.'
    },
    {
      id: 'psychographics',
      name: 'Psychographics',
      type: 'object',
      required: false,
      description: 'Values, interests, lifestyle, personality traits'
    },
    {
      id: 'goals',
      name: 'Goals & Motivations',
      type: 'array',
      required: true,
      description: 'What are they trying to achieve?'
    },
    {
      id: 'painPoints',
      name: 'Pain Points',
      type: 'array',
      required: true,
      description: 'What frustrates or blocks them?'
    },
    {
      id: 'behaviors',
      name: 'Behaviors',
      type: 'array',
      required: false,
      description: 'How do they currently solve problems?'
    },
    {
      id: 'preferredChannels',
      name: 'Preferred Channels',
      type: 'array',
      required: false,
      description: 'How do they prefer to communicate/engage?'
    },
    {
      id: 'influences',
      name: 'Influences',
      type: 'array',
      required: false,
      description: 'Who or what influences their decisions?'
    }
  ],
  defaultValues: {
    personaType: 'Primary',
    demographics: {},
    psychographics: {},
    goals: [],
    painPoints: [],
    behaviors: [],
    preferredChannels: [],
    influences: []
  },
  validation: {
    required: ['personaType', 'demographics', 'goals', 'painPoints']
  },
  relationships: {
    linkedBlueprints: ['value-proposition', 'customer-journey'],
    requiredBlueprints: ['strategic-context']
  }
}