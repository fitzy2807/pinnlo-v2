// Multi-item PRD types for structured data
// Each interface corresponds to a database table for structured PRD fields

export interface PRDUserStory {
  id: string;
  card_id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'ready' | 'in_progress' | 'completed';
  story_points?: number;
  linked_features: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PRDFunctionalRequirement {
  id: string;
  card_id: string;
  requirement_id: string; // e.g., "REQ-001"
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'approved' | 'implemented';
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  linked_user_stories: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PRDAcceptanceCriteria {
  id: string;
  card_id: string;
  parent_type: 'user_story' | 'functional_requirement' | 'feature';
  parent_id?: string;
  criteria_text: string;
  status: 'pending' | 'passed' | 'failed';
  test_method?: string; // e.g., "manual", "automated", "unit_test"
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PRDRisk {
  id: string;
  card_id: string;
  risk_title: string;
  risk_description: string;
  impact_level: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  mitigation_strategy: string;
  mitigation_status: 'planned' | 'in_progress' | 'completed';
  owner?: string;
  due_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PRDMilestone {
  id: string;
  card_id: string;
  milestone_title: string;
  milestone_description?: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string[];
  deliverables: string[];
  owner?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PRDDependency {
  id: string;
  card_id: string;
  dependency_title: string;
  dependency_description: string;
  dependency_type: 'technical' | 'business' | 'external' | 'resource';
  status: 'identified' | 'in_progress' | 'resolved' | 'blocked';
  blocking_impact?: string;
  owner?: string;
  target_resolution_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PRDLinkedItem {
  id: string;
  card_id: string;
  item_type: 'trd' | 'task' | 'feature';
  item_id: string; // External ID reference
  item_title?: string;
  relationship_type: 'related' | 'depends_on' | 'blocks' | 'implements';
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Complete PRD data structure with multi-item fields
export interface PRDMultiItemData {
  // Original single-field data (unchanged)
  // Document Control
  prd_id: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'released';
  product_manager: string;
  last_reviewed: string;
  
  // Section 1: Product Overview (unchanged - single fields)
  product_vision: string;
  problem_statement: string;
  solution_overview: string;
  target_audience: string;
  value_proposition: string;
  success_summary: string;
  
  // Section 2: Requirements (CONVERTED TO MULTI-ITEM)
  user_stories: PRDUserStory[];
  functional_requirements: PRDFunctionalRequirement[];
  non_functional_requirements: string; // Keep as single field for now
  acceptance_criteria: PRDAcceptanceCriteria[];
  out_of_scope: string; // Keep as single field for now
  
  // Section 3: User Experience (unchanged - single fields)
  user_flows: string;
  wireframes_mockups: string;
  interaction_design: string;
  accessibility_requirements: string;
  mobile_considerations: string;
  
  // Section 4: Business Context (unchanged - single fields)
  business_objectives: string;
  revenue_model: string;
  pricing_strategy: string;
  go_to_market_plan: string;
  competitive_positioning: string;
  success_metrics: string;
  
  // Section 5: Implementation Planning (CONVERTED TO MULTI-ITEM)
  mvp_definition: string; // Keep as single field for now
  release_phases: string; // Keep as single field for now
  feature_prioritization: string; // Keep as single field for now
  timeline_milestones: PRDMilestone[];
  dependencies: PRDDependency[];
  risks_and_mitigation: PRDRisk[];
  
  // Metadata & Relationships (CONVERTED TO MULTI-ITEM)
  linked_trds: PRDLinkedItem[];
  linked_tasks: PRDLinkedItem[];
  linked_features: PRDLinkedItem[];
  stakeholder_list: string; // Keep as single field for now
  tags: string; // Keep as single field for now
  implementation_notes: string; // Keep as single field for now
}

// Updated PRD Card Props to support multi-item structure
export interface PRDMultiItemCardProps {
  prd: {
    id: string;
    title: string;
    description: string;
    card_data: PRDMultiItemData | any; // Fallback to any for backward compatibility
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

// Helper types for creating new items
export type CreatePRDUserStory = Omit<PRDUserStory, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreatePRDFunctionalRequirement = Omit<PRDFunctionalRequirement, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreatePRDAcceptanceCriteria = Omit<PRDAcceptanceCriteria, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreatePRDRisk = Omit<PRDRisk, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreatePRDMilestone = Omit<PRDMilestone, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreatePRDDependency = Omit<PRDDependency, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreatePRDLinkedItem = Omit<PRDLinkedItem, 'id' | 'card_id' | 'created_at' | 'updated_at'>;

// Update types for partial updates
export type UpdatePRDUserStory = Partial<CreatePRDUserStory>;
export type UpdatePRDFunctionalRequirement = Partial<CreatePRDFunctionalRequirement>;
export type UpdatePRDAcceptanceCriteria = Partial<CreatePRDAcceptanceCriteria>;
export type UpdatePRDRisk = Partial<CreatePRDRisk>;
export type UpdatePRDMilestone = Partial<CreatePRDMilestone>;
export type UpdatePRDDependency = Partial<CreatePRDDependency>;
export type UpdatePRDLinkedItem = Partial<CreatePRDLinkedItem>;

// Multi-item field management operations
export interface MultiItemOperation<T> {
  type: 'create' | 'update' | 'delete' | 'reorder';
  item?: T;
  itemId?: string;
  updates?: Partial<T>;
  newOrder?: number[];
}

// Multi-item field configuration
export interface MultiItemFieldConfig<T> {
  fieldName: string;
  itemType: string;
  createNew: () => T;
  validate: (item: T) => string | null;
  getDisplayTitle: (item: T) => string;
  getDisplayPreview: (item: T) => string;
  canReorder: boolean;
  maxItems?: number;
}

// Validation schema for multi-item fields
export interface PRDMultiItemValidation {
  user_stories: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (story: PRDUserStory) => string[];
  };
  functional_requirements: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (req: PRDFunctionalRequirement) => string[];
  };
  acceptance_criteria: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (criteria: PRDAcceptanceCriteria) => string[];
  };
  risks_and_mitigation: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (risk: PRDRisk) => string[];
  };
  timeline_milestones: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (milestone: PRDMilestone) => string[];
  };
  dependencies: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (dep: PRDDependency) => string[];
  };
}