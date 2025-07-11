'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

export default function TestDBConnection() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<string>('checking')
  const { user } = useAuth()

  useEffect(() => {
    console.log('🔍 Testing DB connection...')
    console.log('User:', user)
    
    if (user) {
      setAuthStatus('authenticated')
      testConnection()
    } else {
      setAuthStatus('not authenticated')
      setLoading(false)
    }
  }, [user])

  const testConnection = async () => {
    try {
      console.log('🎯 Testing strategies query...')
      
      // Test 1: Try to fetch strategies with userId
      const { data: strategiesData, error: strategiesError } = await supabase
        .from('strategies')
        .select('*')
        .eq('userId', user?.id)
        .limit(10)

      console.log('Strategies query result:', { strategiesData, strategiesError })

      if (strategiesError) {
        console.error('❌ Strategies error:', strategiesError)
        
        // Test 2: Try with user_id instead
        const { data: strategiesData2, error: strategiesError2 } = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', user?.id)
          .limit(10)

        console.log('Strategies query with user_id:', { strategiesData2, strategiesError2 })
        
        if (strategiesError2) {
          throw new Error(`Both userId and user_id failed: ${strategiesError.message}, ${strategiesError2.message}`)
        } else {
          setStrategies(strategiesData2 || [])
        }
      } else {
        setStrategies(strategiesData || [])
      }

      // Test 3: Check if table exists at all
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%strateg%')

      console.log('Tables matching "strateg":', { tablesData, tablesError })

    } catch (err: any) {
      console.error('❌ Connection test failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTestStrategy = async () => {
    try {
      console.log('🚀 Creating test strategy...')
      
      const testStrategy = {
        userId: user?.id,
        title: 'Test Strategy',
        description: 'Test strategy created from UnifiedContextSelector debugging',
        status: 'active',
        progress: 0
      }

      const { data, error } = await supabase
        .from('strategies')
        .insert([testStrategy])
        .select()

      console.log('Create strategy result:', { data, error })

      if (error) {
        throw error
      }

      // Refresh the list
      testConnection()
    } catch (err: any) {
      console.error('❌ Failed to create test strategy:', err)
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Database Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {authStatus}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>User Email:</strong> {user?.email || 'None'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Strategies Query Test</h2>
          
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              <span>Testing connection...</span>
            </div>
          ) : error ? (
            <div className="text-red-600">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Strategies found: {strategies.length}</p>
                {strategies.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {strategies.map((strategy, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <p><strong>ID:</strong> {strategy.id}</p>
                        <p><strong>Title:</strong> {strategy.title}</p>
                        <p><strong>Description:</strong> {strategy.description}</p>
                        <p><strong>User ID:</strong> {strategy.userId || strategy.user_id}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={createTestStrategy}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Test Strategy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}