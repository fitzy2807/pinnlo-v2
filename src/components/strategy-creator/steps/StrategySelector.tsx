'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, BarChart3 } from 'lucide-react'
import { useStrategies } from '@/hooks/useStrategies'

interface StrategySelectorProps {
  selectedStrategyId: string | null
  onSelect: (strategyId: string, strategyName: string) => void
}

export default function StrategySelector({ 
  selectedStrategyId, 
  onSelect 
}: StrategySelectorProps) {
  const { strategies, loading, error } = useStrategies()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStrategies = strategies.filter(strategy => {
    // If no search term, show all strategies
    if (!searchTerm) return true
    
    // If strategy has a name, filter by it
    const strategyName = strategy.name || strategy.title || 'Untitled Strategy'
    return strategyName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const calculateCompletionPercentage = (strategy: any) => {
    const totalCards = strategy.card_count || 0
    const maxExpectedCards = 22 * 3 // 22 blueprint types, ~3 cards each
    return Math.min(Math.round((totalCards / maxExpectedCards) * 100), 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading strategies: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select a Strategy to Enhance
        </h3>
        <p className="text-sm text-gray-600">
          Choose which strategy you want to generate new AI-powered cards for
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search strategies..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredStrategies.map((strategy) => {
          const isSelected = strategy.id === selectedStrategyId
          const completion = calculateCompletionPercentage(strategy)

          return (
            <button
              key={strategy.id}
              onClick={() => onSelect(strategy.id, strategy.name || strategy.title || 'Untitled Strategy')}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <h4 className="font-medium text-gray-900 mb-2">{strategy.name || strategy.title || 'Untitled Strategy'}</h4>
              
              <div className="space-y-2">
                {/* Completion */}
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Completion</span>
                      <span className="font-medium">{completion}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Last Modified */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>Updated {formatDate(strategy.updated_at)}</span>
                </div>

                {/* Card Count */}
                <div className="text-xs text-gray-500">
                  {strategy.card_count || 0} cards created
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {filteredStrategies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No strategies found matching &quot;{searchTerm}&quot;
        </div>
      )}

      {/* Continue Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => {
            if (selectedStrategyId) {
              const strategy = strategies.find(s => s.id === selectedStrategyId)
              onSelect(selectedStrategyId, strategy?.name || strategy?.title || 'Untitled Strategy')
            }
          }}
          disabled={!selectedStrategyId}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}