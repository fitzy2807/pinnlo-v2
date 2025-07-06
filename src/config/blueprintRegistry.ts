import { BlueprintRegistry } from '@/types/blueprintTypes'

// Central registry of all blueprint configurations
// This will be expanded by Claude Code to include all 22 blueprint types
export const BLUEPRINT_REGISTRY: BlueprintRegistry = {
  'vision': {
    name: 'Vision',
    icon: '🧭',
    description: 'Define vision, mission, and guiding principles',
    category: 'Core Strategy',
    fields: [
      {
        key: 'visionType',
        type: 'enum',
        label: 'Vision Type',
        description: 'What type of vision statement is this?',
        options: ['Product', 'Company', 'Mission'],
        required: true,
        defaultValue: 'Company'
      },
      {
        key: 'timeHorizon',
        type: 'text',
        label: 'Time Horizon',
        description: 'What timeframe does this vision cover?',
        placeholder: 'e.g., 3-5 years, 2030, Long-term',
        required: false
      },
      {
        key: 'guidingPrinciples',
        type: 'array',
        label: 'Guiding Principles',
        description: 'Core principles that guide decision-making',
        itemType: 'text',
        maxItems: 8,
        placeholder: 'Enter a guiding principle'
      },
      {
        key: 'inspirationSource',
        type: 'textarea',
        label: 'Inspiration Source',
        description: 'What inspired this vision? What research or insights led to it?',
        rows: 3,
        placeholder: 'Describe the inspiration and background for this vision...'
      }
    ]
  },

  'value-proposition': {
    name: 'Value Proposition',
    icon: '💎',
    description: 'Define unique value propositions and differentiators',
    category: 'Core Strategy',
    fields: [
      {
        key: 'customerSegment',
        type: 'text',
        label: 'Customer Segment',
        description: 'Who is this value proposition for?',
        placeholder: 'e.g., Small business owners, Enterprise CTOs',
        required: true
      },
      {
        key: 'problemSolved',
        type: 'textarea',
        label: 'Problem Solved',
        description: 'What specific problem does this solve?',
        rows: 3,
        placeholder: 'Describe the core problem being addressed...',
        required: true
      },
      {
        key: 'gainCreated',
        type: 'textarea',
        label: 'Gain Created',
        description: 'What value or benefit do customers gain?',
        rows: 3,
        placeholder: 'Describe the benefits and value created...',
        required: true
      },
      {
        key: 'alternativeSolutions',
        type: 'array',
        label: 'Alternative Solutions',
        description: 'What alternatives do customers currently use?',
        itemType: 'text',
        maxItems: 5,
        placeholder: 'Current alternative or competitor solution'
      },
      {
        key: 'differentiator',
        type: 'textarea',
        label: 'Key Differentiator',
        description: 'What makes this unique compared to alternatives?',
        rows: 2,
        placeholder: 'Our unique advantage is...',
        required: true
      }
    ]
  },

  'persona': {
    name: 'Persona',
    icon: '👥',
    description: 'Create detailed user personas and target segments',
    category: 'Research & Analysis',
    fields: [
      {
        key: 'personaType',
        type: 'enum',
        label: 'Persona Type',
        description: 'What role does this persona play?',
        options: ['User', 'Buyer', 'Influencer', 'Stakeholder'],
        required: true,
        defaultValue: 'User'
      },
      {
        key: 'demographics',
        type: 'textarea',
        label: 'Demographics',
        description: 'Age, location, job title, company size, etc.',
        rows: 3,
        placeholder: 'Describe the demographic characteristics...'
      },
      {
        key: 'goals',
        type: 'array',
        label: 'Goals',
        description: 'What are they trying to achieve?',
        itemType: 'text',
        maxItems: 6,
        placeholder: 'Enter a goal or objective'
      },
      {
        key: 'painPoints',
        type: 'array',
        label: 'Pain Points',
        description: 'What challenges and frustrations do they face?',
        itemType: 'text',
        maxItems: 8,
        placeholder: 'Enter a pain point or challenge'
      },
      {
        key: 'motivations',
        type: 'array',
        label: 'Motivations',
        description: 'What drives their decisions and actions?',
        itemType: 'text',
        maxItems: 6,
        placeholder: 'Enter a motivation or driver'
      },
      {
        key: 'behaviours',
        type: 'array',
        label: 'Behaviours',
        description: 'How do they currently behave or work?',
        itemType: 'text',
        maxItems: 6,
        placeholder: 'Enter a behavior or pattern'
      }
    ]
  },

  'okr': {
    name: 'OKR',
    icon: '🎯',
    description: 'Set objectives and key results for measurement',
    category: 'Planning & Execution',
    fields: [
      {
        key: 'objective',
        type: 'textarea',
        label: 'Objective',
        description: 'What do you want to achieve? (Qualitative, inspirational)',
        rows: 2,
        placeholder: 'e.g., Become the leading platform for small businesses',
        required: true
      },
      {
        key: 'keyResults',
        type: 'objectArray',
        label: 'Key Results',
        description: 'How will you measure success? (Quantitative, specific)',
        maxItems: 5,
        addButtonText: 'Add Key Result',
        schema: [
          {
            key: 'title',
            type: 'text',
            label: 'Result Title',
            placeholder: 'e.g., Increase user acquisition',
            required: true
          },
          {
            key: 'metric',
            type: 'text',
            label: 'Metric',
            placeholder: 'e.g., Monthly active users, Revenue, Conversion rate',
            required: true
          },
          {
            key: 'targetValue',
            type: 'number',
            label: 'Target Value',
            placeholder: 'e.g., 10000, 95, 25',
            required: true,
            min: 0
          }
        ]
      },
      {
        key: 'timeframe',
        type: 'text',
        label: 'Timeframe',
        description: 'When should this be achieved?',
        placeholder: 'e.g., Q1 2024, By end of year, 6 months',
        required: true
      },
      {
        key: 'ownerTeam',
        type: 'text',
        label: 'Owner/Team',
        description: 'Who is responsible for this OKR?',
        placeholder: 'e.g., Product Team, Marketing, Sales',
        required: true
      }
    ]
  }
}

// Helper functions for working with blueprints
export function getBlueprintConfig(cardType: string) {
  return BLUEPRINT_REGISTRY[cardType] || null
}

export function getAllBlueprintTypes() {
  return Object.keys(BLUEPRINT_REGISTRY)
}

export function getBlueprintsByCategory(category: string) {
  return Object.entries(BLUEPRINT_REGISTRY)
    .filter(([_, config]) => config.category === category)
    .map(([key, config]) => ({ key, ...config }))
}

export function getBlueprintCategories() {
  const categories = new Set(
    Object.values(BLUEPRINT_REGISTRY).map(config => config.category)
  )
  return Array.from(categories)
}
