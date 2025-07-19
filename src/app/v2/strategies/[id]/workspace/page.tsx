'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import V2WorkspaceLayout from '@/components/v2/layout/V2WorkspaceLayout'
import { useStrategies } from '@/hooks/useStrategies'

export default function V2WorkspacePage() {
  const params = useParams()
  const { strategies } = useStrategies()
  const strategyId = parseInt(params.id as string)
  
  // Find the current strategy
  const currentStrategy = strategies.find(s => s.id === strategyId)
  
  if (!currentStrategy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Strategy Not Found</h1>
          <p className="text-gray-600">The strategy you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <V2WorkspaceLayout strategy={currentStrategy} />
  )
}