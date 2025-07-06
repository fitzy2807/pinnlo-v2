'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthTest() {
  const [email, setEmail] = useState('fitzy2807+test@gmail.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage(`Success! User: ${data.user?.email}`)
      }
    } catch (err) {
      setMessage(`Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded bg-yellow-50">
      <h3 className="font-bold mb-4">Auth Test</h3>
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Sign In'}
        </button>
      </form>
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm">{message}</pre>
        </div>
      )}
    </div>
  )
}