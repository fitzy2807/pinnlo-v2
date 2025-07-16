import { 
  TRDApiEndpoint, 
  TRDSecurityControl, 
  TRDPerformanceRequirement,
  TRDTestCase,
  TRDImplementationStandard,
  TRDInfrastructureComponent,
  TRDDataModel,
  CreateTRDApiEndpoint,
  CreateTRDSecurityControl,
  CreateTRDPerformanceRequirement,
  CreateTRDTestCase,
  CreateTRDImplementationStandard,
  CreateTRDInfrastructureComponent,
  CreateTRDDataModel,
  MultiItemFieldConfig 
} from '@/types/trd-multi-item'

// API Endpoints Configuration
export const apiEndpointsConfig: MultiItemFieldConfig<TRDApiEndpoint> = {
  fieldName: 'API Endpoints',
  itemType: 'API Endpoint',
  createNew: (): CreateTRDApiEndpoint => ({
    endpoint_id: '',
    endpoint_path: '',
    http_method: 'GET',
    description: '',
    request_format: {},
    response_format: {},
    authentication_required: true,
    status: 'draft',
    priority: 'medium',
    order_index: 0
  }),
  validate: (item: TRDApiEndpoint): string | null => {
    if (!item.endpoint_id?.trim()) return 'Endpoint ID is required'
    if (!item.endpoint_path?.trim()) return 'Endpoint path is required'
    if (!item.description?.trim()) return 'Description is required'
    if (!item.endpoint_id.match(/^EP-\d+$/)) {
      return 'Endpoint ID must follow format: EP-XXX (e.g., EP-001)'
    }
    if (!item.endpoint_path.startsWith('/')) {
      return 'Endpoint path must start with /'
    }
    return null
  },
  getDisplayTitle: (item: TRDApiEndpoint): string => 
    `${item.endpoint_id || 'EP-???'}: ${item.http_method || 'GET'} ${item.endpoint_path || '/path'}`,
  getDisplayPreview: (item: TRDApiEndpoint): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const priority = item.priority?.toUpperCase()
    const auth = item.authentication_required ? 'Auth Required' : 'No Auth'
    const rateLimit = item.rate_limit_requests ? `${item.rate_limit_requests}/${item.rate_limit_window}` : 'No limit'
    return `${status} • ${priority} • ${auth} • ${rateLimit}`
  },
  canReorder: true,
  maxItems: 100
}

// Security Controls Configuration
export const securityControlsConfig: MultiItemFieldConfig<TRDSecurityControl> = {
  fieldName: 'Security Controls',
  itemType: 'Security Control',
  createNew: (): CreateTRDSecurityControl => ({
    control_id: '',
    control_title: '',
    control_description: '',
    control_type: 'preventive',
    security_domain: 'application',
    implementation_method: '',
    validation_criteria: '',
    compliance_frameworks: [],
    risk_level: 'medium',
    implementation_status: 'planned',
    order_index: 0
  }),
  validate: (item: TRDSecurityControl): string | null => {
    if (!item.control_id?.trim()) return 'Control ID is required'
    if (!item.control_title?.trim()) return 'Control title is required'
    if (!item.control_description?.trim()) return 'Control description is required'
    if (!item.implementation_method?.trim()) return 'Implementation method is required'
    if (!item.validation_criteria?.trim()) return 'Validation criteria is required'
    if (!item.control_id.match(/^SEC-\d+$/)) {
      return 'Control ID must follow format: SEC-XXX (e.g., SEC-001)'
    }
    return null
  },
  getDisplayTitle: (item: TRDSecurityControl): string => 
    `${item.control_id || 'SEC-???'}: ${item.control_title || 'Untitled Control'}`,
  getDisplayPreview: (item: TRDSecurityControl): string => {
    const status = item.implementation_status?.replace('_', ' ').toUpperCase()
    const risk = item.risk_level?.toUpperCase()
    const type = item.control_type?.charAt(0).toUpperCase() + item.control_type?.slice(1)
    const domain = item.security_domain?.charAt(0).toUpperCase() + item.security_domain?.slice(1)
    const frameworks = item.compliance_frameworks?.length ? `${item.compliance_frameworks.length} frameworks` : 'No frameworks'
    return `${status} • ${risk} Risk • ${type} • ${domain} • ${frameworks}`
  },
  canReorder: true,
  maxItems: 50
}

// Performance Requirements Configuration
export const performanceRequirementsConfig: MultiItemFieldConfig<TRDPerformanceRequirement> = {
  fieldName: 'Performance Requirements',
  itemType: 'Performance Requirement',
  createNew: (): CreateTRDPerformanceRequirement => ({
    requirement_id: '',
    requirement_title: '',
    metric_type: 'response_time',
    target_value: 0,
    target_unit: 'ms',
    measurement_method: '',
    monitoring_frequency: 'continuous',
    priority: 'medium',
    status: 'defined',
    order_index: 0
  }),
  validate: (item: TRDPerformanceRequirement): string | null => {
    if (!item.requirement_id?.trim()) return 'Requirement ID is required'
    if (!item.requirement_title?.trim()) return 'Requirement title is required'
    if (!item.measurement_method?.trim()) return 'Measurement method is required'
    if (!item.target_value || item.target_value <= 0) return 'Target value must be greater than 0'
    if (!item.requirement_id.match(/^PERF-\d+$/)) {
      return 'Requirement ID must follow format: PERF-XXX (e.g., PERF-001)'
    }
    return null
  },
  getDisplayTitle: (item: TRDPerformanceRequirement): string => 
    `${item.requirement_id || 'PERF-???'}: ${item.requirement_title || 'Untitled Requirement'}`,
  getDisplayPreview: (item: TRDPerformanceRequirement): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const priority = item.priority?.toUpperCase()
    const metric = item.metric_type?.replace('_', ' ').toUpperCase()
    const target = `${item.target_value} ${item.target_unit}`
    const frequency = item.monitoring_frequency?.charAt(0).toUpperCase() + item.monitoring_frequency?.slice(1)
    return `${status} • ${priority} • ${metric} • Target: ${target} • ${frequency}`
  },
  canReorder: true,
  maxItems: 30
}

// Test Cases Configuration
export const testCasesConfig: MultiItemFieldConfig<TRDTestCase> = {
  fieldName: 'Test Cases',
  itemType: 'Test Case',
  createNew: (): CreateTRDTestCase => ({
    test_case_id: '',
    test_title: '',
    test_description: '',
    test_type: 'functional',
    test_category: 'positive',
    test_steps: '',
    expected_result: '',
    automation_status: 'manual',
    priority: 'medium',
    status: 'draft',
    order_index: 0
  }),
  validate: (item: TRDTestCase): string | null => {
    if (!item.test_case_id?.trim()) return 'Test case ID is required'
    if (!item.test_title?.trim()) return 'Test title is required'
    if (!item.test_description?.trim()) return 'Test description is required'
    if (!item.test_steps?.trim()) return 'Test steps are required'
    if (!item.expected_result?.trim()) return 'Expected result is required'
    if (!item.test_case_id.match(/^TC-\d+$/)) {
      return 'Test case ID must follow format: TC-XXX (e.g., TC-001)'
    }
    return null
  },
  getDisplayTitle: (item: TRDTestCase): string => 
    `${item.test_case_id || 'TC-???'}: ${item.test_title || 'Untitled Test'}`,
  getDisplayPreview: (item: TRDTestCase): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const priority = item.priority?.toUpperCase()
    const type = item.test_type?.replace('_', ' ').toUpperCase()
    const category = item.test_category?.replace('_', ' ').toUpperCase()
    const automation = item.automation_status?.replace('_', ' ').toUpperCase()
    const tester = item.assigned_tester ? `Assigned: ${item.assigned_tester}` : 'Unassigned'
    return `${status} • ${priority} • ${type} • ${category} • ${automation} • ${tester}`
  },
  canReorder: true,
  maxItems: 200
}

// Implementation Standards Configuration
export const implementationStandardsConfig: MultiItemFieldConfig<TRDImplementationStandard> = {
  fieldName: 'Implementation Standards',
  itemType: 'Implementation Standard',
  createNew: (): CreateTRDImplementationStandard => ({
    standard_id: '',
    standard_title: '',
    standard_description: '',
    standard_category: 'coding',
    implementation_details: '',
    compliance_criteria: '',
    validation_method: '',
    tools_required: [],
    priority: 'medium',
    enforcement_level: 'required',
    status: 'draft',
    order_index: 0
  }),
  validate: (item: TRDImplementationStandard): string | null => {
    if (!item.standard_id?.trim()) return 'Standard ID is required'
    if (!item.standard_title?.trim()) return 'Standard title is required'
    if (!item.standard_description?.trim()) return 'Standard description is required'
    if (!item.implementation_details?.trim()) return 'Implementation details are required'
    if (!item.compliance_criteria?.trim()) return 'Compliance criteria are required'
    if (!item.validation_method?.trim()) return 'Validation method is required'
    if (!item.standard_id.match(/^STD-\d+$/)) {
      return 'Standard ID must follow format: STD-XXX (e.g., STD-001)'
    }
    return null
  },
  getDisplayTitle: (item: TRDImplementationStandard): string => 
    `${item.standard_id || 'STD-???'}: ${item.standard_title || 'Untitled Standard'}`,
  getDisplayPreview: (item: TRDImplementationStandard): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const priority = item.priority?.toUpperCase()
    const category = item.standard_category?.replace('_', ' ').toUpperCase()
    const enforcement = item.enforcement_level?.toUpperCase()
    const tools = item.tools_required?.length ? `${item.tools_required.length} tools` : 'No tools'
    return `${status} • ${priority} • ${category} • ${enforcement} • ${tools}`
  },
  canReorder: true,
  maxItems: 40
}

// Infrastructure Components Configuration
export const infrastructureComponentsConfig: MultiItemFieldConfig<TRDInfrastructureComponent> = {
  fieldName: 'Infrastructure Components',
  itemType: 'Infrastructure Component',
  createNew: (): CreateTRDInfrastructureComponent => ({
    component_id: '',
    component_name: '',
    component_type: 'service',
    component_description: '',
    technology_stack: '',
    resource_requirements: {},
    scaling_configuration: {},
    monitoring_requirements: '',
    deployment_environment: 'production',
    status: 'planned',
    order_index: 0
  }),
  validate: (item: TRDInfrastructureComponent): string | null => {
    if (!item.component_id?.trim()) return 'Component ID is required'
    if (!item.component_name?.trim()) return 'Component name is required'
    if (!item.component_description?.trim()) return 'Component description is required'
    if (!item.technology_stack?.trim()) return 'Technology stack is required'
    if (!item.monitoring_requirements?.trim()) return 'Monitoring requirements are required'
    if (!item.component_id.match(/^INFRA-\d+$/)) {
      return 'Component ID must follow format: INFRA-XXX (e.g., INFRA-001)'
    }
    return null
  },
  getDisplayTitle: (item: TRDInfrastructureComponent): string => 
    `${item.component_id || 'INFRA-???'}: ${item.component_name || 'Untitled Component'}`,
  getDisplayPreview: (item: TRDInfrastructureComponent): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const type = item.component_type?.replace('_', ' ').toUpperCase()
    const env = item.deployment_environment?.toUpperCase()
    const cost = item.cost_estimate ? `$${item.cost_estimate}/${item.cost_frequency}` : 'No cost estimate'
    return `${status} • ${type} • ${env} • ${item.technology_stack} • ${cost}`
  },
  canReorder: true,
  maxItems: 50
}

// Data Models Configuration
export const dataModelsConfig: MultiItemFieldConfig<TRDDataModel> = {
  fieldName: 'Data Models',
  itemType: 'Data Model',
  createNew: (): CreateTRDDataModel => ({
    model_id: '',
    model_name: '',
    model_description: '',
    model_type: 'entity',
    schema_definition: {},
    relationships: [],
    validation_rules: '',
    status: 'draft',
    version: '1.0',
    order_index: 0
  }),
  validate: (item: TRDDataModel): string | null => {
    if (!item.model_id?.trim()) return 'Model ID is required'
    if (!item.model_name?.trim()) return 'Model name is required'
    if (!item.model_description?.trim()) return 'Model description is required'
    if (!item.validation_rules?.trim()) return 'Validation rules are required'
    if (!item.model_id.match(/^DM-\d+$/)) {
      return 'Model ID must follow format: DM-XXX (e.g., DM-001)'
    }
    return null
  },
  getDisplayTitle: (item: TRDDataModel): string => 
    `${item.model_id || 'DM-???'}: ${item.model_name || 'Untitled Model'}`,
  getDisplayPreview: (item: TRDDataModel): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const type = item.model_type?.replace('_', ' ').toUpperCase()
    const relationships = Array.isArray(item.relationships) ? `${item.relationships.length} relationships` : 'No relationships'
    const privacy = item.privacy_considerations ? 'Privacy considered' : 'No privacy notes'
    return `${status} • ${type} • v${item.version} • ${relationships} • ${privacy}`
  },
  canReorder: true,
  maxItems: 100
}

// Export all TRD configs
export const trdMultiItemConfigs = {
  api_endpoints: apiEndpointsConfig,
  security_controls: securityControlsConfig,
  performance_requirements: performanceRequirementsConfig,
  test_cases: testCasesConfig,
  implementation_standards: implementationStandardsConfig,
  infrastructure_components: infrastructureComponentsConfig,
  data_models: dataModelsConfig
}