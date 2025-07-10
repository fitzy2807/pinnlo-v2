'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  IntelligenceCard,
  CreateIntelligenceCardData,
  UpdateIntelligenceCardData,
  IntelligenceCardFilters,
  IntelligenceCardsResponse
} from '@/types/intelligence-cards'
import {
  createIntelligenceCard,
  loadIntelligenceCards,
  loadIntelligenceCard,
  updateIntelligenceCard,
  deleteIntelligenceCard,
  archiveIntelligenceCard,
  saveIntelligenceCard,
  restoreIntelligenceCard,
  getCardCountsByCategory,
  getCardCountsByStatus
} from '@/lib/intelligence-cards-api'

/**
 * Hook for loading and managing multiple intelligence cards
 */
export function useIntelligenceCards(filters?: IntelligenceCardFilters) {
  const [cards, setCards] = useState<IntelligenceCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const loadCards = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await loadIntelligenceCards(filters)

    if (result.success && result.data) {
      setCards(result.data.cards)
      setTotal(result.data.total)
      setHasMore(result.data.hasMore)
    } else {
      setError(result.error || 'Failed to load intelligence cards')
    }

    setLoading(false)
  }, [filters])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  const refresh = () => {
    loadCards()
  }

  return {
    cards,
    loading,
    error,
    hasMore,
    total,
    refresh
  }
}

/**
 * Hook for loading a single intelligence card
 */
export function useIntelligenceCard(id: string | null) {
  const [card, setCard] = useState<IntelligenceCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setCard(null)
      return
    }

    const loadCard = async () => {
      setLoading(true)
      setError(null)

      const result = await loadIntelligenceCard(id)

      if (result.success && result.data) {
        setCard(result.data)
      } else {
        setError(result.error || 'Failed to load intelligence card')
      }

      setLoading(false)
    }

    loadCard()
  }, [id])

  return { card, loading, error }
}

/**
 * Hook for creating intelligence cards
 */
export function useCreateIntelligenceCard() {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (cardData: CreateIntelligenceCardData) => {
    setCreating(true)
    setError(null)

    const result = await createIntelligenceCard(cardData)

    if (!result.success) {
      setError(result.error || 'Failed to create intelligence card')
    }

    setCreating(false)
    return result
  }

  return {
    create,
    creating,
    error
  }
}

/**
 * Hook for updating intelligence cards
 */
export function useUpdateIntelligenceCard() {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = async (id: string, updates: UpdateIntelligenceCardData) => {
    setUpdating(true)
    setError(null)

    const result = await updateIntelligenceCard(id, updates)

    if (!result.success) {
      setError(result.error || 'Failed to update intelligence card')
    }

    setUpdating(false)
    return result
  }

  return {
    update,
    updating,
    error
  }
}

/**
 * Hook for card actions (save, archive, delete, restore)
 */
export function useIntelligenceCardActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performAction = async (
    action: 'save' | 'archive' | 'delete' | 'restore',
    cardId: string
  ) => {
    setLoading(true)
    setError(null)

    let result
    switch (action) {
      case 'save':
        result = await saveIntelligenceCard(cardId)
        break
      case 'archive':
        result = await archiveIntelligenceCard(cardId)
        break
      case 'delete':
        result = await deleteIntelligenceCard(cardId)
        break
      case 'restore':
        result = await restoreIntelligenceCard(cardId)
        break
    }

    if (!result.success) {
      setError(result.error || `Failed to ${action} card`)
    }

    setLoading(false)
    return result
  }

  return {
    save: (id: string) => performAction('save', id),
    archive: (id: string) => performAction('archive', id),
    delete: (id: string) => performAction('delete', id),
    restore: (id: string) => performAction('restore', id),
    loading,
    error
  }
}

/**
 * Hook for getting card counts by category
 */
export function useIntelligenceCardCounts() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCounts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [categoryResult, statusResult] = await Promise.all([
        getCardCountsByCategory(),
        getCardCountsByStatus()
      ])

      if (categoryResult.success && categoryResult.data) {
        setCategoryCounts(categoryResult.data)
      }

      if (statusResult.success && statusResult.data) {
        setStatusCounts(statusResult.data)
      }

      if (!categoryResult.success || !statusResult.success) {
        setError('Failed to load card counts')
      }
    } catch (err) {
      setError('Failed to load card counts')
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  const refresh = () => {
    loadCounts()
  }

  return {
    categoryCounts,
    statusCounts,
    loading,
    error,
    refresh
  }
}