import { BlueprintConfig } from '../types';

export const trdConfig: BlueprintConfig = {
  id: 'trd',
  name: 'Technical Requirements Document',
  description: 'Comprehensive technical specifications and implementation requirements',
  category: 'Planning & Execution',
  tags: ['technical', 'requirements', 'documentation', 'architecture'],
  fields: [
    // 1. Executive Summary (5 fields)
    {
      id: 'system_overview',
      name: 'System Overview',
      type: 'textarea',
      required: true,
      description: 'Comprehensive overview of the technical system architecture and components',
      placeholder: 'Describe the high-level system architecture, core components, and technical approach...',
      validation: {
        minLength: 100,
        maxLength: 1000
      }
    },
    {
      id: 'business_purpose',
      name: 'Business Purpose',
      type: 'textarea',
      required: true,
      description: 'Business context and strategic alignment for technical decisions',
      placeholder: 'Explain the business drivers, strategic objectives, and expected outcomes...',
      validation: {
        minLength: 50,
        maxLength: 500
      }
    },
    {
      id: 'key_architectural_decisions',
      name: 'Key Architectural Decisions',
      type: 'textarea',
      required: true,
      description: 'Critical technical decisions and their rationale',
      placeholder: 'Document major architectural choices, technology selections, and design patterns...',
      validation: {
        minLength: 100,
        maxLength: 800
      }
    },
    {
      id: 'strategic_alignment',
      name: 'Strategic Alignment',
      type: 'textarea',
      required: true,
      description: 'How technical approach aligns with business strategy',
      placeholder: 'Describe alignment with company technical strategy, platform roadmap, and business goals...',
      validation: {
        minLength: 50,
        maxLength: 400
      }
    },
    {
      id: 'success_criteria',
      name: 'Success Criteria',
      type: 'textarea',
      required: true,
      description: 'Technical and business success metrics',
      placeholder: 'Define measurable success criteria, performance targets, and acceptance criteria...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 2. System Architecture (8 fields)
    {
      id: 'high_level_design',
      name: 'High-Level Design',
      type: 'textarea',
      required: true,
      description: 'Overall system design and component relationships',
      placeholder: 'Describe the system architecture, service boundaries, and integration patterns...',
      validation: {
        minLength: 200,
        maxLength: 1200
      }
    },
    {
      id: 'component_interactions',
      name: 'Component Interactions',
      type: 'textarea',
      required: true,
      description: 'How system components communicate and interact',
      placeholder: 'Detail inter-service communication, data flow, and integration patterns...',
      validation: {
        minLength: 150,
        maxLength: 800
      }
    },
    {
      id: 'technology_stack_frontend',
      name: 'Frontend Technologies',
      type: 'textarea',
      required: true,
      description: 'Frontend technology stack and frameworks',
      placeholder: 'Specify frontend frameworks, libraries, build tools, and development approach...',
      validation: {
        minLength: 50,
        maxLength: 400
      }
    },
    {
      id: 'technology_stack_backend',
      name: 'Backend Technologies',
      type: 'textarea',
      required: true,
      description: 'Backend technology stack and frameworks',
      placeholder: 'Detail backend frameworks, runtime environments, API technologies, and service architecture...',
      validation: {
        minLength: 50,
        maxLength: 400
      }
    },
    {
      id: 'technology_stack_database',
      name: 'Database Technologies',
      type: 'textarea',
      required: true,
      description: 'Database and data storage technologies',
      placeholder: 'Specify database systems, caching layers, search engines, and data storage solutions...',
      validation: {
        minLength: 50,
        maxLength: 400
      }
    },
    {
      id: 'technology_stack_other',
      name: 'Other Technologies',
      type: 'textarea',
      required: false,
      description: 'Additional infrastructure and supporting technologies',
      placeholder: 'Include message queues, monitoring tools, deployment platforms, and other infrastructure...',
      validation: {
        maxLength: 400
      }
    },
    {
      id: 'integration_points',
      name: 'Integration Points',
      type: 'textarea',
      required: true,
      description: 'External system integrations and interfaces',
      placeholder: 'Document third-party APIs, external services, and integration requirements...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'data_flow',
      name: 'Data Flow',
      type: 'textarea',
      required: true,
      description: 'Data movement and transformation patterns',
      placeholder: 'Describe data ingestion, processing, storage, and retrieval patterns...',
      validation: {
        minLength: 100,
        maxLength: 800
      }
    },

    // 3. Feature-Specific Requirements (6 fields)
    {
      id: 'feature_overview',
      name: 'Feature Overview',
      type: 'textarea',
      required: true,
      description: 'Comprehensive overview of feature functionality',
      placeholder: 'Describe the feature scope, core functionality, and user interactions...',
      validation: {
        minLength: 100,
        maxLength: 800
      }
    },
    {
      id: 'technical_approach',
      name: 'Technical Approach',
      type: 'textarea',
      required: true,
      description: 'Technical implementation strategy and methodology',
      placeholder: 'Detail the technical implementation approach, patterns, and methodologies...',
      validation: {
        minLength: 150,
        maxLength: 1000
      }
    },
    {
      id: 'required_components',
      name: 'Required Components',
      type: 'textarea',
      required: true,
      description: 'Technical components and dependencies needed',
      placeholder: 'List necessary components, libraries, services, and dependencies...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'data_flow_processing',
      name: 'Data Flow & Processing',
      type: 'textarea',
      required: true,
      description: 'Data processing workflows and transformations',
      placeholder: 'Describe data input, validation, processing, and output workflows...',
      validation: {
        minLength: 100,
        maxLength: 800
      }
    },
    {
      id: 'business_logic',
      name: 'Business Logic',
      type: 'textarea',
      required: true,
      description: 'Core business rules and logic implementation',
      placeholder: 'Detail business rules, validation logic, and decision-making processes...',
      validation: {
        minLength: 100,
        maxLength: 800
      }
    },
    {
      id: 'ui_requirements',
      name: 'UI Requirements',
      type: 'textarea',
      required: true,
      description: 'User interface and user experience requirements',
      placeholder: 'Specify UI components, user interactions, and experience requirements...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 4. Data Architecture (5 fields)
    {
      id: 'database_schema',
      name: 'Database Schema',
      type: 'textarea',
      required: true,
      description: 'Database table structures and relationships',
      placeholder: 'Define table schemas, column specifications, and data types...',
      validation: {
        minLength: 150,
        maxLength: 1000
      }
    },
    {
      id: 'data_relationships',
      name: 'Data Relationships',
      type: 'textarea',
      required: true,
      description: 'Entity relationships and foreign key constraints',
      placeholder: 'Document table relationships, foreign keys, and referential integrity...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'validation_rules',
      name: 'Validation Rules',
      type: 'textarea',
      required: true,
      description: 'Data validation and business rule constraints',
      placeholder: 'Specify validation rules, constraints, and data quality requirements...',
      validation: {
        minLength: 100,
        maxLength: 800
      }
    },
    {
      id: 'migration_strategies',
      name: 'Migration Strategies',
      type: 'textarea',
      required: true,
      description: 'Database migration and versioning approach',
      placeholder: 'Define migration procedures, versioning strategy, and rollback plans...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'data_governance',
      name: 'Data Governance',
      type: 'textarea',
      required: true,
      description: 'Data governance, privacy, and compliance requirements',
      placeholder: 'Document data privacy, retention policies, and compliance requirements...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 5. API Specifications (5 fields)
    {
      id: 'endpoint_definitions',
      name: 'Endpoint Definitions',
      type: 'textarea',
      required: true,
      description: 'REST API endpoint specifications',
      placeholder: 'Define API endpoints, HTTP methods, and URL patterns...',
      validation: {
        minLength: 150,
        maxLength: 1000
      }
    },
    {
      id: 'request_response_formats',
      name: 'Request/Response Formats',
      type: 'textarea',
      required: true,
      description: 'API request and response data structures',
      placeholder: 'Specify JSON schemas, request/response formats, and data validation...',
      validation: {
        minLength: 150,
        maxLength: 1000
      }
    },
    {
      id: 'authentication_methods',
      name: 'Authentication Methods',
      type: 'textarea',
      required: true,
      description: 'API authentication and authorization approach',
      placeholder: 'Detail authentication methods, token management, and security protocols...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'rate_limiting',
      name: 'Rate Limiting',
      type: 'textarea',
      required: true,
      description: 'API rate limiting and throttling policies',
      placeholder: 'Define rate limits, throttling strategies, and quota management...',
      validation: {
        minLength: 50,
        maxLength: 400
      }
    },
    {
      id: 'error_handling',
      name: 'Error Handling',
      type: 'textarea',
      required: true,
      description: 'API error response patterns and handling',
      placeholder: 'Specify error codes, response formats, and error handling strategies...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 6. Security Requirements (5 fields)
    {
      id: 'authentication_authorization',
      name: 'Authentication & Authorization',
      type: 'textarea',
      required: true,
      description: 'User authentication and access control mechanisms',
      placeholder: 'Detail authentication flows, role-based access, and permission systems...',
      validation: {
        minLength: 150,
        maxLength: 800
      }
    },
    {
      id: 'data_encryption',
      name: 'Data Encryption',
      type: 'textarea',
      required: true,
      description: 'Data encryption at rest and in transit',
      placeholder: 'Specify encryption algorithms, key management, and data protection strategies...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'input_validation',
      name: 'Input Validation',
      type: 'textarea',
      required: true,
      description: 'Input sanitization and validation requirements',
      placeholder: 'Define input validation rules, sanitization processes, and security filters...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'security_headers',
      name: 'Security Headers',
      type: 'textarea',
      required: true,
      description: 'HTTP security headers and browser protection',
      placeholder: 'Specify security headers, CSP policies, and browser security configurations...',
      validation: {
        minLength: 50,
        maxLength: 400
      }
    },
    {
      id: 'compliance_requirements',
      name: 'Compliance Requirements',
      type: 'textarea',
      required: true,
      description: 'Regulatory and compliance security requirements',
      placeholder: 'Document compliance standards, regulatory requirements, and audit criteria...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 7. Performance & Scalability (5 fields)
    {
      id: 'performance_targets',
      name: 'Performance Targets',
      type: 'textarea',
      required: true,
      description: 'Specific performance metrics and targets',
      placeholder: 'Define response time targets, throughput requirements, and performance KPIs...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'caching_strategies',
      name: 'Caching Strategies',
      type: 'textarea',
      required: true,
      description: 'Caching implementation and optimization approaches',
      placeholder: 'Detail caching layers, cache invalidation, and performance optimization...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'load_balancing',
      name: 'Load Balancing',
      type: 'textarea',
      required: true,
      description: 'Load distribution and traffic management',
      placeholder: 'Specify load balancing strategies, traffic distribution, and failover mechanisms...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'database_optimization',
      name: 'Database Optimization',
      type: 'textarea',
      required: true,
      description: 'Database performance optimization strategies',
      placeholder: 'Define indexing strategies, query optimization, and database tuning approaches...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'scaling_plans',
      name: 'Scaling Plans',
      type: 'textarea',
      required: true,
      description: 'Horizontal and vertical scaling strategies',
      placeholder: 'Document auto-scaling policies, capacity planning, and growth strategies...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 8. Infrastructure Requirements (5 fields)
    {
      id: 'hosting_deployment',
      name: 'Hosting & Deployment',
      type: 'textarea',
      required: true,
      description: 'Hosting platform and deployment architecture',
      placeholder: 'Specify hosting requirements, deployment strategies, and environment configurations...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'environment_configurations',
      name: 'Environment Configurations',
      type: 'textarea',
      required: true,
      description: 'Development, staging, and production environment setup',
      placeholder: 'Define environment-specific configurations, variables, and deployment differences...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'monitoring_logging',
      name: 'Monitoring & Logging',
      type: 'textarea',
      required: true,
      description: 'System monitoring and logging requirements',
      placeholder: 'Specify monitoring tools, logging strategies, and alerting mechanisms...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'backup_recovery',
      name: 'Backup & Recovery',
      type: 'textarea',
      required: true,
      description: 'Data backup and disaster recovery procedures',
      placeholder: 'Define backup schedules, recovery procedures, and disaster recovery plans...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'resource_requirements',
      name: 'Resource Requirements',
      type: 'textarea',
      required: true,
      description: 'Compute, storage, and network resource needs',
      placeholder: 'Specify CPU, memory, storage, and bandwidth requirements for each environment...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 9. Testing Strategy (5 fields)
    {
      id: 'unit_testing',
      name: 'Unit Testing',
      type: 'textarea',
      required: true,
      description: 'Unit testing framework and coverage requirements',
      placeholder: 'Define unit testing approach, frameworks, coverage targets, and quality gates...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'integration_testing',
      name: 'Integration Testing',
      type: 'textarea',
      required: true,
      description: 'Integration testing strategy and scope',
      placeholder: 'Specify integration testing approach, API testing, and service interaction validation...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'performance_testing',
      name: 'Performance Testing',
      type: 'textarea',
      required: true,
      description: 'Performance and load testing requirements',
      placeholder: 'Define load testing scenarios, performance benchmarks, and stress testing approaches...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'security_testing',
      name: 'Security Testing',
      type: 'textarea',
      required: true,
      description: 'Security testing and vulnerability assessment',
      placeholder: 'Specify security testing procedures, vulnerability scans, and penetration testing...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'user_acceptance_testing',
      name: 'User Acceptance Testing',
      type: 'textarea',
      required: true,
      description: 'User acceptance testing criteria and procedures',
      placeholder: 'Define UAT scenarios, acceptance criteria, and stakeholder validation processes...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 10. Implementation Guidelines (5 fields)
    {
      id: 'development_standards',
      name: 'Development Standards',
      type: 'textarea',
      required: true,
      description: 'Coding standards and development practices',
      placeholder: 'Define coding conventions, style guidelines, and development best practices...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'code_organization',
      name: 'Code Organization',
      type: 'textarea',
      required: true,
      description: 'Project structure and code organization patterns',
      placeholder: 'Specify project structure, module organization, and architectural patterns...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'documentation_requirements',
      name: 'Documentation Requirements',
      type: 'textarea',
      required: true,
      description: 'Technical documentation standards and requirements',
      placeholder: 'Define documentation standards, API docs, code comments, and knowledge transfer...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },
    {
      id: 'version_control',
      name: 'Version Control',
      type: 'textarea',
      required: true,
      description: 'Version control strategy and branching model',
      placeholder: 'Specify Git workflows, branching strategies, and release management processes...',
      validation: {
        minLength: 50,
        maxLength: 400
      }
    },
    {
      id: 'deployment_pipeline',
      name: 'Deployment Pipeline',
      type: 'textarea',
      required: true,
      description: 'CI/CD pipeline and deployment automation',
      placeholder: 'Define build processes, testing automation, and deployment pipeline stages...',
      validation: {
        minLength: 100,
        maxLength: 600
      }
    },

    // 11. Metadata & Relationships (8 fields)
    {
      id: 'trd_id',
      name: 'TRD ID',
      type: 'text',
      required: true,
      description: 'Unique technical requirements document identifier',
      placeholder: 'TRD-001',
      validation: {
        pattern: '^TRD-[0-9]{3,}$',
        minLength: 7,
        maxLength: 20
      }
    },
    {
      id: 'version',
      name: 'Version',
      type: 'text',
      required: true,
      description: 'Document version following semantic versioning',
      placeholder: '1.0.0',
      validation: {
        pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$'
      }
    },
    {
      id: 'status',
      name: 'Status',
      type: 'enum',
      required: true,
      description: 'Current document approval status',
      options: ['draft', 'review', 'approved', 'deprecated']
    },
    {
      id: 'assigned_team',
      name: 'Assigned Team',
      type: 'text',
      required: true,
      description: 'Development team responsible for implementation',
      placeholder: 'Backend Team, Frontend Team, DevOps',
      validation: {
        minLength: 3,
        maxLength: 200
      }
    },
    {
      id: 'linked_features',
      name: 'Linked Features',
      type: 'textarea',
      required: false,
      description: 'Related feature requirements and user stories',
      placeholder: 'List related PRDs, user stories, and feature dependencies...',
      validation: {
        maxLength: 500
      }
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'textarea',
      required: true,
      description: 'Technical and project dependencies',
      placeholder: 'List external dependencies, prerequisite implementations, and blockers...',
      validation: {
        minLength: 50,
        maxLength: 500
      }
    },
    {
      id: 'tags',
      name: 'Tags',
      type: 'text',
      required: false,
      description: 'Searchable tags and categories',
      placeholder: 'api, authentication, performance, security',
      validation: {
        maxLength: 200
      }
    },
    {
      id: 'implementation_notes',
      name: 'Implementation Notes',
      type: 'textarea',
      required: false,
      description: 'Additional implementation guidance and considerations',
      placeholder: 'Add any special considerations, known limitations, or implementation tips...',
      validation: {
        maxLength: 1000
      }
    }
  ],
  defaultValues: {
    trd_id: () => `TRD-${Date.now().toString().slice(-6)}`,
    version: '1.0.0',
    status: 'draft'
  }
};