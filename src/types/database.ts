export interface Strategy {
  id: number
  userId: string
  
  // Basic strategy fields
  title?: string
  client?: string
  description?: string
  status?: string
  progress?: number
  lastModified?: string
  
  // 24 JSONB fields (matching actual database schema)
  vision?: Record<string, any>
  okrs?: Record<string, any>
  problems?: Record<string, any>
  initiatives?: Record<string, any>
  personas?: Record<string, any>
  epics?: Record<string, any>
  customerExperience?: Record<string, any>
  experienceSections?: Record<string, any>
  userJourneys?: Record<string, any>
  features?: Record<string, any>
  roadmap?: Record<string, any>
  techRequirements?: Record<string, any>
  techStack?: Record<string, any>
  team?: Record<string, any>
  cost?: Record<string, any>
  deliveryPlan?: Record<string, any>
  strategicContext?: Record<string, any>
  valuePropositions?: Record<string, any>
  workstreams?: Record<string, any>
  technicalStacks?: Record<string, any>
  organisationalCapabilities?: Record<string, any>
  gtmPlays?: Record<string, any>
  serviceBlueprints?: Record<string, any>
  ideasBank?: Record<string, any>
  blueprintConfiguration?: Record<string, any>
  blueprint_config?: Record<string, any>
  
  // Metadata
  createdAt?: string
  updatedAt?: string
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface StrategySummary {
  id: string
  strategyId: number
  section?: string
  summary?: string
  updatedAt?: string
}