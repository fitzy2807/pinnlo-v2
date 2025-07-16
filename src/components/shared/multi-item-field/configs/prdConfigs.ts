import { 
  PRDUserStory, 
  PRDFunctionalRequirement, 
  PRDRisk, 
  PRDMilestone, 
  PRDDependency,
  PRDLinkedItem,
  CreatePRDUserStory,
  CreatePRDFunctionalRequirement,
  CreatePRDRisk,
  CreatePRDMilestone,
  CreatePRDDependency,
  CreatePRDLinkedItem,
  MultiItemFieldConfig 
} from '@/types/prd-multi-item'

// User Stories Configuration
export const userStoriesConfig: MultiItemFieldConfig<PRDUserStory> = {
  fieldName: 'User Stories',
  itemType: 'User Story',
  createNew: (): CreatePRDUserStory => ({
    title: '',
    description: '',
    acceptance_criteria: [],
    priority: 'medium',
    status: 'draft',
    story_points: undefined,
    linked_features: [],
    order_index: 0
  }),
  validate: (item: PRDUserStory): string | null => {
    if (!item.title?.trim()) return 'Title is required'
    if (!item.description?.trim()) return 'Description is required'
    if (!item.title.includes('As a') || !item.title.includes('I want') || !item.title.includes('so that')) {
      return 'Title should follow the format: "As a [user], I want [feature] so that [benefit]"'
    }
    return null
  },
  getDisplayTitle: (item: PRDUserStory): string => item.title || 'Untitled User Story',
  getDisplayPreview: (item: PRDUserStory): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const priority = item.priority?.toUpperCase()
    const points = item.story_points ? ` • ${item.story_points} pts` : ''
    return `${status} • ${priority}${points} • ${item.description?.substring(0, 80)}...`
  },
  canReorder: true,
  maxItems: 50
}

// Functional Requirements Configuration
export const functionalRequirementsConfig: MultiItemFieldConfig<PRDFunctionalRequirement> = {
  fieldName: 'Functional Requirements',
  itemType: 'Functional Requirement',
  createNew: (): CreatePRDFunctionalRequirement => ({
    requirement_id: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'draft',
    complexity: 'medium',
    dependencies: [],
    linked_user_stories: [],
    order_index: 0
  }),
  validate: (item: PRDFunctionalRequirement): string | null => {
    if (!item.requirement_id?.trim()) return 'Requirement ID is required'
    if (!item.title?.trim()) return 'Title is required'
    if (!item.description?.trim()) return 'Description is required'
    if (!item.requirement_id.match(/^REQ-\d+$/)) {
      return 'Requirement ID must follow format: REQ-XXX (e.g., REQ-001)'
    }
    return null
  },
  getDisplayTitle: (item: PRDFunctionalRequirement): string => 
    `${item.requirement_id || 'REQ-???'}: ${item.title || 'Untitled Requirement'}`,
  getDisplayPreview: (item: PRDFunctionalRequirement): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const priority = item.priority?.toUpperCase()
    const complexity = item.complexity?.toUpperCase()
    return `${status} • ${priority} • ${complexity} • ${item.description?.substring(0, 60)}...`
  },
  canReorder: true,
  maxItems: 100
}

// Risks Configuration
export const risksConfig: MultiItemFieldConfig<PRDRisk> = {
  fieldName: 'Risks & Mitigation',
  itemType: 'Risk',
  createNew: (): CreatePRDRisk => ({
    risk_title: '',
    risk_description: '',
    impact_level: 'medium',
    probability: 'medium',
    mitigation_strategy: '',
    mitigation_status: 'planned',
    owner: '',
    due_date: undefined,
    order_index: 0
  }),
  validate: (item: PRDRisk): string | null => {
    if (!item.risk_title?.trim()) return 'Risk title is required'
    if (!item.risk_description?.trim()) return 'Risk description is required'
    if (!item.mitigation_strategy?.trim()) return 'Mitigation strategy is required'
    return null
  },
  getDisplayTitle: (item: PRDRisk): string => item.risk_title || 'Untitled Risk',
  getDisplayPreview: (item: PRDRisk): string => {
    const impact = item.impact_level?.toUpperCase()
    const probability = item.probability?.toUpperCase()
    const status = item.mitigation_status?.replace('_', ' ').toUpperCase()
    const riskScore = (
      (item.impact_level === 'high' ? 3 : item.impact_level === 'medium' ? 2 : 1) *
      (item.probability === 'high' ? 3 : item.probability === 'medium' ? 2 : 1)
    )
    return `Risk Score: ${riskScore}/9 • ${impact} Impact • ${probability} Probability • ${status}`
  },
  canReorder: true,
  maxItems: 30
}

// Milestones Configuration
export const milestonesConfig: MultiItemFieldConfig<PRDMilestone> = {
  fieldName: 'Timeline & Milestones',
  itemType: 'Milestone',
  createNew: (): CreatePRDMilestone => ({
    milestone_title: '',
    milestone_description: '',
    target_date: new Date().toISOString().split('T')[0],
    status: 'not_started',
    dependencies: [],
    deliverables: [],
    owner: '',
    order_index: 0
  }),
  validate: (item: PRDMilestone): string | null => {
    if (!item.milestone_title?.trim()) return 'Milestone title is required'
    if (!item.target_date) return 'Target date is required'
    const targetDate = new Date(item.target_date)
    if (isNaN(targetDate.getTime())) return 'Valid target date is required'
    return null
  },
  getDisplayTitle: (item: PRDMilestone): string => item.milestone_title || 'Untitled Milestone',
  getDisplayPreview: (item: PRDMilestone): string => {
    const status = item.status?.replace('_', ' ').toUpperCase()
    const date = item.target_date ? new Date(item.target_date).toLocaleDateString() : 'No date'
    const owner = item.owner ? ` • ${item.owner}` : ''
    return `${status} • Due: ${date}${owner}`
  },
  canReorder: true,
  maxItems: 20
}

// Dependencies Configuration
export const dependenciesConfig: MultiItemFieldConfig<PRDDependency> = {
  fieldName: 'Dependencies',
  itemType: 'Dependency',
  createNew: (): CreatePRDDependency => ({
    dependency_title: '',
    dependency_description: '',
    dependency_type: 'technical',
    status: 'identified',
    blocking_impact: '',
    owner: '',
    target_resolution_date: undefined,
    order_index: 0
  }),
  validate: (item: PRDDependency): string | null => {
    if (!item.dependency_title?.trim()) return 'Dependency title is required'
    if (!item.dependency_description?.trim()) return 'Dependency description is required'
    return null
  },
  getDisplayTitle: (item: PRDDependency): string => item.dependency_title || 'Untitled Dependency',
  getDisplayPreview: (item: PRDDependency): string => {
    const type = item.dependency_type?.replace('_', ' ').toUpperCase()
    const status = item.status?.replace('_', ' ').toUpperCase()
    const impact = item.blocking_impact ? ` • Blocks: ${item.blocking_impact.substring(0, 30)}...` : ''
    return `${type} • ${status}${impact}`
  },
  canReorder: true,
  maxItems: 25
}

// Linked Items Configuration (for TRDs, Tasks, Features)
export const linkedItemsConfig: MultiItemFieldConfig<PRDLinkedItem> = {
  fieldName: 'Linked Items',
  itemType: 'Linked Item',
  createNew: (): CreatePRDLinkedItem => ({
    item_type: 'trd',
    item_id: '',
    item_title: '',
    relationship_type: 'related',
    order_index: 0
  }),
  validate: (item: PRDLinkedItem): string | null => {
    if (!item.item_id?.trim()) return 'Item ID is required'
    if (!item.item_title?.trim()) return 'Item title is required'
    return null
  },
  getDisplayTitle: (item: PRDLinkedItem): string => 
    `${item.item_type?.toUpperCase()}: ${item.item_title || 'Untitled Item'}`,
  getDisplayPreview: (item: PRDLinkedItem): string => {
    const relationship = item.relationship_type?.replace('_', ' ').toUpperCase()
    return `${relationship} • ID: ${item.item_id}`
  },
  canReorder: true,
  maxItems: 50
}

// Export all configs
export const prdMultiItemConfigs = {
  user_stories: userStoriesConfig,
  functional_requirements: functionalRequirementsConfig,
  risks_and_mitigation: risksConfig,
  timeline_milestones: milestonesConfig,
  dependencies: dependenciesConfig,
  linked_items: linkedItemsConfig
}