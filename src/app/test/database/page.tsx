'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DatabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [strategies, setStrategies] = useState<any[]>([])
  const [cards, setCards] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testDatabaseConnection()
  }, [])

  const testDatabaseConnection = async () => {
    try {
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      
      setUserInfo(user)
      setConnectionStatus('✅ Connected')

      // Test 2: Check strategies table
      const { data: strategiesData, error: strategiesError } = await supabase
        .from('strategies')
        .select('*')
        .limit(5)

      if (strategiesError) throw strategiesError
      setStrategies(strategiesData || [])

      // Test 3: Check cards table (this will tell us if migration worked)
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .limit(5)

      if (cardsError) {
        if (cardsError.message.includes('relation "cards" does not exist')) {
          setError('Cards table does not exist. Please run the migration script.')
        } else {
          throw cardsError
        }
      } else {
        setCards(cardsData || [])
      }

    } catch (err) {
      console.error('Database test error:', err)
      setConnectionStatus('❌ Connection failed')
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const runSampleInsert = async () => {
    if (strategies.length === 0) {
      alert('No strategies found. Please create a strategy first.')
      return
    }

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([
          {
            strategy_id: strategies[0].id,
            title: 'Test Card from Database Test',
            description: 'This card was created from the database test page.',
            card_type: 'strategic-context',
            priority: 'Medium',
            confidence_level: 'High',
            strategic_alignment: 'Testing database integration',
            tags: ['Test', 'Database'],
            card_data: {
              marketContext: 'Test market context',
              competitiveLandscape: 'Test competitive landscape',
              keyTrends: ['Test trend'],
              stakeholders: ['Test user'],
              timeframe: '6 months'
            }
          }
        ])
        .select()

      if (error) throw error
      
      alert('✅ Sample card created successfully!')
      testDatabaseConnection() // Refresh data
    } catch (err) {
      alert(`❌ Failed to create card: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Connection Test</h1>

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
          <p className="text-lg">{connectionStatus}</p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </p>
              {error.includes('Cards table does not exist') && (
                <div className="mt-3">
                  <p className="text-red-700 text-sm mb-2">
                    <strong>Solution:</strong> Run the migration script in Supabase:
                  </p>
                  <ol className="text-red-700 text-sm list-decimal list-inside space-y-1">
                    <li>Go to your Supabase dashboard</li>
                    <li>Navigate to SQL Editor</li>
                    <li>Copy and paste the content from <code>MIGRATION_SCRIPT.sql</code></li>
                    <li>Run the script</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          {userInfo ? (
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>User ID:</strong> <code className="bg-gray-100 px-1 rounded">{userInfo.id}</code></p>
              <p><strong>Last Sign In:</strong> {new Date(userInfo.last_sign_in_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-gray-600">No user information available</p>
          )}
        </div>

        {/* Strategies */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">Strategies Table</h2>
          {strategies.length > 0 ? (
            <div>
              <p className="text-green-600 mb-3">✅ Found {strategies.length} strategies</p>
              <div className="space-y-2">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium">{strategy.title}</p>
                    <p className="text-sm text-gray-600">ID: <code>{strategy.id}</code></p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No strategies found</p>
          )}
        </div>

        {/* Cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cards Table</h2>
            {strategies.length > 0 && (
              <button
                onClick={runSampleInsert}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Create Test Card
              </button>
            )}
          </div>
          
          {!error && cards.length > 0 ? (
            <div>
              <p className="text-green-600 mb-3">✅ Found {cards.length} cards</p>
              <div className="space-y-2">
                {cards.map((card) => (
                  <div key={card.id} className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium">{card.title}</p>
                    <p className="text-sm text-gray-600">
                      Type: {card.card_type} | Priority: {card.priority}
                    </p>
                    <p className="text-xs text-gray-500">ID: <code>{card.id}</code></p>
                  </div>
                ))}
              </div>
            </div>
          ) : !error ? (
            <p className="text-gray-600">No cards found</p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-3">
            <button
              onClick={testDatabaseConnection}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Refresh Test
            </button>
            <a
              href="/test/cards"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Go to Cards Test
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}