'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus,
  Star,
  Clock,
  ArrowUpDown
} from 'lucide-react'

interface CardStackProps {
  cards: any[]
  loading: boolean
  selectedCard: string | null
  onCardSelect: (cardId: string) => void
  selectedHub: string
  selectedSection: string
}

export default function CardStack({ 
  cards, 
  loading, 
  selectedCard, 
  onCardSelect,
  selectedHub,
  selectedSection
}: CardStackProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [showFilters, setShowFilters] = useState(false)

  const filteredCards = cards.filter(card => 
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title)
    } else if (sortBy === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    }
    return 0
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCardTypeColor = (cardType: string) => {
    const colors = {
      'strategic-context': 'bg-purple-100 text-purple-800',
      'value-proposition': 'bg-purple-100 text-purple-800',
      'vision': 'bg-purple-100 text-purple-800',
      'personas': 'bg-purple-100 text-purple-800',
      'market': 'bg-blue-100 text-blue-800',
      'competitor': 'bg-blue-100 text-blue-800',
      'trends': 'bg-blue-100 text-blue-800',
      'feature': 'bg-orange-100 text-orange-800',
      'epic': 'bg-orange-100 text-orange-800',
      'prd': 'bg-orange-100 text-orange-800',
      'trd': 'bg-orange-100 text-orange-800'
    }
    return colors[cardType as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
    return sectionTitles[selectedSection as keyof typeof sectionTitles] || selectedSection
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
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {getSectionTitle()}
          </h2>
          <span className="text-sm text-gray-500">
            {sortedCards.length} cards
          </span>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">Recently Updated</option>
              <option value="title">Title A-Z</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first {getSectionTitle().toLowerCase()} card to get started.
            </p>
            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              Add Card
            </button>
          </div>
        ) : (
          sortedCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onCardSelect(card.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCard === card.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 truncate flex-1">
                  {card.title}
                </h3>
                <div className="flex items-center space-x-2 ml-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(card.priority)}`}>
                    {card.priority}
                  </span>
                  {card.pinned && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {typeof card.description === 'string' 
                  ? card.description 
                  : card.description?.objective || 'No description available'}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full ${getCardTypeColor(card.cardType)}`}>
                    {card.cardType}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(card.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {card.confidence && (
                  <div className="flex items-center space-x-1">
                    <span>Confidence: {Math.round(card.confidence * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}