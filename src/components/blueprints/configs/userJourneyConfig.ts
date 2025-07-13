import { BlueprintConfig } from '../types'

export const userJourneyConfig: BlueprintConfig = {
  id: 'userJourneys',
  name: 'User Journey',
  description: 'Map user experiences and touchpoints across their journey',
  category: 'Research & Analysis',
  icon: '🗺️',
  fields: [
    {
      id: 'personaId',
      name: 'Target Persona',
      type: 'text',
      required: true,
      placeholder: 'Persona ID or name',
      description: 'Which persona does this journey represent?'
    },
    {
      id: 'journeyType',
      name: 'Journey Type',
      type: 'enum',
      required: true,
      options: ['Customer Journey', 'User Journey', 'Employee Journey', 'Service Journey'],
      description: 'What type of journey is this?'
    },
    {
      id: 'journeyStages',
      name: 'Journey Stages',
      type: 'array',
      required: true,
      description: 'The main stages of this journey (e.g., Awareness, Consideration, Purchase)'
    },
    {
      id: 'touchpoints',
      name: 'Touchpoints',
      type: 'object',
      required: true,
      description: 'Key touchpoints at each stage of the journey'
    },
    {
      id: 'goalsAtEachStage',
      name: 'Goals at Each Stage',
      type: 'object',
      required: true,
      description: 'What the user is trying to achieve at each stage'
    },
    {
      id: 'painPointsAtEachStage',
      name: 'Pain Points at Each Stage',
      type: 'object',
      required: true,
      description: 'Frustrations and obstacles at each stage'
    },
    {
      id: 'emotions',
      name: 'Emotional Journey',
      type: 'object',
      required: false,
      description: 'How the user feels throughout the journey'
    },
    {
      id: 'opportunityAreas',
      name: 'Opportunity Areas',
      type: 'array',
      required: true,
      description: 'Areas where we can improve the experience'
    },
    {
      id: 'channels',
      name: 'Channels Used',
      type: 'array',
      required: false,
      description: 'Digital and physical channels involved in this journey'
    }
  ],
  defaultValues: {
    personaId: '',
    journeyType: 'User Journey',
    journeyStages: [],
    touchpoints: {},
    goalsAtEachStage: {},
    painPointsAtEachStage: {},
    emotions: {},
    opportunityAreas: [],
    channels: []
  },
  validation: {
    required: ['personaId', 'journeyType', 'journeyStages', 'touchpoints', 'goalsAtEachStage', 'painPointsAtEachStage', 'opportunityAreas']
  },
  relationships: {
    linkedBlueprints: ['personas', 'experience-section', 'service-blueprint'],
    requiredBlueprints: ['personas']
  }
}