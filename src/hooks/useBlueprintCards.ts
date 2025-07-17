import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BLUEPRINT_REGISTRY } from '@/components/blueprints/registry'

export function useBlueprintCards(strategyId?: string) {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!strategyId) {
      setCards([])
      setLoading(false)
      return
    }

    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔍 Fetching blueprint cards for strategy:', strategyId)
        
        // Try to fetch from cards table (without user_id filter)
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('strategy_id', strategyId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching blueprint cards:', error)
          setError(error.message)
          setCards([])
          return
        }

        console.log('📋 Raw cards from database:', data?.length || 0)
        console.log('📋 Card types found:', [...new Set(data?.map(c => c.card_type) || [])])

        // Get all blueprint types from the registry
        const blueprintTypes = Object.keys(BLUEPRINT_REGISTRY)
        
        // Create a mapping for legacy/alternative card type names
        const cardTypeMapping: Record<string, string> = {
          // Development section mappings
          'feature': 'features',
          'epic': 'epics',
          'task-list': 'features',
          'task': 'features',
          'technical-requirement-structured': 'trd',
          'technical-requirement': 'trd',
          'tech-requirements': 'trd',
          'trd': 'trd',
          'prd': 'prd',
          'product-requirements': 'prd',
          'test-scenario': 'features',
          
          // User experience mappings
          'customer-journey': 'customer-journey',
          'service-blueprint': 'serviceBlueprints',
          
          // Strategy mappings
          'value-proposition': 'valuePropositions',
          'strategic-context': 'strategicContext',
          'strategic-bet': 'strategic-bet',
          'problem-statement': 'problem-statement',
          
          // Analysis mappings
          'swot': 'swot-analysis',
          'competitive-analysis': 'competitive-analysis',
          'market-insight': 'market-insight',
          
          // Planning mappings
          'okr': 'okrs',
          'business-model': 'business-model',
          'go-to-market': 'go-to-market',
          'gtm-play': 'gtmPlays',
          'risk-assessment': 'risk-assessment',
          'roadmap': 'roadmap',
          'workstream': 'workstreams',
          
          // Measurement mappings
          'kpi': 'kpis',
          'financial-projections': 'financial-projections',
          'cost-driver': 'cost-driver',
          'revenue-driver': 'revenue-driver',
          
          // Technical mappings
          'tech-stack': 'techStack',
          'organisational-capability': 'organisationalCapabilities',
          
          // Intelligence mappings
          'market-intelligence': 'market-intelligence',
          'competitor-intelligence': 'competitor-intelligence',
          'trends-intelligence': 'trends-intelligence',
          'technology-intelligence': 'technology-intelligence',
          'stakeholder-intelligence': 'stakeholder-intelligence',
          'consumer-intelligence': 'consumer-intelligence',
          'risk-intelligence': 'risk-intelligence',
          'opportunities-intelligence': 'opportunities-intelligence'
        }
        
        console.log('📋 Registry blueprint types:', blueprintTypes.length, blueprintTypes)
        
        // Filter cards - include both registry types and mapped types
        const blueprintCards = data?.filter(card => {
          if (!card.card_type) return false
          
          // Check if it's a direct blueprint type
          if (blueprintTypes.includes(card.card_type)) return true
          
          // Check if it maps to a blueprint type
          const mappedType = cardTypeMapping[card.card_type]
          if (mappedType && blueprintTypes.includes(mappedType)) return true
          
          // Also check if the card type exists as a key in the mapping (legacy support)
          if (cardTypeMapping.hasOwnProperty(card.card_type)) return true
          
          return false
        }) || []

        console.log('✅ Filtered blueprint cards:', blueprintCards.length)
        console.log('📊 Card types in filtered results:', [...new Set(blueprintCards.map(c => c.card_type))])
        setCards(blueprintCards)
      } catch (err) {
        console.error('❌ Error in useBlueprintCards:', err)
        setError('Failed to fetch blueprint cards')
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [strategyId])

  const getCardsByBlueprint = (blueprintType: string) => {
    return cards.filter(card => 
      card.card_type && card.card_type === blueprintType
    )
  }

  return {
    cards,
    loading,
    error,
    getCardsByBlueprint
  }
}