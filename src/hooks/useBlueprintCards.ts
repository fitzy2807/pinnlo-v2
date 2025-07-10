import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'

interface BlueprintCard {
  id: string
  strategy_id: string
  card_type: string
  title: string
  description: string
  priority: string
  tags: string[]
  confidence: {
    level: string
    rationale: string
  }
  blueprint_fields: any
  created_at: string
  updated_at: string
}

export function useBlueprintCards(strategyId: string | null) {
  const [cards, setCards] = useState<BlueprintCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !strategyId) {
      setLoading(false)
      return
    }

    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('cards')
          .select('*')
          .eq('strategy_id', strategyId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setCards(data || [])
      } catch (err: any) {
        console.error('Error fetching blueprint cards:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [user, strategyId, supabase])

  return { cards, loading, error }
}