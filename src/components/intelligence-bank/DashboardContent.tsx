import React from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Bookmark, 
  Archive, 
  Plus 
} from 'lucide-react'

interface DashboardContentProps {
  categoryCounts: Record<string, number>
  statusCounts: { saved: number, archived: number }
  totalCards: number
  setSelectedCategory: (category: string) => void
}

const INTELLIGENCE_CATEGORIES = [
  {
    id: 'market',
    name: 'Market',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    id: 'competitor',
    name: 'Competitor',
    icon: TrendingUp,
    color: 'text-blue-600'
  },
  {
    id: 'trends',
    name: 'Trends',
    icon: BarChart3,
    color: 'text-purple-600'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: BarChart3,
    color: 'text-indigo-600'
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder',
    icon: BarChart3,
    color: 'text-yellow-600'
  },
  {
    id: 'consumer',
    name: 'Consumer',
    icon: BarChart3,
    color: 'text-red-600'
  },
  {
    id: 'risk',
    name: 'Risk',
    icon: BarChart3,
    color: 'text-orange-600'
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    icon: BarChart3,
    color: 'text-yellow-500'
  }
]

export default function DashboardContent({ categoryCounts, statusCounts, totalCards, setSelectedCategory }: DashboardContentProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Intelligence Bank Overview</h2>
        <p className="text-sm text-gray-600">Strategic intelligence insights and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Cards</p>
              <p className="text-2xl font-bold text-blue-900">{totalCards}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Active Cards</p>
              <p className="text-2xl font-bold text-green-900">{totalCards - statusCounts.saved - statusCounts.archived}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Saved Cards</p>
              <p className="text-2xl font-bold text-yellow-900">{statusCounts.saved}</p>
            </div>
            <Bookmark className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Archived</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.archived}</p>
            </div>
            <Archive className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Category Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Intelligence by Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([category, count]) => {
              const categoryData = INTELLIGENCE_CATEGORIES.find(cat => cat.id === category)
              if (!categoryData || category === 'dashboard') return null
              
              const Icon = categoryData.icon
              const percentage = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${categoryData.color}`} />
                    <span className="text-sm font-medium text-gray-900">{categoryData.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => {
                const event = new CustomEvent('intelligence-bank-create-card', { 
                  detail: { category: 'market' } 
                });
                document.dispatchEvent(event);
              }}
              className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">Add Intelligence Card</div>
                <div className="text-xs text-gray-500">Create new market intelligence</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}