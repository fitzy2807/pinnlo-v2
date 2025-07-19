'use client'

import { useRouter } from 'next/navigation'
import { 
  Clock, 
  Users, 
  Star, 
  ArrowRight,
  Plus
} from 'lucide-react'

interface StrategyQuickAccessProps {
  strategies: any[]
  loading: boolean
  onStrategyClick: () => void
}

export default function StrategyQuickAccess({ 
  strategies, 
  loading, 
  onStrategyClick 
}: StrategyQuickAccessProps) {
  const router = useRouter()

  const handleStrategyClick = (strategy: any) => {
    router.push(`/v2/strategies/${strategy.id}/workspace`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Get recent strategies (last 6, pinned first)
  const recentStrategies = strategies
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    .slice(0, 6)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onStrategyClick}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Strategy</span>
          </button>
          <button
            onClick={onStrategyClick}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentStrategies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No strategies yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first strategy to get started with strategic planning.
            </p>
            <button
              onClick={onStrategyClick}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Strategy
            </button>
          </div>
        ) : (
          recentStrategies.map((strategy) => (
            <div
              key={strategy.id}
              onClick={() => handleStrategyClick(strategy)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {strategy.title}
                    </h3>
                    {strategy.pinned && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{strategy.client}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {strategy.description || 'No description provided'}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(strategy.priority)}`}>
                    {strategy.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(strategy.status)}`}>
                    {strategy.status}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(strategy.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs text-gray-500">
                    {Math.round((strategy.cardCount || 0) / 20 * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((strategy.cardCount || 0) / 20 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}