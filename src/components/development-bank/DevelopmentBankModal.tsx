'use client'

import React, { useState } from 'react'
import { X, Building2, ArrowRight, Check } from 'lucide-react'
import { useSession } from '@supabase/auth-helpers-react'
import { useStrategies } from '@/hooks/useStrategies'
import DevelopmentBank from './DevelopmentBank'

interface DevelopmentBankModalProps {
  isOpen: boolean
  onClose: () => void
  strategyId?: string
}

export default function DevelopmentBankModal({ 
  isOpen, 
  onClose, 
  strategyId 
}: DevelopmentBankModalProps) {
  const session = useSession()
  const { strategies, loading: strategiesLoading } = useStrategies()
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategyId || '')

  if (!isOpen) return null

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please sign in to access the Development Bank.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Strategy selection UI when no strategy is selected
  if (!selectedStrategyId && strategies && strategies.length > 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span>Development Bank</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Select a strategy to begin working with your development assets
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-3">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategyId(strategy.id.toString())}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                      {strategy.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {strategy.description || 'No description provided'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (strategiesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading strategies...</p>
          </div>
        </div>
      </div>
    )
  }

  // No strategies found
  if (!strategies || strategies.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Strategies Found</h2>
            <p className="text-gray-600 mb-4">
              Create a strategy first to access the Development Bank.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main Development Bank interface
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span>Development Bank</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Bridge your strategy to development execution
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <DevelopmentBank 
            strategyId={selectedStrategyId} 
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  )
}