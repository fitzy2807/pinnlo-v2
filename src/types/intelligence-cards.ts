/**
 * Intelligence Cards Type Definitions
 * 
 * Complete type system for the Intelligence Card template
 * supporting all categories and input sources
 */

/**
 * Intelligence Card category types
 * Maps to the 8 main Intelligence Bank categories
 */
export enum IntelligenceCardCategory {
  MARKET = 'market',
  COMPETITOR = 'competitor',
  TRENDS = 'trends',
  TECHNOLOGY = 'technology',
  STAKEHOLDER = 'stakeholder',
  CONSUMER = 'consumer',
  RISK = 'risk',
  OPPORTUNITIES = 'opportunities'
}

/**
 * Intelligence Card status types
 * Controls visibility and organization
 */
export enum IntelligenceCardStatus {
  ACTIVE = 'active',      // Default, shown in category views
  SAVED = 'saved',        // Shown in saved section
  ARCHIVED = 'archived'   // Shown in archive section
}

/**
 * Complete Intelligence Card interface matching database schema
 * All fields are in snake_case to match Supabase conventions
 */
export interface IntelligenceCard {
  // Core fields
  id: string
  user_id: string
  category: IntelligenceCardCategory
  
  // Required template fields
  title: string
  summary: string
  intelligence_content: string
  
  // Optional template fields
  key_findings: string[]
  source_reference?: string
  date_accessed?: string
  credibility_score?: number  // 1-10
  relevance_score?: number    // 1-10
  relevant_blueprint_pages: string[]
  strategic_implications?: string
  recommended_actions?: string
  tags: string[]
  
  // Status and metadata
  status: IntelligenceCardStatus
  created_at: string
  updated_at: string
}

/**
 * Data required to create a new Intelligence Card
 * Omits auto-generated fields
 */
export interface CreateIntelligenceCardData {
  category: IntelligenceCardCategory
  title: string
  summary: string
  intelligence_content: string
  key_findings?: string[]
  source_reference?: string
  date_accessed?: string
  credibility_score?: number
  relevance_score?: number
  relevant_blueprint_pages?: string[]
  strategic_implications?: string
  recommended_actions?: string
  tags?: string[]
  status?: IntelligenceCardStatus  // Defaults to 'active' if not provided
}

/**
 * Data for updating an existing Intelligence Card
 * All fields optional to allow partial updates
 */
export interface UpdateIntelligenceCardData {
  title?: string
  summary?: string
  intelligence_content?: string
  key_findings?: string[]
  source_reference?: string
  date_accessed?: string
  credibility_score?: number
  relevance_score?: number
  relevant_blueprint_pages?: string[]
  strategic_implications?: string
  recommended_actions?: string
  tags?: string[]
  status?: IntelligenceCardStatus
}

/**
 * Filters for loading Intelligence Cards
 * Used for search, filtering, and pagination
 */
export interface IntelligenceCardFilters {
  category?: IntelligenceCardCategory
  status?: IntelligenceCardStatus
  tags?: string[]
  searchQuery?: string
  minCredibilityScore?: number
  minRelevanceScore?: number
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

/**
 * Response format for paginated card lists
 */
export interface IntelligenceCardsResponse {
  cards: IntelligenceCard[]
  total: number
  hasMore: boolean
}

/**
 * Category metadata for UI display
 */
export interface CategoryMetadata {
  id: IntelligenceCardCategory
  name: string
  description: string
  icon?: string
  color?: string
}

/**
 * Helper type for category display names
 */
export const CATEGORY_DISPLAY_NAMES: Record<IntelligenceCardCategory, string> = {
  [IntelligenceCardCategory.MARKET]: 'Market',
  [IntelligenceCardCategory.COMPETITOR]: 'Competitor',
  [IntelligenceCardCategory.TRENDS]: 'Trends',
  [IntelligenceCardCategory.TECHNOLOGY]: 'Technology',
  [IntelligenceCardCategory.STAKEHOLDER]: 'Stakeholder',
  [IntelligenceCardCategory.CONSUMER]: 'Consumer',
  [IntelligenceCardCategory.RISK]: 'Risk',
  [IntelligenceCardCategory.OPPORTUNITIES]: 'Opportunities'
}

/**
 * Helper type for status display names
 */
export const STATUS_DISPLAY_NAMES: Record<IntelligenceCardStatus, string> = {
  [IntelligenceCardStatus.ACTIVE]: 'Active',
  [IntelligenceCardStatus.SAVED]: 'Saved',
  [IntelligenceCardStatus.ARCHIVED]: 'Archived'
}

/**
 * Type guard to check if a string is a valid category
 */
export function isValidCategory(category: string): category is IntelligenceCardCategory {
  return Object.values(IntelligenceCardCategory).includes(category as IntelligenceCardCategory)
}

/**
 * Type guard to check if a string is a valid status
 */
export function isValidStatus(status: string): status is IntelligenceCardStatus {
  return Object.values(IntelligenceCardStatus).includes(status as IntelligenceCardStatus)
}

// Import for Intelligence Groups integration
import { IntelligenceGroup } from './intelligence-groups'

// Extended interface for cards with group associations
export interface IntelligenceCardWithGroups extends IntelligenceCard {
  groups?: IntelligenceGroup[]
}