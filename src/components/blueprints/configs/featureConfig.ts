import { BlueprintConfig } from '../types'

export const featureConfig: BlueprintConfig = {
  id: 'features',
  name: 'Feature',
  description: 'Product features with detailed specifications and user stories',
  category: 'Planning & Execution',
  icon: '🔧',
  fields: [
    {
      id: 'epicId',
      name: 'Epic ID',
      type: 'text',
      required: false,
      placeholder: 'Epic this feature belongs to',
      description: 'Which epic does this feature support?'
    },
    {
      id: 'linkedPersona',
      name: 'Target Persona',
      type: 'text',
      required: true,
      placeholder: 'Primary persona this feature serves',
      description: 'Who is the primary user of this feature?'
    },
    {
      id: 'problemItSolves',
      name: 'Problem It Solves',
      type: 'textarea',
      required: true,
      placeholder: 'What user problem does this feature address?',
      description: 'The specific problem this feature solves'
    },
    {
      id: 'userStories',
      name: 'User Stories',
      type: 'object',
      required: true,
      description: 'User stories in format: As a [user], I want [goal] so that [benefit]'
    },
    {
      id: 'acceptanceCriteria',
      name: 'Acceptance Criteria',
      type: 'object',
      required: true,
      description: 'Specific criteria that must be met for feature completion'
    },
    {
      id: 'priorityLevel',
      name: 'Priority Level',
      type: 'enum',
      required: true,
      options: ['Must Have', 'Should Have', 'Nice to Have', 'Won\'t Have'],
      description: 'MoSCoW prioritization level'
    },
    {
      id: 'estimation',
      name: 'Effort Estimation',
      type: 'text',
      required: false,
      placeholder: 'Story points, hours, or relative sizing',
      description: 'Development effort estimation'
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'array',
      required: false,
      description: 'Other features or systems this depends on'
    },
    {
      id: 'designRefs',
      name: 'Design References',
      type: 'array',
      required: false,
      description: 'Links to mockups, wireframes, or design specs'
    },
    {
      id: 'techConsiderations',
      name: 'Technical Considerations',
      type: 'textarea',
      required: false,
      placeholder: 'Technical requirements, constraints, or considerations',
      description: 'Any technical aspects to consider during development'
    },
    {
      id: 'deliveryConstraints',
      name: 'Delivery Constraints',
      type: 'textarea',
      required: false,
      placeholder: 'Timeline, resource, or other constraints',
      description: 'Constraints that affect feature delivery'
    }
  ],
  defaultValues: {
    epicId: '',
    linkedPersona: '',
    problemItSolves: '',
    userStories: {},
    acceptanceCriteria: {},
    priorityLevel: 'Should Have',
    estimation: '',
    dependencies: [],
    designRefs: [],
    techConsiderations: '',
    deliveryConstraints: ''
  },
  validation: {
    required: ['linkedPersona', 'problemItSolves', 'userStories', 'acceptanceCriteria', 'priorityLevel']
  },
  relationships: {
    linkedBlueprints: ['epic', 'personas', 'problem-statement'],
    requiredBlueprints: ['strategic-context']
  }
}