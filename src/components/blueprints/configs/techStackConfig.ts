import { BlueprintConfig } from '../types'

export const techStackConfig: BlueprintConfig = {
  id: 'tech-stack',
  name: 'Tech Stack',
  description: 'Define technology choices and architecture decisions',
  category: 'Planning & Execution',
  icon: '⚙️',
  fields: [
    {
      id: 'layer',
      name: 'Technology Layer',
      type: 'enum',
      required: true,
      options: ['Frontend', 'Backend', 'Database', 'Infrastructure', 'DevOps', 'Analytics', 'Security', 'Integration', 'Mobile'],
      description: 'Which layer of the tech stack does this address?'
    },
    {
      id: 'category',
      name: 'Technology Category',
      type: 'text',
      required: true,
      placeholder: 'e.g., Web Framework, Database, Monitoring',
      description: 'Specific category within the layer'
    },
    {
      id: 'toolsUsed',
      name: 'Tools/Technologies Used',
      type: 'array',
      required: true,
      description: 'Specific tools, frameworks, or technologies chosen'
    },
    {
      id: 'justification',
      name: 'Choice Justification',
      type: 'textarea',
      required: true,
      placeholder: 'Why did we choose these technologies?',
      description: 'Reasoning behind the technology choices'
    },
    {
      id: 'alternatives',
      name: 'Alternatives Considered',
      type: 'array',
      required: false,
      description: 'Other technologies that were considered but not chosen'
    },
    {
      id: 'pros',
      name: 'Advantages',
      type: 'array',
      required: false,
      description: 'Benefits of this technology choice'
    },
    {
      id: 'cons',
      name: 'Limitations',
      type: 'array',
      required: false,
      description: 'Limitations or drawbacks of this choice'
    },
    {
      id: 'skillRequirements',
      name: 'Skill Requirements',
      type: 'array',
      required: false,
      description: 'Skills needed to work with these technologies'
    },
    {
      id: 'migrationPlan',
      name: 'Migration Plan',
      type: 'textarea',
      required: false,
      placeholder: 'How will we transition to this technology?',
      description: 'Plan for implementing or migrating to this tech stack'
    },
    {
      id: 'maintenanceConsiderations',
      name: 'Maintenance Considerations',
      type: 'textarea',
      required: false,
      placeholder: 'Long-term maintenance and support considerations',
      description: 'Ongoing maintenance and support requirements'
    }
  ],
  defaultValues: {
    layer: 'Backend',
    category: '',
    toolsUsed: [],
    justification: '',
    alternatives: [],
    pros: [],
    cons: [],
    skillRequirements: [],
    migrationPlan: '',
    maintenanceConsiderations: ''
  },
  validation: {
    required: ['layer', 'category', 'toolsUsed', 'justification']
  },
  relationships: {
    linkedBlueprints: ['technical-requirement', 'feature', 'roadmap'],
    requiredBlueprints: ['strategic-context']
  }
}