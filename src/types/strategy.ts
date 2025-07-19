export interface Strategy {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  user_id: string
  creator?: string
  status?: 'active' | 'archived' | 'draft'
  color?: string
  tags?: string[]
}

export interface CreateStrategyData {
  title: string
  description: string
}

export interface UpdateStrategyData {
  title?: string
  description?: string
  status?: 'active' | 'archived' | 'draft'
  color?: string
  tags?: string[]
}

export interface StrategyContextType {
  currentStrategy: Strategy | null
  strategies: Strategy[]
  setCurrentStrategy: (strategy: Strategy | null) => void
  createStrategy: (data: CreateStrategyData) => Promise<Strategy>
  updateStrategy: (id: string, data: UpdateStrategyData) => Promise<Strategy>
  deleteStrategy: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
  hasStrategies: boolean
}

export interface StrategyApiResponse {
  success: boolean
  data?: Strategy | Strategy[]
  error?: string
}