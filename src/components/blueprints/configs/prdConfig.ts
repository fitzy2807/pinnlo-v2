import { BlueprintConfig } from '../types';

export const prdConfig: BlueprintConfig = {
  id: 'prd',
  name: 'Product Requirements Document (PRD)',
  description: 'Comprehensive product requirements with business context and user focus',
  category: 'development',
  fields: [
    // Document Control Fields
    {
      id: 'prd_id',
      name: 'PRD ID',
      type: 'text',
      required: true,
      description: 'Unique identifier for this PRD following format PRD-YYYYMMDDHHMMSS',
      placeholder: 'PRD-1752705345637',
      validation: {
        pattern: '^PRD-\\d+$',
        message: 'Must follow format: PRD-YYYYMMDDHHMMSS'
      }
    },
    {
      id: 'version',
      name: 'Version',
      type: 'text',
      required: true,
      description: 'Document version number',
      placeholder: '1.0'
    },
    {
      id: 'status',
      name: 'Status',
      type: 'enum',
      required: true,
      options: ['draft', 'review', 'approved', 'released'],
      description: 'Current document status'
    },
    {
      id: 'product_manager',
      name: 'Product Manager',
      type: 'text',
      required: false,
      description: 'Product manager responsible for this PRD',
      placeholder: 'Product Manager Name'
    },
    {
      id: 'last_reviewed',
      name: 'Last Reviewed',
      type: 'date',
      required: false,
      description: 'Date when this PRD was last reviewed'
    },
    
    // Section 1: Product Overview
    {
      id: 'product_vision',
      name: 'Product Vision',
      type: 'textarea',
      required: true,
      description: 'High-level product vision statement',
      placeholder: 'Clear vision of what the product aims to achieve'
    },
    {
      id: 'problem_statement',
      name: 'Problem Statement',
      type: 'textarea',
      required: true,
      description: 'Clear articulation of the problem being solved',
      placeholder: 'Describe the core problem this product addresses'
    },
    {
      id: 'solution_overview',
      name: 'Solution Overview',
      type: 'textarea',
      required: true,
      description: 'High-level overview of the proposed solution',
      placeholder: 'Summarize how the product solves the problem'
    },
    {
      id: 'target_audience',
      name: 'Target Audience',
      type: 'textarea',
      required: true,
      description: 'Definition of target users and personas',
      placeholder: 'Describe the primary users of this product'
    },
    {
      id: 'value_proposition',
      name: 'Value Proposition',
      type: 'textarea',
      required: true,
      description: 'Clear value proposition for users',
      placeholder: 'What unique value does this product provide?'
    },
    {
      id: 'success_summary',
      name: 'Success Summary',
      type: 'textarea',
      required: false,
      description: 'Summary of what success looks like',
      placeholder: 'How will we know this product is successful?'
    },
    
    // Section 2: Requirements
    {
      id: 'user_stories',
      name: 'User Stories',
      type: 'textarea',
      required: true,
      description: 'User stories in "As a [user], I want [feature] so that [benefit]" format',
      placeholder: 'User stories with acceptance criteria'
    },
    {
      id: 'functional_requirements',
      name: 'Functional Requirements',
      type: 'textarea',
      required: true,
      description: 'Detailed functional requirements with REQ-XXX IDs',
      placeholder: 'Specific functional requirements'
    },
    {
      id: 'non_functional_requirements',
      name: 'Non-Functional Requirements',
      type: 'textarea',
      required: false,
      description: 'Performance, security, scalability requirements',
      placeholder: 'System quality requirements'
    },
    {
      id: 'acceptance_criteria',
      name: 'Acceptance Criteria',
      type: 'textarea',
      required: true,
      description: 'Specific acceptance criteria for features',
      placeholder: 'Measurable acceptance criteria'
    },
    {
      id: 'out_of_scope',
      name: 'Out of Scope',
      type: 'textarea',
      required: false,
      description: 'Items explicitly excluded from this PRD',
      placeholder: 'Features and functionality not included'
    },
    
    // Section 3: User Experience
    {
      id: 'user_flows',
      name: 'User Flows',
      type: 'textarea',
      required: false,
      description: 'Key user flow descriptions',
      placeholder: 'Step-by-step user interaction flows'
    },
    {
      id: 'wireframes_mockups',
      name: 'Wireframes & Mockups',
      type: 'textarea',
      required: false,
      description: 'References to wireframes and mockups',
      placeholder: 'Links or descriptions of UI designs'
    },
    {
      id: 'interaction_design',
      name: 'Interaction Design',
      type: 'textarea',
      required: false,
      description: 'Interaction design specifications',
      placeholder: 'How users interact with the product'
    },
    {
      id: 'accessibility_requirements',
      name: 'Accessibility Requirements',
      type: 'textarea',
      required: false,
      description: 'Accessibility and inclusion requirements',
      placeholder: 'WCAG compliance and accessibility features'
    },
    {
      id: 'mobile_considerations',
      name: 'Mobile Considerations',
      type: 'textarea',
      required: false,
      description: 'Mobile-specific requirements and considerations',
      placeholder: 'Mobile responsiveness and app considerations'
    },
    
    // Section 4: Business Context
    {
      id: 'business_objectives',
      name: 'Business Objectives',
      type: 'textarea',
      required: true,
      description: 'Clear business objectives and goals',
      placeholder: 'Key business goals this product supports'
    },
    {
      id: 'revenue_model',
      name: 'Revenue Model',
      type: 'textarea',
      required: false,
      description: 'How the product generates revenue',
      placeholder: 'Revenue streams and monetization strategy'
    },
    {
      id: 'pricing_strategy',
      name: 'Pricing Strategy',
      type: 'textarea',
      required: false,
      description: 'Pricing model and strategy',
      placeholder: 'How the product will be priced'
    },
    {
      id: 'go_to_market_plan',
      name: 'Go-to-Market Plan',
      type: 'textarea',
      required: false,
      description: 'High-level go-to-market strategy',
      placeholder: 'How the product will be launched and marketed'
    },
    {
      id: 'competitive_positioning',
      name: 'Competitive Positioning',
      type: 'textarea',
      required: false,
      description: 'Competitive analysis and positioning',
      placeholder: 'How this product compares to competitors'
    },
    {
      id: 'success_metrics',
      name: 'Success Metrics',
      type: 'textarea',
      required: true,
      description: 'KPIs and metrics to measure success',
      placeholder: 'Quantifiable success metrics'
    },
    
    // Section 5: Implementation Planning
    {
      id: 'mvp_definition',
      name: 'MVP Definition',
      type: 'textarea',
      required: true,
      description: 'Minimum viable product definition',
      placeholder: 'What constitutes the MVP'
    },
    {
      id: 'release_phases',
      name: 'Release Phases',
      type: 'textarea',
      required: false,
      description: 'Planned release phases and roadmap',
      placeholder: 'Phased release plan'
    },
    {
      id: 'feature_prioritization',
      name: 'Feature Prioritization',
      type: 'textarea',
      required: false,
      description: 'Feature prioritization framework',
      placeholder: 'How features are prioritized'
    },
    {
      id: 'timeline_milestones',
      name: 'Timeline & Milestones',
      type: 'textarea',
      required: false,
      description: 'Key milestones and timeline',
      placeholder: 'Important dates and milestones'
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      type: 'textarea',
      required: false,
      description: 'Technical and business dependencies',
      placeholder: 'External dependencies and blockers'
    },
    {
      id: 'risks_and_mitigation',
      name: 'Risks & Mitigation',
      type: 'textarea',
      required: false,
      description: 'Risk assessment and mitigation strategies',
      placeholder: 'Identified risks and mitigation plans'
    },
    
    // Metadata & Relationships
    {
      id: 'linked_trds',
      name: 'Linked TRDs',
      type: 'textarea',
      required: false,
      description: 'Related Technical Requirements Documents',
      placeholder: 'TRDs that implement this PRD'
    },
    {
      id: 'linked_tasks',
      name: 'Linked Tasks',
      type: 'textarea',
      required: false,
      description: 'Related development tasks',
      placeholder: 'Tasks derived from this PRD'
    },
    {
      id: 'linked_features',
      name: 'Linked Features',
      type: 'textarea',
      required: false,
      description: 'Related feature cards',
      placeholder: 'Features that implement this PRD'
    },
    {
      id: 'stakeholder_list',
      name: 'Stakeholder List',
      type: 'textarea',
      required: false,
      description: 'Key stakeholders and their roles',
      placeholder: 'Stakeholders involved in this product'
    },
    {
      id: 'tags',
      name: 'Tags',
      type: 'text',
      required: false,
      description: 'Tags for categorization',
      placeholder: 'Comma-separated tags'
    },
    {
      id: 'implementation_notes',
      name: 'Implementation Notes',
      type: 'textarea',
      required: false,
      description: 'Additional implementation notes',
      placeholder: 'Technical notes and considerations'
    }
  ],
  defaultValues: {
    prd_id: '',
    version: '1.0',
    status: 'draft',
    product_manager: '',
    last_reviewed: '',
    product_vision: '',
    problem_statement: '',
    solution_overview: '',
    target_audience: '',
    value_proposition: '',
    success_summary: '',
    user_stories: '',
    functional_requirements: '',
    non_functional_requirements: '',
    acceptance_criteria: '',
    out_of_scope: '',
    user_flows: '',
    wireframes_mockups: '',
    interaction_design: '',
    accessibility_requirements: '',
    mobile_considerations: '',
    business_objectives: '',
    revenue_model: '',
    pricing_strategy: '',
    go_to_market_plan: '',
    competitive_positioning: '',
    success_metrics: '',
    mvp_definition: '',
    release_phases: '',
    feature_prioritization: '',
    timeline_milestones: '',
    dependencies: '',
    risks_and_mitigation: '',
    linked_trds: '',
    linked_tasks: '',
    linked_features: '',
    stakeholder_list: '',
    tags: '',
    implementation_notes: ''
  },
  validation: {
    required: [
      'prd_id', 'version', 'status', 'product_vision', 'problem_statement',
      'solution_overview', 'target_audience', 'value_proposition',
      'user_stories', 'functional_requirements', 'acceptance_criteria',
      'business_objectives', 'success_metrics', 'mvp_definition'
    ]
  }
};