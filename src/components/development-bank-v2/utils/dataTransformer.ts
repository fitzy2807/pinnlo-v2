import { CardData } from '@/types/card'

export function transformDevelopmentCardToIntelligence(devCard: any): CardData {
  // Transform development card structure to Intelligence Hub CardData format
  return {
    id: devCard.id,
    title: devCard.title,
    description: devCard.description,
    cardType: mapDevCardTypeToIntelligence(devCard.card_type),
    priority: devCard.priority || 'Medium',
    confidenceLevel: 'Medium',
    created_at: devCard.created_at,
    updated_at: devCard.updated_at,
    createdDate: devCard.created_at,
    lastModified: devCard.updated_at,
    creator: devCard.card_data?.creator || 'User',
    owner: devCard.card_data?.owner || devCard.card_data?.product_manager || devCard.card_data?.assigned_team || 'User',
    
    // Required CardData fields
    tags: devCard.card_data?.tags || [],
    relationships: devCard.card_data?.relationships || [],
    strategicAlignment: devCard.card_data?.strategicAlignment || '',
    
    // Map development-specific data to intelligence format
    intelligence_content: extractIntelligenceContent(devCard),
    relevance_score: calculateRelevanceScore(devCard),
    credibility_score: calculateCredibilityScore(devCard),
    key_findings: extractKeyFindings(devCard),
    
    // Preserve original development data
    card_data: {
      ...devCard.card_data,
      original_dev_type: devCard.card_type,
      // Add intelligence-specific fields
      intelligence_content: extractIntelligenceContent(devCard),
      key_findings: extractKeyFindings(devCard)
    }
  }
}

function mapDevCardTypeToIntelligence(devType: string): string {
  switch (devType) {
    case 'prd': return 'prd'
    case 'technical-requirement': return 'technical-requirement'
    case 'technical-requirement-structured': return 'technical-requirement'
    case 'task-list': return 'task-list'
    default: return 'technical-requirement'
  }
}

function extractIntelligenceContent(devCard: any): string {
  switch (devCard.card_type) {
    case 'prd':
      return devCard.card_data?.problem_statement || 
             devCard.card_data?.problem || 
             devCard.description || 
             'Product requirements document'
    case 'technical-requirement':
    case 'technical-requirement-structured':
      return devCard.card_data?.businessNeed || 
             devCard.card_data?.functionalDescription || 
             devCard.description || 
             'Technical requirements specification'
    case 'task-list':
      const tasks = devCard.card_data?.tasks || []
      const completed = tasks.filter((t: any) => t.status === 'completed').length
      return `Task management: ${completed}/${tasks.length} tasks completed. ${
        tasks.length > 0 ? `Progress: ${Math.round((completed / tasks.length) * 100)}%` : 'No tasks defined'
      }`
    default:
      return devCard.description || 'Development artifact'
  }
}

function extractKeyFindings(devCard: any): string[] {
  switch (devCard.card_type) {
    case 'prd':
      const features = devCard.card_data?.features || []
      const findings = []
      
      if (features.length > 0) {
        findings.push(`${features.length} feature${features.length > 1 ? 's' : ''} defined`)
        // Add first few features as findings
        features.slice(0, 3).forEach((feature: any) => {
          const featureText = typeof feature === 'string' ? feature : feature.title || feature.name
          if (featureText) findings.push(`Feature: ${featureText}`)
        })
      }
      
      if (devCard.card_data?.acceptance_criteria?.length > 0) {
        findings.push(`${devCard.card_data.acceptance_criteria.length} acceptance criteria defined`)
      }
      
      return findings.length > 0 ? findings : ['Product requirements documented']
      
    case 'technical-requirement':
    case 'technical-requirement-structured':
      const techFindings = []
      
      if (devCard.card_data?.constraints) {
        techFindings.push(`Constraints: ${devCard.card_data.constraints}`)
      }
      
      if (devCard.card_data?.assumptions) {
        techFindings.push(`Assumptions: ${devCard.card_data.assumptions}`)
      }
      
      if (devCard.card_data?.documentControl?.approvalStatus) {
        techFindings.push(`Status: ${devCard.card_data.documentControl.approvalStatus}`)
      }
      
      return techFindings.length > 0 ? techFindings : ['Technical requirements specified']
      
    case 'task-list':
      const tasks = devCard.card_data?.tasks || []
      const taskFindings = []
      
      if (tasks.length > 0) {
        const completed = tasks.filter((t: any) => t.status === 'completed').length
        const inProgress = tasks.filter((t: any) => t.status === 'in-progress').length
        const pending = tasks.filter((t: any) => t.status === 'todo' || t.status === 'pending').length
        
        taskFindings.push(`${completed} completed, ${inProgress} in progress, ${pending} pending`)
        
        // Add completed tasks as findings
        tasks.filter((t: any) => t.status === 'completed').slice(0, 3).forEach((task: any) => {
          taskFindings.push(`✓ ${task.title}`)
        })
      }
      
      return taskFindings.length > 0 ? taskFindings : ['Task list created']
      
    default:
      return ['Development artifact created']
  }
}

function calculateRelevanceScore(devCard: any): number {
  // Calculate relevance based on development card data
  switch (devCard.card_type) {
    case 'prd':
      const features = devCard.card_data?.features || []
      return Math.min(10, Math.max(1, features.length))
      
    case 'technical-requirement':
    case 'technical-requirement-structured':
      const hasConstraints = devCard.card_data?.constraints ? 2 : 0
      const hasAssumptions = devCard.card_data?.assumptions ? 2 : 0
      const statusScore = getStatusScore(devCard.card_data?.status || devCard.card_data?.documentControl?.approvalStatus)
      return Math.min(10, Math.max(1, 5 + hasConstraints + hasAssumptions + statusScore))
      
    case 'task-list':
      const tasks = devCard.card_data?.tasks || []
      if (tasks.length === 0) return 3
      
      const completed = tasks.filter((t: any) => t.status === 'completed').length
      const completionRate = completed / tasks.length
      return Math.min(10, Math.max(1, Math.round(completionRate * 10)))
      
    default:
      return 5
  }
}

function calculateCredibilityScore(devCard: any): number {
  // Calculate credibility based on status and version
  const status = devCard.card_data?.status || 
                devCard.card_data?.documentControl?.approvalStatus || 
                'draft'
  
  return getStatusScore(status)
}

function getStatusScore(status: string): number {
  switch (status?.toLowerCase()) {
    case 'approved': return 9
    case 'review': return 7
    case 'in-progress': return 6
    case 'draft': return 5
    case 'pending': return 4
    default: return 5
  }
}

export function transformDevelopmentCardsToIntelligence(devCards: any[]): CardData[] {
  return devCards.map(transformDevelopmentCardToIntelligence)
}

export function transformIntelligenceToDevelopmentCard(intelliCard: CardData): any {
  // Transform Intelligence card format back to Development format
  const originalDevType = intelliCard.card_data?.original_dev_type || intelliCard.cardType
  
  return {
    id: intelliCard.id,
    title: intelliCard.title,
    description: intelliCard.description,
    card_type: originalDevType,
    priority: intelliCard.priority,
    created_at: intelliCard.created_at,
    updated_at: intelliCard.updated_at,
    // Preserve all card_data, but remove intelligence-specific additions
    card_data: {
      ...intelliCard.card_data,
      // Remove fields we added during transformation
      original_dev_type: undefined,
      intelligence_content: undefined,
      key_findings: undefined
    }
  }
}