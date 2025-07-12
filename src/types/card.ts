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
  // Blueprint-specific fields
  [key: string]: any
}