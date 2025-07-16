-- Update PRD system prompt config with complete field structure
UPDATE public.card_creator_system_prompts 
SET config = '{
  "category": "development",
  "type": "prd",
  "sections": {
    "document_control": {
      "name": "Document Control",
      "fields": ["prd_id", "version", "status", "product_manager", "last_reviewed"]
    },
    "product_overview": {
      "name": "Product Overview", 
      "fields": ["product_vision", "problem_statement", "solution_overview", "target_audience", "value_proposition", "success_summary"]
    },
    "requirements": {
      "name": "Requirements",
      "fields": ["user_stories", "functional_requirements", "non_functional_requirements", "acceptance_criteria", "out_of_scope"]
    },
    "user_experience": {
      "name": "User Experience",
      "fields": ["user_flows", "wireframes_mockups", "interaction_design", "accessibility_requirements", "mobile_considerations"]
    },
    "business_context": {
      "name": "Business Context",
      "fields": ["business_objectives", "revenue_model", "pricing_strategy", "go_to_market_plan", "competitive_positioning", "success_metrics"]
    },
    "implementation_planning": {
      "name": "Implementation Planning",
      "fields": ["mvp_definition", "release_phases", "feature_prioritization", "timeline_milestones", "dependencies", "risks_and_mitigation"]
    },
    "metadata": {
      "name": "Metadata & Relationships",
      "fields": ["linked_trds", "linked_tasks", "linked_features", "stakeholder_list", "tags", "implementation_notes"]
    }
  },
  "all_fields": [
    "prd_id", "version", "status", "product_manager", "last_reviewed",
    "product_vision", "problem_statement", "solution_overview", "target_audience", "value_proposition", "success_summary",
    "user_stories", "functional_requirements", "non_functional_requirements", "acceptance_criteria", "out_of_scope",
    "user_flows", "wireframes_mockups", "interaction_design", "accessibility_requirements", "mobile_considerations",
    "business_objectives", "revenue_model", "pricing_strategy", "go_to_market_plan", "competitive_positioning", "success_metrics",
    "mvp_definition", "release_phases", "feature_prioritization", "timeline_milestones", "dependencies", "risks_and_mitigation",
    "linked_trds", "linked_tasks", "linked_features", "stakeholder_list", "tags", "implementation_notes"
  ],
  "multi_item_fields": [
    "user_stories", "functional_requirements", "acceptance_criteria", 
    "timeline_milestones", "dependencies", "risks_and_mitigation",
    "linked_trds", "linked_tasks", "linked_features"
  ],
  "required_fields": [
    "prd_id", "version", "status", "product_vision", "problem_statement",
    "solution_overview", "target_audience", "value_proposition",
    "user_stories", "functional_requirements", "acceptance_criteria",
    "business_objectives", "success_metrics", "mvp_definition"
  ]
}'
WHERE section_id = 'prd' AND prompt_type = 'blueprint';

-- Update PRD generation prompt to include all sections and fields
UPDATE public.card_creator_system_prompts 
SET generation_prompt = 'You are an expert product manager creating a comprehensive Product Requirements Document (PRD). Based on the provided context, create a detailed PRD that includes all sections and fields.

**CRITICAL REQUIREMENT**: You must return a JSON object with ALL the following fields properly populated with meaningful, specific content:

## JSON Structure Required:
{
  "confidence": {
    "level": "high",
    "rationale": "Explanation of confidence level based on context quality"
  },
  "blueprintFields": {
    // Document Control (5 fields)
    "prd_id": "PRD-" + current timestamp,
    "version": "1.0",
    "status": "draft",
    "product_manager": "Generated product manager name",
    "last_reviewed": "2025-01-17",
    
    // Section 1: Product Overview (6 fields)
    "product_vision": "Specific, inspiring product vision based on context",
    "problem_statement": "Clear, detailed problem statement from context analysis",
    "solution_overview": "Comprehensive solution overview addressing the problem",
    "target_audience": "Specific target audience with demographics and use cases",
    "value_proposition": "Clear, compelling value proposition for users",
    "success_summary": "Detailed success criteria and expected outcomes",
    
    // Section 2: Requirements (5 fields)
    "user_stories": "5-10 user stories in format: As a [user], I want [feature] so that [benefit]",
    "functional_requirements": "8-15 detailed functional requirements with REQ-XXX IDs",
    "non_functional_requirements": "Performance, security, scalability, and quality requirements",
    "acceptance_criteria": "Specific, measurable acceptance criteria for each feature",
    "out_of_scope": "Clear list of items explicitly excluded from this PRD scope",
    
    // Section 3: User Experience (5 fields)
    "user_flows": "Detailed user flow descriptions for key scenarios",
    "wireframes_mockups": "References to wireframes, mockups, or design specifications",
    "interaction_design": "Specific interaction design requirements and patterns",
    "accessibility_requirements": "WCAG compliance and accessibility feature requirements",
    "mobile_considerations": "Mobile-specific requirements, responsive design needs",
    
    // Section 4: Business Context (6 fields)
    "business_objectives": "Clear, measurable business objectives this product supports",
    "revenue_model": "Detailed revenue generation strategy and monetization approach",
    "pricing_strategy": "Pricing model, strategy, and competitive positioning",
    "go_to_market_plan": "High-level go-to-market strategy and launch approach",
    "competitive_positioning": "Competitive analysis and differentiation strategy",
    "success_metrics": "Specific KPIs, metrics, and measurement framework",
    
    // Section 5: Implementation Planning (6 fields)
    "mvp_definition": "Clear definition of minimum viable product scope",
    "release_phases": "Phased release plan with timeline and feature breakdown",
    "feature_prioritization": "Framework and criteria for feature prioritization",
    "timeline_milestones": "Key milestones with dates, deliverables, and dependencies",
    "dependencies": "Technical, business, and external dependencies with resolution plans",
    "risks_and_mitigation": "Risk assessment with impact, probability, and mitigation strategies",
    
    // Section 6: Metadata & Relationships (6 fields)
    "linked_trds": "Related Technical Requirements Documents and their relationships",
    "linked_tasks": "Development tasks and work items derived from this PRD",
    "linked_features": "Feature cards and user stories that implement this PRD",
    "stakeholder_list": "Key stakeholders, their roles, and responsibilities",
    "tags": "Relevant tags for categorization and discovery",
    "implementation_notes": "Additional technical notes, constraints, and considerations"
  },
  "tags": ["prd", "product-requirements", "development"],
  "implementation": {
    "timeline": "Realistic implementation timeline based on scope",
    "dependencies": ["Key technical and business dependencies"],
    "successCriteria": ["Measurable success criteria for this PRD"]
  }
}

## Content Requirements:
1. **Contextual Relevance**: Use the provided context to make all content specific and relevant
2. **Completeness**: Every field must contain meaningful, substantive content - no placeholder text
3. **Specificity**: Avoid generic statements; provide specific, actionable information
4. **Consistency**: Ensure all sections align and support each other
5. **Professional Quality**: Content should be production-ready and professionally written

## Multi-Item Field Guidelines:
- **User Stories**: Include 5-10 stories with proper format and acceptance criteria
- **Functional Requirements**: Provide 8-15 requirements with unique REQ-XXX identifiers
- **Risks**: Include 5-8 risks with impact/probability assessment and mitigation strategies
- **Milestones**: Provide 4-6 milestones with realistic dates and deliverables
- **Dependencies**: List 3-5 key dependencies with resolution strategies

## Validation Requirements:
- All 39 fields must be populated with substantive content
- Required fields must have comprehensive, detailed content
- Multi-item fields must contain structured, detailed entries
- No field should contain "TBD", "TODO", or placeholder content
- Content must demonstrate understanding of the provided context

**FINAL CHECK**: Before responding, verify that all 39 fields are populated with meaningful, context-specific content.'
WHERE section_id = 'prd' AND prompt_type = 'blueprint';