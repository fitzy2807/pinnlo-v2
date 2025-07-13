import { BlueprintConfig } from '../types'

export const experienceSectionConfig: BlueprintConfig = {
  id: 'experienceSections',
  name: 'Experience Section',
  description: 'Define specific sections of the user experience with detailed components',
  category: 'Planning & Execution',
  icon: '🧠',
  fields: [
    {
      id: 'sectionType',
      name: 'Section Type',
      type: 'enum',
      required: true,
      options: ['Landing Page', 'Dashboard', 'Onboarding', 'Settings', 'Checkout', 'Profile', 'Search', 'Navigation', 'Forms', 'Content', 'Other'],
      description: 'What type of experience section is this?'
    },
    {
      id: 'primaryGoal',
      name: 'Primary Goal',
      type: 'textarea',
      required: true,
      placeholder: 'What is the main purpose of this section?',
      description: 'The primary objective users should achieve in this section'
    },
    {
      id: 'userTasks',
      name: 'User Tasks',
      type: 'array',
      required: true,
      description: 'Specific tasks users can complete in this section'
    },
    {
      id: 'keyComponents',
      name: 'Key Components',
      type: 'array',
      required: true,
      description: 'UI components that make up this section (buttons, forms, lists, etc.)'
    },
    {
      id: 'linkedFeatures',
      name: 'Linked Features',
      type: 'array',
      required: false,
      description: 'Features that are implemented in this section'
    },
    {
      id: 'contentRequirements',
      name: 'Content Requirements',
      type: 'textarea',
      required: false,
      placeholder: 'What content is needed for this section?',
      description: 'Text, images, data, or other content needed'
    },
    {
      id: 'interactionPatterns',
      name: 'Interaction Patterns',
      type: 'array',
      required: false,
      description: 'Common interaction patterns used (click, drag, scroll, etc.)'
    },
    {
      id: 'successMetrics',
      name: 'Success Metrics',
      type: 'array',
      required: false,
      description: 'How will we measure success for this section?'
    },
    {
      id: 'accessibilityNotes',
      name: 'Accessibility Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Specific accessibility considerations',
      description: 'Accessibility requirements and considerations'
    }
  ],
  defaultValues: {
    sectionType: 'Other',
    primaryGoal: '',
    userTasks: [],
    keyComponents: [],
    linkedFeatures: [],
    contentRequirements: '',
    interactionPatterns: [],
    successMetrics: [],
    accessibilityNotes: ''
  },
  validation: {
    required: ['sectionType', 'primaryGoal', 'userTasks', 'keyComponents']
  },
  relationships: {
    linkedBlueprints: ['user-journey', 'feature', 'personas'],
    requiredBlueprints: ['strategic-context']
  }
}