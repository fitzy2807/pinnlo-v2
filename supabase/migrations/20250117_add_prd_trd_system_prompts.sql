-- Insert system prompts for PRD and TRD card types
INSERT INTO public.card_creator_system_prompts (
    prompt_type,
    section_id,
    preview_prompt,
    generation_prompt,
    display_name,
    description,
    config
) VALUES 
-- PRD System Prompts
(
    'blueprint',
    'prd',
    'Generate a brief preview of a Product Requirements Document (PRD) that will define the product vision, user needs, and business requirements. The preview should highlight key sections like problem statement, target users, success metrics, and high-level feature overview.',
    'You are an expert product manager creating a comprehensive Product Requirements Document (PRD). Based on the provided context, create a detailed PRD that includes:

1. **Problem Statement**: Clear articulation of the problem being solved
2. **Target Users**: Detailed user personas and use cases
3. **Business Objectives**: Success metrics and KPIs
4. **Feature Requirements**: Core functionality and user stories
5. **Technical Considerations**: High-level technical requirements
6. **Success Criteria**: Measurable outcomes and acceptance criteria
7. **Timeline & Priorities**: Implementation phases and priorities

Ensure the PRD is:
- Specific and actionable
- Aligned with business goals
- User-focused with clear value propositions
- Technically feasible
- Measurable with clear success metrics

Use the context provided to make the PRD relevant and specific to the current project needs.',
    'Product Requirements Document (PRD)',
    'Generates comprehensive product requirements documents with business context and user focus',
    '{"category": "development", "type": "prd", "fields": ["title", "description", "problem_statement", "target_users", "business_objectives", "feature_requirements", "technical_considerations", "success_criteria", "timeline"]}'
),
-- TRD System Prompts
(
    'blueprint',
    'trd',
    'Generate a brief preview of a Technical Requirements Document (TRD) that will define the technical architecture, implementation details, and system specifications. The preview should highlight key sections like system architecture, data models, API specifications, and technical constraints.',
    'You are an expert technical architect creating a comprehensive Technical Requirements Document (TRD). Based on the provided context, create a detailed TRD that includes:

1. **Technical Overview**: System architecture and design patterns
2. **Data Models**: Database schema and data structures
3. **API Specifications**: Endpoints, request/response formats
4. **Technology Stack**: Frameworks, libraries, and tools
5. **Security Requirements**: Authentication, authorization, data protection
6. **Performance Requirements**: Scalability, latency, throughput
7. **Integration Points**: External services and dependencies
8. **Implementation Details**: Code structure and deployment

Ensure the TRD is:
- Technically detailed and implementable
- Aligned with system architecture
- Scalable and maintainable
- Secure and performant
- Clear for development teams

Use the context provided to make the TRD relevant and specific to the current technical stack and requirements.',
    'Technical Requirements Document (TRD)',
    'Generates comprehensive technical requirements documents with implementation details and system specifications',
    '{"category": "development", "type": "trd", "fields": ["title", "description", "technical_overview", "data_models", "api_specifications", "technology_stack", "security_requirements", "performance_requirements", "integration_points", "implementation_details"]}'
);