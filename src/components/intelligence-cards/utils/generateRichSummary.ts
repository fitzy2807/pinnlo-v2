/**
 * Rich summary generation for desktop intelligence cards
 * Creates executive-ready summaries with business metrics
 */

import { CardData } from '@/types/card'

export interface RichPreviewData {
  headline: string          // 2 lines, impact-focused
  summary: string          // 4-5 lines, business context
  keyMetrics: {
    primary: string        // Main impact number
    secondary?: string     // Supporting metric
  }
  insights: {
    preview: string[]      // 2-3 top insights
    total: number         // Total count
  }
  metadata: {
    views?: number
    lastUpdated?: Date
    savedBy?: string[]
  }
}

/**
 * Extract business metrics from intelligence content
 */
function extractBusinessMetrics(content: string): { primary: string; secondary?: string } {
  // Look for percentage patterns
  const percentPattern = /(\d+(?:\.\d+)?%)/g
  const percentages = content.match(percentPattern) || []
  
  // Look for numeric patterns with context
  const metricPattern = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(increase|decrease|growth|reduction|improvement|jump|rise|fall)/gi
  const metrics = content.match(metricPattern) || []
  
  // Look for comparison patterns
  const comparisonPattern = /(\d+x|doubled|tripled|quadrupled)/gi
  const comparisons = content.match(comparisonPattern) || []
  
  // Prioritize percentages as primary metric
  if (percentages.length > 0) {
    return {
      primary: percentages[0],
      secondary: percentages[1] || metrics[0]
    }
  }
  
  // Use other metrics if no percentages
  if (metrics.length > 0) {
    return {
      primary: metrics[0],
      secondary: metrics[1]
    }
  }
  
  // Use comparisons as fallback
  if (comparisons.length > 0) {
    return {
      primary: comparisons[0]
    }
  }
  
  return { primary: '' }
}

/**
 * Generate impact-focused headline
 */
function generateImpactHeadline(title: string, metrics: { primary: string; secondary?: string }): string {
  // If we have a strong metric, lead with it
  if (metrics.primary && metrics.primary.includes('%')) {
    // Extract the context around the metric
    const words = title.split(' ')
    const keyWords = words.filter(w => w.length > 4).slice(0, 4).join(' ')
    return `${keyWords} Drives ${metrics.primary} Impact`
  }
  
  // Otherwise, clean up and shorten the title
  const cleanTitle = title
    .replace(/intelligence card/i, '')
    .replace(/analysis/i, '')
    .replace(/report/i, '')
    .trim()
  
  // Ensure it fits in 2 lines (roughly 60 chars)
  if (cleanTitle.length > 60) {
    return cleanTitle.substring(0, 57) + '...'
  }
  
  return cleanTitle
}

/**
 * Generate executive summary for desktop viewing
 */
function generateExecutiveSummary(card: CardData, maxLines: number = 5): string {
  const content = card.intelligence_content || card.description || card.summary || ''
  
  // Remove extra whitespace and line breaks
  const cleanContent = content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
  
  // Split into sentences
  const sentences = cleanContent.match(/[^.!?]+[.!?]+/g) || [cleanContent]
  
  // Build summary sentence by sentence until we reach line limit
  let summary = ''
  const avgCharsPerLine = 65 // Approximate for desktop
  const maxChars = avgCharsPerLine * maxLines
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (summary.length + trimmedSentence.length <= maxChars) {
      summary += (summary ? ' ' : '') + trimmedSentence
    } else {
      // Add partial sentence if we have room
      const remainingChars = maxChars - summary.length
      if (remainingChars > 20) {
        summary += ' ' + trimmedSentence.substring(0, remainingChars - 3) + '...'
      }
      break
    }
  }
  
  return summary || 'No summary available'
}

/**
 * Rank insights by relevance and impact
 */
function rankInsightsByRelevance(insights: string[] = []): string[] {
  if (!insights || insights.length === 0) return []
  
  // Score each insight based on business impact keywords
  const impactKeywords = [
    'increase', 'decrease', 'growth', 'reduction', 'improvement',
    'revenue', 'cost', 'profit', 'efficiency', 'customer',
    'market', 'competitive', 'strategic', 'opportunity', 'risk'
  ]
  
  const scoredInsights = insights.map(insight => {
    const lowerInsight = insight.toLowerCase()
    let score = 0
    
    // Check for metrics
    if (/\d+%/.test(insight)) score += 3
    if (/\$\d+/.test(insight)) score += 3
    if (/\d+x/.test(insight)) score += 2
    
    // Check for impact keywords
    impactKeywords.forEach(keyword => {
      if (lowerInsight.includes(keyword)) score += 1
    })
    
    // Prefer shorter, punchier insights
    if (insight.length < 100) score += 1
    
    return { insight, score }
  })
  
  // Sort by score and return top insights
  return scoredInsights
    .sort((a, b) => b.score - a.score)
    .map(item => item.insight)
}

/**
 * Main function to generate desktop-optimized preview data
 */
export async function generateDesktopSummary(card: CardData): Promise<RichPreviewData> {
  // Extract metrics
  const metrics = extractBusinessMetrics(
    card.intelligence_content || card.description || ''
  )
  
  // Generate headline
  const headline = generateImpactHeadline(card.title, metrics)
  
  // Generate summary
  const summary = generateExecutiveSummary(card, 5)
  
  // Get top insights
  const topInsights = rankInsightsByRelevance(card.key_findings)
    .slice(0, 3)
    .map(insight => {
      // Truncate long insights for preview
      if (insight.length > 80) {
        return insight.substring(0, 77) + '...'
      }
      return insight
    })
  
  return {
    headline,
    summary,
    keyMetrics: metrics,
    insights: {
      preview: topInsights,
      total: card.key_findings?.length || 0
    },
    metadata: {
      lastUpdated: new Date(card.updated_at || card.lastModified || Date.now()),
      // Views and savedBy would come from a separate API/hook
      views: 0,
      savedBy: []
    }
  }
}

/**
 * Fallback for when AI generation isn't available
 */
export function generateFallbackSummary(card: CardData): RichPreviewData {
  const content = card.intelligence_content || card.description || card.summary || ''
  
  return {
    headline: card.title.substring(0, 60),
    summary: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
    keyMetrics: { primary: '' },
    insights: {
      preview: (card.key_findings || []).slice(0, 2),
      total: card.key_findings?.length || 0
    },
    metadata: {
      lastUpdated: new Date(card.updated_at || card.lastModified || Date.now())
    }
  }
}