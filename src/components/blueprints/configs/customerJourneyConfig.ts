import { BlueprintConfig } from '../types'

export const customerJourneyConfig: BlueprintConfig = {
  id: 'customer-journey',
  name: 'Customer Journey',
  description: 'Map the customer experience from awareness to advocacy',
  category: 'Research & Analysis',
  icon: 'Route',
  fields: [
    {
      id: 'journeyType',
      name: 'Journey Type',
      type: 'enum',
      required: true,
      options: ['Current State', 'Future State', 'Ideal State'],
      description: 'What type of journey are you mapping?'
    },
    {
      id: 'linkedPersonaIds',
      name: 'Linked Personas',
      type: 'array',
      required: true,
      description: 'Which personas does this journey represent?'
    },
    {
      id: 'stages',
      name: 'Journey Stages',
      type: 'array',
      required: true,
      description: 'The phases customers go through'
    },
    {
      id: 'touchpoints',
      name: 'Touchpoints',
      type: 'array',
      required: true,
      description: 'All the ways customers interact with you'
    },
    {
      id: 'emotions',
      name: 'Emotional Journey',
      type: 'object',
      required: false,
      description: 'How customers feel at each stage'
    },
    {
      id: 'painPoints',
      name: 'Pain Points',
      type: 'array',
      required: true,
      description: 'Where customers experience friction'
    },
    {
      id: 'opportunities',
      name: 'Opportunities',
      type: 'array',
      required: false,
      description: 'Areas for improvement or innovation'
    },
    {
      id: 'channels',
      name: 'Channels',
      type: 'array',
      required: false,
      description: 'Communication and interaction channels used'
    }
  ],
  defaultValues: {
    journeyType: 'Current State',
    linkedPersonaIds: [],
    stages: [],
    touchpoints: [],
    emotions: {},
    painPoints: [],
    opportunities: [],
    channels: []
  },
  validation: {
    required: ['journeyType', 'linkedPersonaIds', 'stages', 'touchpoints', 'painPoints']
  },
  relationships: {
    linkedBlueprints: ['personas', 'value-proposition'],
    requiredBlueprints: ['personas']
  }
}