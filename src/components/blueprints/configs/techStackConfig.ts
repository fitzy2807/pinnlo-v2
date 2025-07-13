import { BlueprintConfig } from '../types'

export const techStackConfig: BlueprintConfig = {
  id: 'techStack',
  name: 'Tech Stack Component',
  description: 'Document and manage technology architecture components',
  category: 'Planning & Execution',
  icon: '⚙️',
  fields: [
    // === BASIC INFORMATION ===
    {
      id: 'category',
      name: 'Category',
      type: 'enum',
      required: true,
      options: ['Frontend', 'Backend', 'Database', 'Infrastructure', 'DevOps', 'Analytics', 'Security', 'Integration', 'Mobile'],
      description: 'Primary technology category'
    },
    {
      id: 'subcategory',
      name: 'Subcategory',
      type: 'text',
      placeholder: 'e.g., Framework, Library, Tool',
      description: 'More specific classification'
    },
    {
      id: 'version_current',
      name: 'Current Version',
      type: 'text',
      placeholder: 'e.g., 18.2.0',
      description: 'Latest stable version available'
    },
    {
      id: 'vendor',
      name: 'Vendor/Maintainer',
      type: 'text',
      placeholder: 'e.g., Meta, Google, Microsoft',
      description: 'Company or organization maintaining this technology'
    },
    {
      id: 'license_type',
      name: 'License',
      type: 'text',
      placeholder: 'e.g., MIT, Apache 2.0, Proprietary',
      description: 'Software license type'
    },
    {
      id: 'language_ecosystem',
      name: 'Language/Ecosystem',
      type: 'text',
      placeholder: 'e.g., JavaScript, Python, Java',
      description: 'Primary programming language or ecosystem'
    },
    {
      id: 'implementation_status',
      name: 'Implementation Status',
      type: 'enum',
      options: ['planned', 'in-progress', 'active', 'deprecated'],
      description: 'Current status in our tech stack'
    },
    
    // === CAPABILITIES ===
    {
      id: 'primary_functions',
      name: 'Primary Functions',
      type: 'array',
      placeholder: 'Add key capabilities...',
      description: 'Main features and capabilities this technology provides'
    },
    
    // === OUR IMPLEMENTATION ===
    {
      id: 'our_implementation.version_used',
      name: 'Version We Use',
      type: 'text',
      placeholder: 'e.g., 18.1.0',
      description: 'The specific version deployed in our environment'
    },
    {
      id: 'our_implementation.key_features_enabled',
      name: 'Features Enabled',
      type: 'array',
      placeholder: 'Add enabled features...',
      description: 'Which features we actually use'
    },
    {
      id: 'our_implementation.custom_configurations',
      name: 'Custom Configurations',
      type: 'textarea',
      placeholder: 'Describe any custom configurations...',
      description: 'Custom settings and configurations'
    },
    
    // === INTEGRATIONS ===
    {
      id: 'our_integrations.connects_to',
      name: 'Connected Systems',
      type: 'array',
      placeholder: 'Add connected technologies...',
      description: 'Other technologies this integrates with'
    },
    {
      id: 'our_integrations.authentication_implementation',
      name: 'Authentication Method',
      type: 'text',
      placeholder: 'e.g., JWT, OAuth2, API Key',
      description: 'How authentication is handled'
    },
    {
      id: 'our_integrations.data_flow_patterns',
      name: 'Data Flow Patterns',
      type: 'array',
      placeholder: 'e.g., REST API, GraphQL, WebSocket',
      description: 'How data flows between systems'
    },
    
    // === DEVELOPMENT ===
    {
      id: 'our_workflow.build_process',
      name: 'Build Process',
      type: 'text',
      placeholder: 'e.g., Webpack, Vite, Rollup',
      description: 'Build tools and processes'
    },
    {
      id: 'our_workflow.testing_approach',
      name: 'Testing Approach',
      type: 'text',
      placeholder: 'e.g., Jest, Cypress, Playwright',
      description: 'Testing framework and approach'
    },
    
    // === SUPPORT ===
    {
      id: 'our_support.documentation_location',
      name: 'Documentation Location',
      type: 'text',
      placeholder: 'e.g., Confluence URL, GitHub Wiki',
      description: 'Where to find our internal documentation'
    },
    {
      id: 'our_support.internal_expertise',
      name: 'Internal Experts',
      type: 'array',
      placeholder: 'Add team members...',
      description: 'Team members with expertise in this technology'
    },
    {
      id: 'common_issues.typical_problems',
      name: 'Common Issues',
      type: 'array',
      placeholder: 'Add known issues...',
      description: 'Typical problems encountered with this technology'
    }
  ],
  defaultValues: {
    category: 'Frontend',
    subcategory: '',
    version_current: '',
    vendor: '',
    license_type: '',
    language_ecosystem: '',
    implementation_status: 'planned',
    primary_functions: [],
    'our_implementation.version_used': '',
    'our_implementation.key_features_enabled': [],
    'our_implementation.custom_configurations': '',
    'our_integrations.connects_to': [],
    'our_integrations.authentication_implementation': '',
    'our_integrations.data_flow_patterns': [],
    'our_workflow.build_process': '',
    'our_workflow.testing_approach': '',
    'our_support.documentation_location': '',
    'our_support.internal_expertise': [],
    'common_issues.typical_problems': []
  },
  validation: {
    required: ['category']
  },
  relationships: {
    linkedBlueprints: ['technical-requirement', 'feature', 'roadmap'],
    requiredBlueprints: []
  }
}