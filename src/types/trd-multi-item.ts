// Multi-item TRD types for structured data
// Each interface corresponds to a database table for structured TRD fields

export interface TRDApiEndpoint {
  id: string;
  card_id: string;
  endpoint_id: string; // e.g., "EP-001"
  endpoint_path: string; // e.g., "/api/v1/users"
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  request_format: object; // JSON schema for request
  response_format: object; // JSON schema for response
  authentication_required: boolean;
  rate_limit_requests?: number;
  rate_limit_window?: string; // e.g., "1 hour", "1 minute"
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'deprecated';
  priority: 'low' | 'medium' | 'high';
  owner?: string;
  implementation_notes?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TRDSecurityControl {
  id: string;
  card_id: string;
  control_id: string; // e.g., "SEC-001"
  control_title: string;
  control_description: string;
  control_type: 'preventive' | 'detective' | 'corrective';
  security_domain: 'application' | 'data' | 'network' | 'infrastructure' | 'identity';
  implementation_method: string;
  validation_criteria: string;
  compliance_frameworks: string[]; // e.g., ["SOC2", "GDPR", "HIPAA"]
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  implementation_status: 'planned' | 'in_progress' | 'implemented' | 'verified';
  owner?: string;
  target_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TRDPerformanceRequirement {
  id: string;
  card_id: string;
  requirement_id: string; // e.g., "PERF-001"
  requirement_title: string;
  metric_type: 'response_time' | 'throughput' | 'availability' | 'scalability' | 'resource_usage';
  target_value: number;
  target_unit: string; // e.g., "ms", "rps", "percent", "GB"
  measurement_method: string;
  baseline_value?: number;
  threshold_warning?: number;
  threshold_critical?: number;
  monitoring_frequency: 'continuous' | 'hourly' | 'daily' | 'weekly';
  priority: 'low' | 'medium' | 'high';
  status: 'defined' | 'measured' | 'validated' | 'met';
  owner?: string;
  validation_notes?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TRDTestCase {
  id: string;
  card_id: string;
  test_case_id: string; // e.g., "TC-001"
  test_title: string;
  test_description: string;
  test_type: 'unit' | 'integration' | 'functional' | 'performance' | 'security' | 'acceptance';
  test_category: 'positive' | 'negative' | 'boundary' | 'edge_case';
  preconditions?: string;
  test_steps: string;
  expected_result: string;
  actual_result?: string;
  test_data_requirements?: string;
  automation_status: 'manual' | 'automated' | 'semi_automated';
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'ready' | 'passed' | 'failed' | 'blocked' | 'skipped';
  assigned_tester?: string;
  execution_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TRDImplementationStandard {
  id: string;
  card_id: string;
  standard_id: string; // e.g., "STD-001"
  standard_title: string;
  standard_description: string;
  standard_category: 'coding' | 'documentation' | 'testing' | 'deployment' | 'security' | 'performance';
  implementation_details: string;
  compliance_criteria: string;
  validation_method: string;
  tools_required: string[];
  examples?: string;
  exceptions?: string;
  priority: 'low' | 'medium' | 'high';
  enforcement_level: 'required' | 'recommended' | 'optional';
  status: 'draft' | 'approved' | 'active' | 'deprecated';
  owner?: string;
  review_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TRDInfrastructureComponent {
  id: string;
  card_id: string;
  component_id: string; // e.g., "INFRA-001"
  component_name: string;
  component_type: 'service' | 'database' | 'cache' | 'queue' | 'cdn' | 'load_balancer' | 'storage' | 'monitoring';
  component_description: string;
  technology_stack: string;
  resource_requirements: object; // CPU, memory, storage specs
  scaling_configuration: object; // Auto-scaling rules
  monitoring_requirements: string;
  backup_strategy?: string;
  disaster_recovery?: string;
  security_considerations?: string;
  cost_estimate?: number;
  cost_frequency?: 'hourly' | 'daily' | 'monthly' | 'yearly';
  deployment_environment: 'development' | 'staging' | 'production' | 'all';
  status: 'planned' | 'provisioned' | 'configured' | 'deployed' | 'operational';
  owner?: string;
  implementation_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface TRDDataModel {
  id: string;
  card_id: string;
  model_id: string; // e.g., "DM-001"
  model_name: string;
  model_description: string;
  model_type: 'entity' | 'aggregate' | 'value_object' | 'event' | 'dto';
  schema_definition: object; // JSON schema or table structure
  relationships: object[]; // References to other models
  validation_rules: string;
  indexing_strategy?: string;
  migration_notes?: string;
  data_retention_policy?: string;
  privacy_considerations?: string;
  status: 'draft' | 'review' | 'approved' | 'implemented';
  owner?: string;
  version: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Complete TRD data structure with multi-item fields
export interface TRDMultiItemData {
  // Original single-field data (unchanged)
  // Document Control
  trd_id: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'deprecated';
  assigned_team: string;
  
  // Executive Summary (single fields)
  system_overview: string;
  business_purpose: string;
  key_architectural_decisions: string;
  strategic_alignment: string;
  success_criteria: string;
  
  // System Architecture (single fields)
  high_level_design: string;
  component_interactions: string;
  technology_stack_frontend: string;
  technology_stack_backend: string;
  technology_stack_database: string;
  technology_stack_other: string;
  integration_points: string;
  data_flow: string;
  
  // Feature Requirements (single fields)
  feature_overview: string;
  technical_approach: string;
  required_components: string;
  data_flow_processing: string;
  business_logic: string;
  ui_requirements: string;
  
  // Multi-item fields
  api_endpoints: TRDApiEndpoint[];
  security_controls: TRDSecurityControl[];
  performance_requirements: TRDPerformanceRequirement[];
  test_cases: TRDTestCase[];
  implementation_standards: TRDImplementationStandard[];
  infrastructure_components: TRDInfrastructureComponent[];
  data_models: TRDDataModel[];
  
  // Single field metadata
  linked_features: string;
  dependencies: string;
  implementation_notes: string;
}

// Updated TRD Card Props to support multi-item structure
export interface TRDMultiItemCardProps {
  trd: {
    id: string;
    title: string;
    description: string;
    card_data: TRDMultiItemData | any; // Fallback to any for backward compatibility
    created_at: string;
    updated_at: string;
  };
  onUpdate?: (id: string, updates: any) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onConvertToPRD?: (trd: any) => void;
  onConvertToTasks?: (trd: any) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

// Helper types for creating new items
export type CreateTRDApiEndpoint = Omit<TRDApiEndpoint, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreateTRDSecurityControl = Omit<TRDSecurityControl, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreateTRDPerformanceRequirement = Omit<TRDPerformanceRequirement, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreateTRDTestCase = Omit<TRDTestCase, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreateTRDImplementationStandard = Omit<TRDImplementationStandard, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreateTRDInfrastructureComponent = Omit<TRDInfrastructureComponent, 'id' | 'card_id' | 'created_at' | 'updated_at'>;
export type CreateTRDDataModel = Omit<TRDDataModel, 'id' | 'card_id' | 'created_at' | 'updated_at'>;

// Update types for partial updates
export type UpdateTRDApiEndpoint = Partial<CreateTRDApiEndpoint>;
export type UpdateTRDSecurityControl = Partial<CreateTRDSecurityControl>;
export type UpdateTRDPerformanceRequirement = Partial<CreateTRDPerformanceRequirement>;
export type UpdateTRDTestCase = Partial<CreateTRDTestCase>;
export type UpdateTRDImplementationStandard = Partial<CreateTRDImplementationStandard>;
export type UpdateTRDInfrastructureComponent = Partial<CreateTRDInfrastructureComponent>;
export type UpdateTRDDataModel = Partial<CreateTRDDataModel>;

// TRD-specific validation schema
export interface TRDMultiItemValidation {
  api_endpoints: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (endpoint: TRDApiEndpoint) => string[];
  };
  security_controls: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (control: TRDSecurityControl) => string[];
  };
  performance_requirements: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (requirement: TRDPerformanceRequirement) => string[];
  };
  test_cases: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (testCase: TRDTestCase) => string[];
  };
  implementation_standards: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (standard: TRDImplementationStandard) => string[];
  };
  infrastructure_components: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (component: TRDInfrastructureComponent) => string[];
  };
  data_models: {
    required: boolean;
    minItems: number;
    maxItems?: number;
    itemValidation: (model: TRDDataModel) => string[];
  };
}