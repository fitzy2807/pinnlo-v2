'use client'

import React, { useState } from 'react'
import MasterCard, { MasterCardDebug } from '@/components/cards/MasterCard'
import { FeatureFlagsAdmin } from '@/components/admin/FeatureFlagsAdmin'
import { CardData } from '@/types/card'
import { toast } from 'react-hot-toast'

// Sample card data for testing
const sampleCard: CardData = {
  id: '123',
  workspaceId: 'test-workspace',
  strategyId: 'test-strategy',
  title: 'Vision for PINNLO AI Platform',
  description: 'Our vision is to democratize strategic planning through AI-powered insights and collaborative tools.',
  cardType: 'vision',
  priority: 'High',
  confidenceLevel: 'Medium',
  creator: 'Test User',
  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  tags: ['AI', 'Platform', 'Strategy'],
  relationships: [],
  strategicAlignment: 'This vision aligns with our goal to make strategic planning accessible to all businesses.',
  priorityRationale: 'High priority as this defines our north star',
  confidenceRationale: 'Medium confidence as market validation is ongoing',
  
  // Vision-specific fields
  visionType: 'Company',
  timeHorizon: '5 years',
  guidingPrinciples: ['Innovation', 'Accessibility', 'Collaboration'],
  inspirationSource: 'Inspired by the complexity founders face in strategic planning'
}

// Test scenarios
const testScenarios = [
  {
    name: 'Test Auto-save',
    steps: [
      '1. Edit a field',
      '2. Wait 1 second',
      '3. Check save indicator shows "Saved"',
      '4. Refresh page',
      '5. Verify data persisted'
    ]
  },
  {
    name: 'Test Offline Mode',
    steps: [
      '1. Open DevTools Network tab',
      '2. Go offline',
      '3. Edit multiple fields',
      '4. Check for "X changes pending" indicator',
      '5. Go back online',
      '6. Verify sync notification'
    ]
  },
  {
    name: 'Test Undo/Redo',
    steps: [
      '1. Make several edits',
      '2. Press Cmd+Z to undo',
      '3. Verify previous value restored',
      '4. Press Cmd+Shift+Z to redo',
      '5. Verify change reapplied'
    ]
  },
  {
    name: 'Test Validation',
    steps: [
      '1. Clear a required field (title)',
      '2. Click outside the field',
      '3. Verify error message appears',
      '4. Enter valid data',
      '5. Verify error clears'
    ]
  },
  {
    name: 'Test Keyboard Shortcuts',
    steps: [
      '1. Press Cmd+S to force save',
      '2. Press Cmd+E to toggle edit mode',
      '3. Verify shortcuts work in form fields',
      '4. Test that regular typing is not affected'
    ]
  },
  {
    name: 'Test Section Collapse/Expand',
    steps: [
      '1. Click section headers to collapse',
      '2. Verify preview text appears',
      '3. Refresh page',
      '4. Verify collapse state persists',
      '5. Expand and verify content'
    ]
  }
]

export default function TestMasterCardPage() {
  const [card, setCard] = useState<CardData>(sampleCard)
  const [forceEnhanced, setForceEnhanced] = useState(false)
  const [forceLegacy, setForceLegacy] = useState(false)

  const handleUpdate = async (updates: Partial<CardData>) => {
    console.log('Card update:', updates)
    setCard(prev => ({ ...prev, ...updates }))
    
    // Simulate async save
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.success('Card updated!')
    
    return Promise.resolve()
  }

  const handleDelete = () => {
    toast.error('Delete not implemented in test')
  }

  const handleDuplicate = () => {
    toast.success('Duplicate not implemented in test')
  }

  const handleAIEnhance = () => {
    toast.success('AI Enhancement not implemented in test')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">MasterCard Test Page</h1>
        
        {/* Test Controls */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={forceEnhanced}
                onChange={(e) => {
                  setForceEnhanced(e.target.checked)
                  if (e.target.checked) setForceLegacy(false)
                }}
              />
              <span>Force Enhanced MasterCard</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={forceLegacy}
                onChange={(e) => {
                  setForceLegacy(e.target.checked)
                  if (e.target.checked) setForceEnhanced(false)
                }}
              />
              <span>Force Legacy MasterCard</span>
            </label>
          </div>
        </div>

        {/* Card Display */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {forceEnhanced ? 'Enhanced' : forceLegacy ? 'Legacy' : 'Default'} MasterCard
          </h2>
          <MasterCard
            cardData={card}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onAIEnhance={handleAIEnhance}
            forceEnhanced={forceEnhanced}
            forceLegacy={forceLegacy}
          />
        </div>

        {/* Debug Version */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Debug MasterCard (Dev Only)</h2>
          <MasterCardDebug
            cardData={card}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onAIEnhance={handleAIEnhance}
          />
        </div>

        {/* Test Scenarios */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testScenarios.map((scenario, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{scenario.name}</h3>
                <ol className="space-y-1">
                  {scenario.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-sm text-gray-600">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Card State */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current Card State</h2>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(card, null, 2)}
          </pre>
        </div>
      </div>

      {/* Feature Flags Admin */}
      <FeatureFlagsAdmin />
    </div>
  )
}