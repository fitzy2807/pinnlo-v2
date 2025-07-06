'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SimpleCardsTest() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const testDirectQuery = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      // Test 1: Direct strategy query
      const { data: strategies, error: stratError } = await supabase
        .from('strategies')
        .select('id, title')
        .limit(5)

      if (stratError) {
        setResult(`❌ Strategy Error: ${stratError.message}`)
        return
      }

      console.log('Strategies found:', strategies)

      // Test 2: Direct cards query
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .limit(5)

      if (cardsError) {
        setResult(`❌ Cards Error: ${cardsError.message}`)
        return
      }

      console.log('Cards found:', cards)

      // Test 3: Create a test card if we have strategies
      if (strategies && strategies.length > 0) {
        const { data: newCard, error: insertError } = await supabase
          .from('cards')
          .insert([
            {
              strategy_id: strategies[0].id,
              title: 'Test Card ' + Date.now(),
              description: 'Created by simple test',
              card_type: 'strategic-context',
              priority: 'Medium',
              confidence_level: 'High',
              tags: ['Test'],
              card_data: { test: true }
            }
          ])
          .select()
          .single()

        if (insertError) {
          setResult(`❌ Insert Error: ${insertError.message}`)
          return
        }

        setResult(`✅ Success! 
Strategies found: ${strategies.length}
Cards found: ${cards?.length || 0}
New card created: ${newCard.title}
Card ID: ${newCard.id}`)
      } else {
        setResult(`❌ No strategies found. Please check your database.`)
      }

    } catch (err) {
      setResult(`❌ Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple Cards Database Test</h1>
        
        <div className="bg-white p-6 rounded-lg border">
          <button
            onClick={testDirectQuery}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </button>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>This test will:</strong></p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Query the strategies table directly</li>
            <li>Query the cards table directly</li>
            <li>Create a test card if strategies exist</li>
            <li>Show detailed results</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
