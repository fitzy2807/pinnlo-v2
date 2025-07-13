import { Card } from '../types'

/**
 * Build a context summary from selected cards for MCP generation
 */
export function buildContextSummary(selectedCards: Card[]): string {
  if (!selectedCards || selectedCards.length === 0) {
    return 'No context cards selected'
  }

  return selectedCards.map(card => {
    const parts = [
      `[${card.card_type}] ${card.title}`,
      card.description || 'No description',
      card.priority ? `Priority: ${card.priority}` : ''
    ].filter(Boolean)

    return parts.join('\n')
  }).join('\n\n---\n\n')
}

/**
 * Build structured context for MCP generation with metadata
 */
export function buildStructuredContext(selectedCards: Card[], targetSection: string) {
  const cardsByType = selectedCards.reduce((acc, card) => {
    const type = card.card_type || 'unknown'
    if (!acc[type]) acc[type] = []
    acc[type].push(card)
    return acc
  }, {} as Record<string, Card[]>)

  const context = {
    summary: buildContextSummary(selectedCards),
    cardCount: selectedCards.length,
    cardTypes: Object.keys(cardsByType),
    targetSection,
    detailsByType: Object.entries(cardsByType).map(([type, cards]) => ({
      type,
      count: cards.length,
      titles: cards.map(c => c.title)
    }))
  }

  return context
}

/**
 * Extract key insights from cards for better generation
 */
export function extractKeyInsights(selectedCards: Card[]): string[] {
  const insights: string[] = []

  // Extract high-priority items
  const highPriorityCards = selectedCards.filter(c => c.priority === 'High')
  if (highPriorityCards.length > 0) {
    insights.push(`${highPriorityCards.length} high-priority items identified`)
  }

  // Extract cards with technical details
  const technicalCards = selectedCards.filter(c => 
    c.card_type?.includes('tech') || 
    c.card_type?.includes('requirement')
  )
  if (technicalCards.length > 0) {
    insights.push(`${technicalCards.length} technical specifications included`)
  }

  // Extract feature cards
  const featureCards = selectedCards.filter(c => c.card_type === 'feature')
  if (featureCards.length > 0) {
    insights.push(`${featureCards.length} feature definitions provided`)
  }

  return insights
}