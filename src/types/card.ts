export interface Relationship {
  id: string
  title: string
  type: 'supports' | 'relates-to' | 'conflicts-with' | 'supported-by'
}

export interface CardData {
  id: string
  title: string
  description: string
  cardType: string
  priority: 'High' | 'Medium' | 'Low'
  confidenceLevel: 'High' | 'Medium' | 'Low'
  priorityRationale?: string
  confidenceRationale?: string
  tags: string[]
  relationships: Relationship[]
  strategicAlignment: string
  createdDate: string
  lastModified: string
  creator: string
  owner: string
  group_ids?: string[]
  strategy_id?: string // Link to strategy
  created_at?: string // Alternative naming for backend compatibility
  updated_at?: string // Alternative naming for backend compatibility
  // Blueprint-specific fields
  [key: string]: any
}