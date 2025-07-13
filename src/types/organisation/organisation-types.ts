export interface OrganisationCardData {
  // Document Control
  documentControl: {
    version: string
    status: 'draft' | 'review' | 'approved' | 'deprecated'
    lastModified: string
    approvers: string[]
    changeLog: Array<{
      version: string
      date: string
      changes: string
      author: string
    }>
  }

  // Business Context
  businessContext: {
    strategicObjectives: string[]
    successMetrics: Array<{
      metric: string
      target: string
      measurement: string
    }>
    userPersonas: string[]
    marketAnalysis: string
    roiProjections: string
  }

  // Functional Requirements
  functionalRequirements: Array<{
    id: string // FR-001, FR-002, etc.
    title: string
    description: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    businessValue: 'high' | 'medium' | 'low'
    complexity: 'high' | 'medium' | 'low'
    dependencies: string[] // Array of other requirement IDs
    acceptanceCriteria: Array<{
      given: string
      when: string
      then: string
    }>
    edgeCases: string[]
    testingStrategy: Array<{
      type: 'unit' | 'integration' | 'e2e' | 'performance'
      description: string
    }>
  }>

  // Technical Architecture
  systemArchitecture: {
    serviceDecomposition: Array<{
      serviceName: string
      technology: string
      responsibilities: string[]
      dependencies: string[]
    }>
    dataLayer: {
      primary: string
      cache: string
      search: string
      messageQueue: string
    }
    apiGateway: string
    deployment: string
  }

  // Non-Functional Requirements
  performanceRequirements: Array<{
    id: string // PFR-001, PFR-002, etc.
    metric: string
    target: string
    measurementPoint: string
  }>

  scalabilityRequirements: Array<{
    id: string // SCR-001, SCR-002, etc.
    component: string
    target: string
    autoScalingTriggers: Array<{
      condition: string
      threshold: string
      action: string
    }>
  }>

  securityRequirements: Array<{
    id: string // SEC-001, SEC-002, etc.
    category: 'authentication' | 'authorization' | 'data_protection' | 'network' | 'audit'
    requirement: string
    implementation: string
  }>

  // Data Architecture
  dataModel: {
    entities: Array<{
      name: string
      schema: Record<string, any>
      relationships: Array<{
        type: 'one-to-one' | 'one-to-many' | 'many-to-many'
        target: string
        description: string
      }>
    }>
  }

  apiSpecifications: Array<{
    id: string // API-001, API-002, etc.
    endpoint: string
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    authentication: string
    rateLimit: string
    requestSchema: Record<string, any>
    responseSchema: Record<string, any>
    sideEffects: string[]
  }>

  // Quality Assurance
  testingStrategy: {
    unitTests: {
      coverageTarget: string
      framework: string
    }
    integrationTests: {
      scope: string
      tools: string[]
    }
    e2eTests: {
      criticalJourneys: string[]
      tools: string[]
    }
    performanceTests: {
      loadTarget: string
      tools: string[]
    }
    securityTests: {
      tools: string[]
      frequency: string
    }
  }

  qualityGates: Array<{
    gate: string
    criteria: string[]
    approvers: string[]
  }>

  // Operational Requirements
  monitoring: {
    applicationMetrics: string[]
    infrastructureMetrics: string[]
    businessMetrics: string[]
    alerting: {
      tool: string
      escalationPolicy: string
    }
    slaTargets: Array<{
      metric: string
      target: string
      measurement: string
    }>
  }

  deployment: {
    cicdPipeline: {
      sourceControl: string
      buildProcess: string
      testingGates: string[]
      deploymentStrategy: string
      rollbackStrategy: string
    }
    environments: Array<{
      name: string
      purpose: string
      promotionCriteria: string[]
    }>
  }

  // Risk & Compliance
  riskAssessment: Array<{
    id: string // RSK-001, RSK-002, etc.
    risk: string
    impact: 'high' | 'medium' | 'low'
    probability: 'high' | 'medium' | 'low'
    mitigation: string
  }>

  complianceRequirements: Array<{
    id: string // CMP-001, CMP-002, etc.
    standard: string
    requirements: string[]
    implementation: string
  }>

  // Implementation Roadmap
  implementationPhases: Array<{
    phase: string
    duration: string
    objectives: string[]
    deliverables: string[]
    exitCriteria: string[]
    dependencies: string[]
  }>
}

export const createOrganisationTemplate = (): OrganisationCardData => ({
  documentControl: {
    version: '1.0.0',
    status: 'draft',
    lastModified: new Date().toISOString(),
    approvers: [],
    changeLog: []
  },
  businessContext: {
    strategicObjectives: [],
    successMetrics: [],
    userPersonas: [],
    marketAnalysis: '',
    roiProjections: ''
  },
  functionalRequirements: [],
  systemArchitecture: {
    serviceDecomposition: [],
    dataLayer: {
      primary: '',
      cache: '',
      search: '',
      messageQueue: ''
    },
    apiGateway: '',
    deployment: ''
  },
  performanceRequirements: [],
  scalabilityRequirements: [],
  securityRequirements: [],
  dataModel: {
    entities: []
  },
  apiSpecifications: [],
  testingStrategy: {
    unitTests: {
      coverageTarget: '90%',
      framework: ''
    },
    integrationTests: {
      scope: '',
      tools: []
    },
    e2eTests: {
      criticalJourneys: [],
      tools: []
    },
    performanceTests: {
      loadTarget: '',
      tools: []
    },
    securityTests: {
      tools: [],
      frequency: ''
    }
  },
  qualityGates: [],
  monitoring: {
    applicationMetrics: [],
    infrastructureMetrics: [],
    businessMetrics: [],
    alerting: {
      tool: '',
      escalationPolicy: ''
    },
    slaTargets: []
  },
  deployment: {
    cicdPipeline: {
      sourceControl: '',
      buildProcess: '',
      testingGates: [],
      deploymentStrategy: '',
      rollbackStrategy: ''
    },
    environments: []
  },
  riskAssessment: [],
  complianceRequirements: [],
  implementationPhases: []
})
