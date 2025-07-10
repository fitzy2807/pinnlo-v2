export interface StrategyCreatorContext {
  businessContext: string
  goals: string[]
  challenges: string[]
  constraints: string[]
}

export interface GeneratedCard {
  id: string
  title: string
  description: string
  cardType: string
  priority: 'low' | 'medium' | 'high'
  keyPoints: string[]
  blueprintFields?: Record<string, any>
  tags?: string[]
  confidence?: {
    level: 'low' | 'medium' | 'high'
    rationale: string
  }
}