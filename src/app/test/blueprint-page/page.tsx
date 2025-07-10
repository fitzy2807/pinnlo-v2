'use client'

import React from 'react'
import BlueprintPage from '@/components/workspace/BlueprintPage'

export default function TestBlueprintPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Test Blueprint Page Integration
        </h1>
        
        <BlueprintPage
          blueprintType="strategic-context"
          strategyId="1"
        />
      </div>
    </div>
  )
}