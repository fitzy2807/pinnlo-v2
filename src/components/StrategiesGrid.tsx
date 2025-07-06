'use client'

import StrategyCard from './StrategyCard'
import { RefreshCw, AlertTriangle, Plus } from 'lucide-react'

interface StrategiesGridProps {
  strategiesHook: ReturnType<typeof import('@/hooks/useStrategies').useStrategies>
}

export default function StrategiesGrid({ strategiesHook }: StrategiesGridProps) {
  const { strategies, loading, error, refreshStrategies } = strategiesHook

  if (loading) {
    return (
      <div className="card-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card">
            <div className="space-y-4">
              <div className="skeleton h-6 w-3/4"></div>
              <div className="skeleton h-4 w-1/2"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="flex justify-between items-center">
                <div className="skeleton h-6 w-16"></div>
                <div className="flex space-x-2">
                  <div className="skeleton h-6 w-6"></div>
                  <div className="skeleton h-6 w-6"></div>
                  <div className="skeleton h-6 w-6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-error-50 border border-error-200 rounded-lg p-8 max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-h3 text-error-800 mb-3">Connection Issue</h3>
          <p className="text-small text-error-600 mb-6">{error}</p>
          
          {error.includes('Maximum retry attempts') ? (
            <div className="space-y-3">
              <p className="text-small text-secondary-600">Please refresh the page to try again.</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-primary btn-md"
              >
                <RefreshCw size={16} />
                <span>Refresh Page</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={refreshStrategies}
              className="btn btn-primary btn-md"
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (strategies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus size={24} className="text-secondary-400" />
          </div>
          <h3 className="text-h3 mb-3">No strategies yet</h3>
          <p className="text-body mb-6">Create your first strategy to get started building your strategic framework!</p>
          <p className="text-small text-secondary-500">Click the &quot;Create New Strategy&quot; button above to begin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-grid">
      {strategies.map((strategy) => (
        <StrategyCard key={strategy.id} strategy={strategy} strategiesHook={strategiesHook} />
      ))}
    </div>
  )
}