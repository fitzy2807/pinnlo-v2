'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Clock,
  Users,
  MoreVertical,
  Edit3,
  Copy,
  Trash2
} from 'lucide-react'

interface StrategyGatewayModalProps {
  strategies: any[]
  loading: boolean
  onClose: () => void
  onCreateStrategy: (strategy: any) => Promise<any>
  onUpdateStrategy: (id: number, updates: any) => Promise<void>
  onDeleteStrategy: (id: number) => Promise<void>
  onDuplicateStrategy: (id: number) => Promise<void>
}

export default function StrategyGatewayModal({ 
  strategies, 
  loading, 
  onClose,
  onCreateStrategy,
  onUpdateStrategy,
  onDeleteStrategy,
  onDuplicateStrategy
}: StrategyGatewayModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    client: '',
    description: ''
  })
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const filteredStrategies = strategies.filter(strategy =>
    strategy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    strategy.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    strategy.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateStrategy = async () => {
    if (!newStrategy.title.trim() || !newStrategy.client.trim()) {
      return
    }

    setCreating(true)
    try {
      const createdStrategy = await onCreateStrategy({
        title: newStrategy.title,
        client: newStrategy.client,
        description: newStrategy.description,
        status: 'draft'
      })
      
      if (createdStrategy) {
        router.push(`/v2/strategies/${createdStrategy.id}/workspace`)
        onClose()
      }
    } catch (error) {
      console.error('Error creating strategy:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleStrategyClick = (strategy: any) => {
    router.push(`/v2/strategies/${strategy.id}/workspace`)
    onClose()
  }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Strategy Gateway</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Create New Strategy */}
          {showCreateForm ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Strategy</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strategy Title *
                  </label>
                  <input
                    type="text"
                    value={newStrategy.title}
                    onChange={(e) => setNewStrategy({ ...newStrategy, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter strategy title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <input
                    type="text"
                    value={newStrategy.client}
                    onChange={(e) => setNewStrategy({ ...newStrategy, client: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter strategy description"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCreateStrategy}
                    disabled={creating || !newStrategy.title.trim() || !newStrategy.client.trim()}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create Strategy'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-gray-400 transition-colors">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Plus className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Strategy</h3>
              <p className="text-gray-600 mb-4">
                Start a new strategic planning process with our guided framework
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>

          {/* Strategies List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading strategies...</p>
              </div>
            ) : filteredStrategies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No strategies found</p>
              </div>
            ) : (
              filteredStrategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => handleStrategyClick(strategy)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {strategy.title}
                        </h3>
                        {strategy.pinned && (
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{strategy.client}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Updated {new Date(strategy.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {strategy.description || 'No description provided'}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(strategy.priority)}`}>
                          {strategy.priority}
                        </span>
                        <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(strategy.status)}`}>
                          {strategy.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle edit
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDuplicateStrategy(strategy.id)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Are you sure you want to delete this strategy?')) {
                            onDeleteStrategy(strategy.id)
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}