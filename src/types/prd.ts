// PRD-specific types for Development Bank v2
export interface PRDCardData {
  // Document Control - matches pattern from TRD
  prd_id: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'released';
  product_manager: string;
  last_reviewed: string;
  
  // Section 1: Product Overview
  product_vision: string;
  problem_statement: string;
  solution_overview: string;
  target_audience: string;
  value_proposition: string;
  success_summary: string;
  
  // Section 2: Requirements
  user_stories: string;
  functional_requirements: string;
  non_functional_requirements: string;
  acceptance_criteria: string;
  out_of_scope: string;
  
  // Section 3: User Experience
  user_flows: string;
  wireframes_mockups: string;
  interaction_design: string;
  accessibility_requirements: string;
  mobile_considerations: string;
  
  // Section 4: Business Context
  business_objectives: string;
  revenue_model: string;
  pricing_strategy: string;
  go_to_market_plan: string;
  competitive_positioning: string;
  success_metrics: string;
  
  // Section 5: Implementation Planning
  mvp_definition: string;
  release_phases: string;
  feature_prioritization: string;
  timeline_milestones: string;
  dependencies: string;
  risks_and_mitigation: string;
  
  // Metadata & Relationships
  linked_trds: string;
  linked_tasks: string;
  linked_features: string;
  stakeholder_list: string;
  tags: string;
  implementation_notes: string;
}

export interface PRDCardProps {
  prd: {
    id: string;
    title: string;
    description: string;
    card_data: PRDCardData | any;
    created_at: string;
    updated_at: string;
  };
  onUpdate?: (id: string, updates: any) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onConvertToTRD?: (prd: any) => void;
  onConvertToTasks?: (prd: any) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}