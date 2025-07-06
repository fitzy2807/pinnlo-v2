import { BlueprintConfig } from '../types'

export const serviceBlueprintConfig: BlueprintConfig = {
  id: 'service-blueprint',
  name: 'Service Blueprint',
  description: 'Map the complete service delivery process including front and backstage',
  category: 'Planning & Execution',
  icon: '🧩',
  fields: [
    {
      id: 'serviceType',
      name: 'Service Type',
      type: 'enum',
      required: true,
      options: ['Digital Service', 'Physical Service', 'Hybrid Service', 'Support Service'],
      description: 'What type of service is this blueprint for?'
    },
    {
      id: 'userActions',
      name: 'User Actions',
      type: 'array',
      required: true,
      description: 'Actions the user takes as part of this service'
    },
    {
      id: 'frontstageInteractions',
      name: 'Frontstage Interactions',
      type: 'array',
      required: true,
      description: 'Visible interactions between user and service provider'
    },
    {
      id: 'backstageProcesses',
      name: 'Backstage Processes',
      type: 'array',
      required: true,
      description: 'Internal processes that support the service (not visible to user)'
    },
    {
      id: 'supportingSystems',
      name: 'Supporting Systems',
      type: 'array',
      required: true,
      description: 'Technology, tools, and systems that enable the service'
    },
    {
      id: 'touchpoints',
      name: 'Service Touchpoints',
      type: 'array',
      required: true,
      description: 'All points of contact between user and service'
    },
    {
      id: 'painPoints',
      name: 'Service Pain Points',
      type: 'array',
      required: false,
      description: 'Issues or friction points in the service delivery'
    },
    {
      id: 'opportunities',
      name: 'Improvement Opportunities',
      type: 'array',
      required: false,
      description: 'Areas where the service can be improved'
    },
    {
      id: 'roles',
      name: 'Service Roles',
      type: 'array',
      required: false,
      description: 'People/roles involved in delivering this service'
    },
    {
      id: 'serviceStandards',
      name: 'Service Standards',
      type: 'array',
      required: false,
      description: 'Standards and quality measures for this service'
    }
  ],
  defaultValues: {
    serviceType: 'Digital Service',
    userActions: [],
    frontstageInteractions: [],
    backstageProcesses: [],
    supportingSystems: [],
    touchpoints: [],
    painPoints: [],
    opportunities: [],
    roles: [],
    serviceStandards: []
  },
  validation: {
    required: ['serviceType', 'userActions', 'frontstageInteractions', 'backstageProcesses', 'supportingSystems', 'touchpoints']
  },
  relationships: {
    linkedBlueprints: ['user-journey', 'experience-section', 'personas'],
    requiredBlueprints: ['strategic-context']
  }
}