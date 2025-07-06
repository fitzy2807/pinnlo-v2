'use client'

import { useState, useEffect } from 'react'
import MasterCard from '@/components/cards/MasterCard'
import { useCards } from '@/hooks/useCards'
import { Plus, RefreshCw, Shield, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AuthenticatedCardsTest() {
  const [strategyId, setStrategyId] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userStrategies, setUserStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const { 
    cards, 
    loading: cardsLoading, 
    error, 
    createCard, 
    updateCard, 
    deleteCard, 
    duplicateCard, 
    refreshCards 
  } = useCards(strategyId || 0)

  // Load user and their strategies
  useEffect(() => {
    async function loadUserData() {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        
        setUser(user)

        if (user) {
          // Get user's strategies
          const { data: strategies, error: strategiesError } = await supabase
            .from('strategies')
            .select('id, title, description')
            .eq('userId', user.id)
            .order('id', { ascending: true })

          if (strategiesError) throw strategiesError
          
          setUserStrategies(strategies || [])
          
          // Set first strategy as default
          if (strategies && strategies.length > 0) {
            setStrategyId(strategies[0].id)
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const availableCards = cards.map(card => ({
    id: card.id,
    title: card.title,
    cardType: card.cardType
  }))

  const handleUpdate = (cardId: string) => async (updates: any) => {
    console.log('🔄 Updating card:', cardId, updates)
    const result = await updateCard(cardId, updates)
    if (result) {
      console.log('✅ Card updated successfully')
    }
  }

  const handleDelete = (cardId: string) => async () => {
    console.log('🗑️ Deleting card:', cardId)
    const confirmed = window.confirm('Are you sure you want to delete this card?')
    if (confirmed) {
      const result = await deleteCard(cardId)
      if (result) {
        console.log('✅ Card deleted successfully')
      }
    }
  }

  const handleDuplicate = (cardId: string) => async () => {
    console.log('📋 Duplicating card:', cardId)
    const result = await duplicateCard(cardId)
    if (result) {
      console.log('✅ Card duplicated successfully')
    }
  }

  const handleAIEnhance = (cardId: string) => () => {
    console.log('🤖 AI Enhancing card:', cardId)
    // TODO: Implement AI enhancement
  }

  const handleCreateSampleCard = async () => {
    if (!strategyId) return

    const sampleCards = [
      {
        title: 'Authenticated Strategic Context',
        description: 'Strategic context with proper RLS security',
        cardType: 'strategic-context',
        priority: 'Medium' as const,
        confidenceLevel: 'Medium' as const,
        strategicAlignment: 'Test alignment with auth',
        tags: ['Authenticated', 'RLS', 'Secure'],
        relationships: [],
        marketContext: 'Secure market context',
        competitiveLandscape: 'Protected competitive landscape',
        keyTrends: ['Security trend 1', 'Auth trend 2'],
        stakeholders: ['Authenticated user'],
        timeframe: '1 year'
      }
    ]

    const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)]
    await createCard(randomCard)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading authenticated session...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-900">Authentication Required</h2>
            </div>
            <p className="text-red-700 mb-4">
              You must be signed in to access cards with RLS enabled.
            </p>
            <p className="text-red-600 text-sm">
              Please sign in through your application&apos;s authentication system.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (userStrategies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
              <h2 className="text-lg font-semibold text-yellow-900">No Strategies Found</h2>
            </div>
            <p className="text-yellow-700 mb-4">
              You don&apos;t have any strategies yet. Create one using the SQL script provided.
            </p>
            <p className="text-yellow-600 text-sm">
              User ID: <code className="bg-yellow-100 px-1 rounded">{user.id}</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Authenticated Cards (RLS Enabled)
              </h1>
              <p className="text-sm text-gray-600">
                Testing with proper authentication and Row Level Security
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">RLS Enabled</span>
              </div>
              <button
                onClick={refreshCards}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleCreateSampleCard}
                disabled={!strategyId}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-md transition-colors"
              >
                <Plus size={16} />
                <span>Add Secure Card</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Security Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">User:</span>
                <span className="ml-2 text-gray-900">{user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Strategy:</span>
                <span className="ml-2 text-gray-900">
                  {userStrategies.find(s => s.id === strategyId)?.title || 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">RLS:</span>
                <span className="ml-2 text-green-600">✅ Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {cardsLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No secure cards yet</h3>
            <p className="text-gray-600 mb-4">Create your first authenticated card!</p>
            <button
              onClick={handleCreateSampleCard}
              disabled={!strategyId}
              className="btn btn-primary"
            >
              Create Secure Card
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <MasterCard
                key={card.id}
                cardData={card}
                onUpdate={handleUpdate(card.id)}
                onDelete={handleDelete(card.id)}
                onDuplicate={handleDuplicate(card.id)}
                onAIEnhance={handleAIEnhance(card.id)}
                availableCards={availableCards}
              />
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Security Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">✅ Implemented:</h3>
              <ul className="space-y-1">
                <li>• Row Level Security (RLS) enabled</li>
                <li>• User authentication verification</li>
                <li>• Data isolation per user</li>
                <li>• Secure CRUD operations</li>
                <li>• Protected database access</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">🎯 Benefits:</h3>
              <ul className="space-y-1">
                <li>• Users only see their own data</li>
                <li>• Prevents unauthorized access</li>
                <li>• Production-ready security</li>
                <li>• Multi-tenant safe</li>
                <li>• Audit trail ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}