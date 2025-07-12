import { BlueprintConfig } from '../types'

export const techStackEnhancedConfig: BlueprintConfig = {
  id: 'tech-stack-enhanced',
  name: 'Tech Stack Enhanced',
  description: 'Comprehensive technology stack management with AI-powered generation and TRD support',
  category: 'Organizational & Technical',
  icon: '⚙️',
  fields: [
    // Technology Identity & Classification (AI Auto-Generatable)
    {
      id: 'technology_name',
      name: 'Technology Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., React, Node.js, PostgreSQL',
      description: 'Primary technology name'
    },
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
      required: false,
      placeholder: 'e.g., UI Library, Runtime Environment, Relational Database',
      description: 'Specific subcategory within the main category'
    },
    {
      id: 'version_current',
      name: 'Current Version',
      type: 'text',
      required: false,
      placeholder: 'e.g., 18.2.0, 16.14.0',
      description: 'Version currently in use or being considered'
    },
    {
      id: 'vendor',
      name: 'Vendor/Maintainer',
      type: 'text',
      required: false,
      placeholder: 'e.g., Meta, Node.js Foundation, PostgreSQL Global Development Group',
      description: 'Organization or entity maintaining this technology'
    },
    {
      id: 'license_type',
      name: 'License Type',
      type: 'text',
      required: false,
      placeholder: 'e.g., MIT, Apache 2.0, GPL',
      description: 'Software license under which this technology is distributed'
    },
    {
      id: 'language_ecosystem',
      name: 'Language Ecosystem',
      type: 'text',
      required: false,
      placeholder: 'e.g., JavaScript/TypeScript, Python, Java',
      description: 'Primary programming language ecosystem'
    },

    // Technical Capabilities & Constraints
    {
      id: 'primary_functions',
      name: 'Primary Functions',
      type: 'array',
      required: true,
      description: 'Main capabilities and use cases for this technology'
    },
    {
      id: 'technical_specifications',
      name: 'Technical Specifications',
      type: 'object',
      required: false,
      description: 'Performance characteristics, scalability limits, resource requirements, security features',
      subFields: [
        { id: 'performance_characteristics', name: 'Performance Characteristics', type: 'text' },
        { id: 'scalability_limits', name: 'Scalability Limits', type: 'text' },
        { id: 'resource_requirements', name: 'Resource Requirements', type: 'text' },
        { id: 'security_features', name: 'Security Features', type: 'array' }
      ]
    },

    // Company-Specific Implementation
    {
      id: 'our_implementation',
      name: 'Our Implementation',
      type: 'object',
      required: false,
      description: 'Company-specific configuration and setup details',
      subFields: [
        { id: 'version_used', name: 'Version We Use', type: 'text' },
        { id: 'key_features_enabled', name: 'Key Features Enabled', type: 'array' },
        { id: 'custom_configurations', name: 'Custom Configurations', type: 'array' },
        { id: 'performance_optimizations', name: 'Performance Optimizations', type: 'array' }
      ]
    },

    // Integration Architecture
    {
      id: 'integration_capabilities',
      name: 'Integration Capabilities',
      type: 'object',
      required: false,
      description: 'APIs supported, data formats, authentication methods, communication patterns',
      subFields: [
        { id: 'apis_supported', name: 'APIs Supported', type: 'array' },
        { id: 'data_formats', name: 'Data Formats', type: 'array' },
        { id: 'authentication_methods', name: 'Authentication Methods', type: 'array' },
        { id: 'communication_patterns', name: 'Communication Patterns', type: 'array' }
      ]
    },
    {
      id: 'our_integrations',
      name: 'Our Integrations',
      type: 'object',
      required: false,
      description: 'Company-specific integration implementation',
      subFields: [
        { id: 'connects_to', name: 'Connects To', type: 'array' },
        { id: 'data_flow_patterns', name: 'Data Flow Patterns', type: 'array' },
        { id: 'authentication_implementation', name: 'Authentication Implementation', type: 'text' },
        { id: 'error_handling_strategy', name: 'Error Handling Strategy', type: 'text' }
      ]
    },

    // Development & Deployment Context
    {
      id: 'development_patterns',
      name: 'Development Patterns',
      type: 'object',
      required: false,
      description: 'Standard build tools, testing frameworks, deployment targets',
      subFields: [
        { id: 'build_tools', name: 'Build Tools', type: 'array' },
        { id: 'testing_frameworks', name: 'Testing Frameworks', type: 'array' },
        { id: 'deployment_targets', name: 'Deployment Targets', type: 'array' }
      ]
    },
    {
      id: 'our_workflow',
      name: 'Our Workflow',
      type: 'object',
      required: false,
      description: 'Company-specific development and deployment workflow',
      subFields: [
        { id: 'build_process', name: 'Build Process', type: 'text' },
        { id: 'testing_approach', name: 'Testing Approach', type: 'text' },
        { id: 'deployment_method', name: 'Deployment Method', type: 'text' },
        { id: 'environment_config', name: 'Environment Config', type: 'text' },
        { id: 'ci_cd_integration', name: 'CI/CD Integration', type: 'text' }
      ]
    },

    // Dependencies & Ecosystem
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'object',
      required: false,
      description: 'Runtime, development, and peer dependencies',
      subFields: [
        { id: 'runtime_dependencies', name: 'Runtime Dependencies', type: 'array' },
        { id: 'development_dependencies', name: 'Development Dependencies', type: 'array' },
        { id: 'peer_dependencies', name: 'Peer Dependencies', type: 'array' }
      ]
    },
    {
      id: 'ecosystem_compatibility',
      name: 'Ecosystem Compatibility',
      type: 'object',
      required: false,
      description: 'Compatible technologies and common libraries',
      subFields: [
        { id: 'works_with', name: 'Works With', type: 'array' },
        { id: 'common_libraries', name: 'Common Libraries', type: 'array' }
      ]
    },
    {
      id: 'our_dependencies',
      name: 'Our Dependencies',
      type: 'object',
      required: false,
      description: 'Company-specific technology stack dependencies',
      subFields: [
        { id: 'ui_library', name: 'UI Library', type: 'text' },
        { id: 'state_management', name: 'State Management', type: 'text' },
        { id: 'routing', name: 'Routing', type: 'text' },
        { id: 'http_client', name: 'HTTP Client', type: 'text' },
        { id: 'form_handling', name: 'Form Handling', type: 'text' }
      ]
    },

    // Implementation Standards & Patterns
    {
      id: 'recommended_patterns',
      name: 'Recommended Patterns',
      type: 'object',
      required: false,
      description: 'Industry best practices and recommended patterns',
      subFields: [
        { id: 'component_structure', name: 'Component Structure', type: 'text' },
        { id: 'state_management', name: 'State Management', type: 'text' },
        { id: 'error_handling', name: 'Error Handling', type: 'text' },
        { id: 'performance', name: 'Performance', type: 'text' }
      ]
    },
    {
      id: 'our_standards',
      name: 'Our Standards',
      type: 'object',
      required: false,
      description: 'Company-specific implementation standards',
      subFields: [
        { id: 'code_structure', name: 'Code Structure', type: 'text' },
        { id: 'naming_conventions', name: 'Naming Conventions', type: 'text' },
        { id: 'state_patterns', name: 'State Patterns', type: 'text' },
        { id: 'testing_requirements', name: 'Testing Requirements', type: 'text' },
        { id: 'documentation', name: 'Documentation', type: 'text' }
      ]
    },

    // Performance & Monitoring
    {
      id: 'performance_features',
      name: 'Performance Features',
      type: 'object',
      required: false,
      description: 'Optimization techniques, monitoring options, caching strategies',
      subFields: [
        { id: 'optimization_techniques', name: 'Optimization Techniques', type: 'array' },
        { id: 'monitoring_options', name: 'Monitoring Options', type: 'array' },
        { id: 'caching_strategies', name: 'Caching Strategies', type: 'array' }
      ]
    },
    {
      id: 'our_performance',
      name: 'Our Performance',
      type: 'object',
      required: false,
      description: 'Company-specific performance metrics and targets',
      subFields: [
        { id: 'target_metrics', name: 'Target Metrics', type: 'object' },
        { id: 'monitoring_tools', name: 'Monitoring Tools', type: 'text' },
        { id: 'performance_budget', name: 'Performance Budget', type: 'text' }
      ]
    },

    // Security & Compliance
    {
      id: 'security_capabilities',
      name: 'Security Capabilities',
      type: 'object',
      required: false,
      description: 'Built-in security features and capabilities',
      subFields: [
        { id: 'built_in_protections', name: 'Built-in Protections', type: 'array' },
        { id: 'secure_coding_practices', name: 'Secure Coding Practices', type: 'array' },
        { id: 'vulnerability_scanning', name: 'Vulnerability Scanning', type: 'text' }
      ]
    },
    {
      id: 'our_security',
      name: 'Our Security',
      type: 'object',
      required: false,
      description: 'Company-specific security implementation',
      subFields: [
        { id: 'authentication_flow', name: 'Authentication Flow', type: 'text' },
        { id: 'data_protection', name: 'Data Protection', type: 'text' },
        { id: 'compliance_measures', name: 'Compliance Measures', type: 'text' },
        { id: 'security_tools', name: 'Security Tools', type: 'text' }
      ]
    },

    // Troubleshooting & Support
    {
      id: 'common_issues',
      name: 'Common Issues',
      type: 'object',
      required: false,
      description: 'Typical problems, debugging tools, community resources',
      subFields: [
        { id: 'typical_problems', name: 'Typical Problems', type: 'array' },
        { id: 'debugging_tools', name: 'Debugging Tools', type: 'array' },
        { id: 'community_resources', name: 'Community Resources', type: 'array' }
      ]
    },
    {
      id: 'our_support',
      name: 'Our Support',
      type: 'object',
      required: false,
      description: 'Company-specific support structure',
      subFields: [
        { id: 'internal_expertise', name: 'Internal Expertise', type: 'array' },
        { id: 'escalation_path', name: 'Escalation Path', type: 'text' },
        { id: 'documentation_location', name: 'Documentation Location', type: 'text' },
        { id: 'known_issues', name: 'Known Issues', type: 'text' }
      ]
    },

    // TRD Generation Context (Critical for TRD Generation)
    {
      id: 'implementation_guidance',
      name: 'Implementation Guidance',
      type: 'object',
      required: false,
      description: 'Critical context for Technical Requirements Document (TRD) generation',
      subFields: [
        { id: 'typical_tasks', name: 'Typical Tasks', type: 'array' },
        { id: 'code_patterns', name: 'Code Patterns', type: 'object' },
        { id: 'quality_requirements', name: 'Quality Requirements', type: 'object' },
        { id: 'deployment_considerations', name: 'Deployment Considerations', type: 'object' }
      ]
    }
  ],
  defaultValues: {
    technology_name: '',
    category: 'Backend',
    subcategory: '',
    version_current: '',
    vendor: '',
    license_type: '',
    language_ecosystem: '',
    primary_functions: [],
    technical_specifications: {
      performance_characteristics: '',
      scalability_limits: '',
      resource_requirements: '',
      security_features: []
    },
    our_implementation: {
      version_used: '',
      key_features_enabled: [],
      custom_configurations: [],
      performance_optimizations: []
    },
    integration_capabilities: {
      apis_supported: [],
      data_formats: [],
      authentication_methods: [],
      communication_patterns: []
    },
    our_integrations: {
      connects_to: [],
      data_flow_patterns: [],
      authentication_implementation: '',
      error_handling_strategy: ''
    },
    development_patterns: {
      build_tools: [],
      testing_frameworks: [],
      deployment_targets: []
    },
    our_workflow: {
      build_process: '',
      testing_approach: '',
      deployment_method: '',
      environment_config: '',
      ci_cd_integration: ''
    },
    dependencies: {
      runtime_dependencies: [],
      development_dependencies: [],
      peer_dependencies: []
    },
    ecosystem_compatibility: {
      works_with: [],
      common_libraries: []
    },
    our_dependencies: {
      ui_library: '',
      state_management: '',
      routing: '',
      http_client: '',
      form_handling: ''
    },
    recommended_patterns: {
      component_structure: '',
      state_management: '',
      error_handling: '',
      performance: ''
    },
    our_standards: {
      code_structure: '',
      naming_conventions: '',
      state_patterns: '',
      testing_requirements: '',
      documentation: ''
    },
    performance_features: {
      optimization_techniques: [],
      monitoring_options: [],
      caching_strategies: []
    },
    our_performance: {
      target_metrics: {},
      monitoring_tools: '',
      performance_budget: ''
    },
    security_capabilities: {
      built_in_protections: [],
      secure_coding_practices: [],
      vulnerability_scanning: ''
    },
    our_security: {
      authentication_flow: '',
      data_protection: '',
      compliance_measures: '',
      security_tools: ''
    },
    common_issues: {
      typical_problems: [],
      debugging_tools: [],
      community_resources: []
    },
    our_support: {
      internal_expertise: [],
      escalation_path: '',
      documentation_location: '',
      known_issues: ''
    },
    implementation_guidance: {
      typical_tasks: [],
      code_patterns: {},
      quality_requirements: {},
      deployment_considerations: {}
    }
  },
  validation: {
    required: ['technology_name', 'category', 'primary_functions']
  },
  relationships: {
    linkedBlueprints: ['technical-requirement', 'feature', 'roadmap', 'risk-assessment'],
    requiredBlueprints: ['strategic-context']
  },
  aiGeneration: {
    enabled: true,
    autoGeneratableFields: [
      'technology_name',
      'category',
      'subcategory',
      'vendor',
      'license_type',
      'language_ecosystem',
      'primary_functions',
      'technical_specifications',
      'integration_capabilities',
      'development_patterns',
      'dependencies',
      'ecosystem_compatibility',
      'recommended_patterns',
      'performance_features',
      'security_capabilities',
      'common_issues'
    ],
    companySpecificFields: [
      'our_implementation',
      'our_integrations',
      'our_workflow',
      'our_dependencies',
      'our_standards',
      'our_performance',
      'our_security',
      'our_support',
      'implementation_guidance'
    ],
    promptTemplate: `Generate comprehensive tech stack information for {technology_name} in the {category} category. 
    
    Focus on:
    1. Technical capabilities and specifications
    2. Integration patterns and APIs
    3. Development and deployment workflows
    4. Dependencies and ecosystem compatibility
    5. Performance and security features
    6. Common issues and troubleshooting
    
    Provide industry-standard information that can be customized for company-specific implementation.`
  }
}