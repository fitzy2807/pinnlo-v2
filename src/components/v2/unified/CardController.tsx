'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Zap, 
  ArrowUpDown,
  MoreVertical,
  Star,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { CardData } from '@/types/card'

interface CardControllerProps {
  cards: CardData[]
  loading: boolean
  selectedCard: CardData | null
  searchQuery: string
  filters: any
  onCardSelect: (card: CardData) => void
  onSearchChange: (query: string) => void
  onFiltersChange: (filters: any) => void
  onAddCard: () => void
  onGenerateAI: () => void
  hubId: string
  sectionId: string
}

export default function CardController({ 
  cards, 
  loading, 
  selectedCard, 
  searchQuery, 
  filters,
  onCardSelect,
  onSearchChange,
  onFiltersChange,
  onAddCard,
  onGenerateAI,
  hubId,
  sectionId
}: CardControllerProps) {
  const [showFilters, setShowFilters] = useState(false)

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filters.priority === 'all' || card.priority === filters.priority
    const matchesStatus = filters.status === 'all' || card.cardType === filters.status
    
    return matchesSearch && matchesPriority && matchesStatus
  })

  const sortedCards = [...filteredCards].sort((a, b) => {
    switch (filters.sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'priority':
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'updated':
      default:
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    }
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500'
      case 'Medium': return 'text-yellow-500'
      case 'Low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'text-green-500'
      case 'Medium': return 'text-yellow-500'
      case 'Low': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getSectionTitle = () => {
    const sectionTitles = {
      'strategicContext': 'Strategic Context',
      'valuePropositions': 'Value Propositions',
      'vision': 'Vision',
      'personas': 'Personas',
      'market': 'Market Intelligence',
      'competitor': 'Competitor Intelligence',
      'trends': 'Trends',
      'features': 'Features',
      'epics': 'Epics',
      'prd': 'PRD',
      'trd': 'TRD'
    }
    return sectionTitles[sectionId as keyof typeof sectionTitles] || sectionId
  }

  // Special home view
  if (hubId === 'home') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500">Overview of your strategic content</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900">Strategy Hub</h3>
              <p className="text-sm text-blue-700">15 active cards</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900">Intelligence Hub</h3>
              <p className="text-sm text-green-700">23 active cards</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-900">Development Hub</h3>
              <p className="text-sm text-orange-700">34 active cards</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900">Organisation Hub</h3>
              <p className="text-sm text-purple-700">11 active cards</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            {getSectionTitle()}
          </h2>
          <span className="text-xs text-gray-500">
            {sortedCards.length} cards
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent h-8"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors h-7"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter By</span>
            </button>

            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 h-7"
            >
              <option value="updated">Recently Updated</option>
              <option value="title">Title A-Z</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <button
            onClick={() => onFiltersChange({ ...filters, sortBy: filters.sortBy === 'asc' ? 'desc' : 'asc' })}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons - ADD CARD and GENERATE AI */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={onAddCard}
            className="flex items-center space-x-1.5 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium h-8"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>

          <button
            onClick={onGenerateAI}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium h-8"
          >
            <Zap className="w-4 h-4" />
            <span>Generate AI</span>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-2 bg-gray-50 rounded-md space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-6"
              >
                <option value="all">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 h-6"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Card List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sortedCards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-3">
              <Plus className="w-8 h-8 mx-auto mb-2" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No cards yet</h3>
            <p className="text-xs text-gray-600 mb-3">
              Create your first {getSectionTitle().toLowerCase()} card to get started.
            </p>
            <button
              onClick={onAddCard}
              className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium"
            >
              Add Card
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedCards.map((card) => (
              <div
                key={card.id}
                onClick={() => onCardSelect(card)}
                className={`p-3 rounded border cursor-pointer transition-all duration-150 ${
                  selectedCard?.id === card.id
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate flex-1 leading-tight">
                    {card.title}
                  </h3>
                  <div className="flex items-center space-x-0.5 ml-2">
                    {/* Three Action Icons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle edit action
                      }}
                      className={`p-1 rounded ${getPriorityColor(card.priority)} hover:bg-gray-100`}
                      title="Priority"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle info action
                      }}
                      className={`p-1 rounded ${getConfidenceColor(card.confidenceLevel)} hover:bg-gray-100`}
                      title="Confidence"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle more actions
                      }}
                      className="p-1 rounded text-gray-400 hover:bg-gray-100"
                      title="More actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                  {typeof card.description === 'string' 
                    ? card.description 
                    : card.description?.objective || 'No description available'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(card.priority)} bg-opacity-20`}>
                      {card.priority}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(card.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">By {card.creator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}