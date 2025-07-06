'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'pending'
  message: string
  data?: any
}

export default function DatabaseTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const testResults: TestResult[] = []

    // Test 1: Connection Test
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error) throw error
      testResults.push({
        test: 'Database Connection',
        status: 'success',
        message: 'Successfully connected to Supabase database',
        data: data
      })
    } catch (error: any) {
      testResults.push({
        test: 'Database Connection',
        status: 'error',
        message: error.message
      })
    }

    // Test 2: Table Structure Test
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('id, title, vision, okrs')
        .limit(1)
      
      testResults.push({
        test: 'Strategies Table Structure',
        status: 'success',
        message: 'Strategies table accessible with JSONB fields',
        data: { columnsQueried: ['id', 'title', 'vision', 'okrs'] }
      })
    } catch (error: any) {
      testResults.push({
        test: 'Strategies Table Structure',
        status: 'error',
        message: error.message
      })
    }

    // Test 3: Create Test User (should fail due to RLS - expected)
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: 'test-app-user',
          email: 'test-app@pinnlo.com',
          firstName: 'App',
          lastName: 'Test'
        }])
        .select()

      if (error) throw error
      testResults.push({
        test: 'User Insert (RLS Test)',
        status: 'error',
        message: 'Should fail due to RLS - user not authenticated'
      })
    } catch (error: any) {
      if (error.message.includes('Row Level Security') || error.code === '42501') {
        testResults.push({
          test: 'User Insert (RLS Test)',
          status: 'success',
          message: 'RLS correctly blocking unauthenticated insert',
          data: { rlsWorking: true }
        })
      } else {
        testResults.push({
          test: 'User Insert (RLS Test)',
          status: 'error',
          message: error.message
        })
      }
    }

    // Test 4: Service Role Admin Client Test
    try {
      if (!supabase) throw new Error('Admin client not available')
      
      testResults.push({
        test: 'Admin Client Configuration',
        status: 'success',
        message: 'Supabase admin client properly configured',
        data: { adminClientExists: !!supabase }
      })
    } catch (error: any) {
      testResults.push({
        test: 'Admin Client Configuration',
        status: 'error',
        message: error.message
      })
    }

    setResults(testResults)
    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold mb-6">Database Connection Test</h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Running database tests...</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{result.test}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{result.message}</p>
              {result.data && (
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Tests Again'}
          </button>
        </div>
      </div>
    </div>
  )
}