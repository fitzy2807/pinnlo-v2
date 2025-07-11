'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

export default function StrategiesDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { user, session } = useAuth()

  const runDebug = async () => {
    const debug: any = {
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.role
      } : null,
      session: session ? {
        access_token: session.access_token ? 'present' : 'missing',
        expires_at: session.expires_at
      } : null
    }

    if (user) {
      try {
        // Test basic connection
        const { count, error: testError } = await supabase
          .from('strategies')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', user.id)

        debug.connectionTest = {
          success: !testError,
          error: testError?.message,
          count: count,
          query_attempted: 'strategies count with head request'
        }

        // Test full query
        const { data: strategiesData, error: strategiesError } = await supabase
          .from('strategies')
          .select('id, title, userId, created_by, createdAt')
          .eq('created_by', user.id)
          .limit(5)

        debug.strategiesQuery = {
          success: !strategiesError,
          error: strategiesError?.message,
          count: strategiesData?.length,
          data: strategiesData,
          query_attempted: 'full strategies select'
        }

        // Test without user filter
        const { data: allData, error: allError } = await supabase
          .from('strategies')
          .select('id, title, userId, createdAt')
          .limit(5)

        debug.allStrategiesQuery = {
          success: !allError,
          error: allError?.message,
          count: allData?.length,
          data: allData
        }

      } catch (error) {
        debug.exception = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    setDebugInfo(debug)
  }

  useEffect(() => {
    if (user) {
      runDebug()
    }
  }, [user])

  if (!user) {
    return <div className="p-4">Not authenticated</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Strategies Debug</h3>
        <button 
          onClick={runDebug}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>
      <pre className="text-xs bg-white p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}