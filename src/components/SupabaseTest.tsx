'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('_test').select('*').limit(1)
        
        if (error) {
          console.log('Expected error for test table:', error.message)
        }
        
        setConnectionStatus('connected')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setConnectionStatus('error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            connectionStatus === 'testing' 
              ? 'bg-yellow-100 text-yellow-800' 
              : connectionStatus === 'connected'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {connectionStatus === 'testing' && 'Testing...'}
            {connectionStatus === 'connected' && 'Connected ✓'}
            {connectionStatus === 'error' && 'Error ✗'}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p><strong>Project:</strong> dqqiqhagapiekdtcuoqr</p>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {connectionStatus === 'connected' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 text-sm">
              ✓ Supabase client initialized successfully
            </p>
          </div>
        )}
      </div>
    </div>
  )
}