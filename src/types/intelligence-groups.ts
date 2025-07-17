export interface IntelligenceGroup {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
  card_count: number
  last_used_at: string
}

export interface IntelligenceGroupCard {
  id: string
  group_id: string
  card_id: string
  added_at: string
  added_by?: string
  position: number
}

export interface CreateIntelligenceGroupData {
  name: string
  description?: string
  color?: string
}

export interface UpdateIntelligenceGroupData {
  name?: string
  description?: string
  color?: string
}

export interface IntelligenceGroupWithCards extends IntelligenceGroup {
  intelligence_cards?: Array<{
    card_id: string
    added_at: string
    position: number
  }>
}