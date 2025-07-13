import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

        // Filter for blueprint-type cards based on exact blueprint IDs
        const blueprintTypes = [
          'strategic-context',
          'vision',
          'value-proposition',
          'personas',
          'customer-journey',
          'swot-analysis',
          'competitive-analysis',
          'okrs',
          'business-model',
          'go-to-market',
          'risk-assessment',
          'roadmap',
          'kpis',
          'financial-projections',
          'workstream'
        ]
        
        const blueprintCards = data?.filter(card => 
          card.card_type && blueprintTypes.includes(card.card_type)
        ) || []

        console.log('✅ Filtered blueprint cards:', blueprintCards.length)
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