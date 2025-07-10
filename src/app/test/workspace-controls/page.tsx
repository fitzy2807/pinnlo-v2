'use client'

import React from 'react'
import WorkspaceWithControls from '@/components/workspace/WorkspaceWithControls'

// Mock data for testing
const mockCards = [
  { id: '1', title: 'Strategic Initiative 1', description: 'Description 1' },
  { id: '2', title: 'Strategic Initiative 2', description: 'Description 2' },
  { id: '3', title: 'Strategic Initiative 3', description: 'Description 3' },
]

export default function TestWorkspaceControls() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Test Workspace Controls
        </h1>
        
        <WorkspaceWithControls
          strategyId={1}
          blueprintId="strategic-context"
          cards={mockCards}
        >
          {/* Example content that would normally be blueprint cards */}
          <div className="grid gap-4">
            {mockCards.map(card => (
              <div key={card.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900">{card.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{card.description}</p>
              </div>
            ))}
          </div>
        </WorkspaceWithControls>
      </div>
    </div>
  )
}