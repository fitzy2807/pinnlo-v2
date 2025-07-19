'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Target } from 'lucide-react'
import { useStrategy } from '@/contexts/StrategyContext'
import { Strategy } from '@/types/strategy'

interface StrategySelectorProps {
  className?: string
}

export default function StrategySelector({ className = '' }: StrategySelectorProps) {
  const { currentStrategy, strategies, setCurrentStrategy, isLoading } = useStrategy()
  const [isOpen, setIsOpen] = useState(false)

  const handleStrategySelect = (strategy: Strategy) => {
    setCurrentStrategy(strategy)
    setIsOpen(false)
  }

  const handleClearStrategy = () => {
    setCurrentStrategy(null)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className={`p-3 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (strategies.length === 0) {
    return (
      <div className={`p-3 ${className}`}>
        <div className="text-xs font-medium text-gray-500 mb-2">Strategy</div>
        <div className="text-sm text-gray-400 italic">No strategies available</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="p-3">
        <label className="block text-xs font-medium text-white mb-2">Current Strategy</label>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {currentStrategy ? (
              <>
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: currentStrategy.color || '#3B82F6' }}
                />
                <span className="truncate text-gray-900">{currentStrategy.title}</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500">Select a strategy...</span>
              </>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {/* Clear Selection Option */}
            {currentStrategy && (
              <>
                <button
                  onClick={handleClearStrategy}
                  className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                  <span>No strategy selected</span>
                </button>
                <div className="border-t border-gray-100" />
              </>
            )}

            {/* Strategy Options */}
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => handleStrategySelect(strategy)}
                className="w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: strategy.color || '#3B82F6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {strategy.title}
                    </div>
                    {strategy.description && (
                      <div className="text-xs text-gray-500 truncate">
                        {strategy.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {currentStrategy?.id === strategy.id && (
                  <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}