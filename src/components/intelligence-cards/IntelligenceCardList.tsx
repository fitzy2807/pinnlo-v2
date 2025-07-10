'use client'

import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  Calendar,
  Tag,
  Shield,
  Target,
  Loader2
} from 'lucide-react'
import IntelligenceCard from './IntelligenceCard'
import {
  IntelligenceCard as IntelligenceCardType,
  IntelligenceCardFilters,
  IntelligenceCardCategory,
  IntelligenceCardStatus
} from '@/types/intelligence-cards'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'

interface IntelligenceCardListProps {
  category?: IntelligenceCardCategory
  status?: IntelligenceCardStatus
  onEditCard?: (card: IntelligenceCardType) => void
  showFilters?: boolean
  showViewToggle?: boolean
  sortBy?: 'date' | 'relevance' | 'credibility' | 'title'
  sortOrder?: 'asc' | 'desc'
  viewMode?: 'list' | 'grid'
  searchQuery?: string
  dateRange?: {from?: string, to?: string}
  credibilityRange?: [number, number]
  relevanceRange?: [number, number]
  sourceTypes?: string[]
  statusFilters?: string[]
  tagFilters?: string[]
  selectedCardIds?: Set<string>
  setSelectedCardIds?: (ids: Set<string>) => void
  isSelectionMode?: boolean
  setIsSelectionMode?: (mode: boolean) => void
}

export default function IntelligenceCardList({
  category,
  status,
  onEditCard,
  showFilters = true,
  showViewToggle = true,
  sortBy = 'date',
  sortOrder = 'desc',
  viewMode: viewModeProp = 'grid',
  searchQuery: searchQueryProp = '',
  dateRange,
  credibilityRange = [1, 10],
  relevanceRange = [1, 10],
  sourceTypes = [],
  statusFilters = [],
  tagFilters = [],
  selectedCardIds = new Set<string>(),
  setSelectedCardIds,
  isSelectionMode = false,
  setIsSelectionMode
}: IntelligenceCardListProps) {
  // View state - use props if provided, otherwise use local state
  const [viewModeLocal, setViewModeLocal] = useState<'grid' | 'list'>('grid')
  const viewMode = viewModeProp || viewModeLocal
  const setViewMode = viewModeProp ? () => {} : setViewModeLocal
  
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // Local state for filters not managed by parent
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQueryProp)
  const [localFilters, setLocalFilters] = useState<Partial<IntelligenceCardFilters>>({})
  
  // Build filters from props - use useMemo to ensure proper category filtering
  const filters = React.useMemo(() => {
    const baseFilters: IntelligenceCardFilters = {
      category,
      status,
      searchQuery: localSearchQuery,
      minCredibilityScore: credibilityRange[0] > 1 ? credibilityRange[0] : undefined,
      minRelevanceScore: relevanceRange[0] > 1 ? relevanceRange[0] : undefined,
      tags: tagFilters.length > 0 ? tagFilters : undefined,
      dateFrom: dateRange?.from,
      dateTo: dateRange?.to,
      ...localFilters
    }
    
    // Remove undefined values to ensure clean filtering
    return Object.fromEntries(
      Object.entries(baseFilters).filter(([_, value]) => value !== undefined)
    ) as IntelligenceCardFilters
  }, [category, status, localSearchQuery, credibilityRange, relevanceRange, tagFilters, dateRange, localFilters])

  // Load cards with filters
  const { cards, loading, error, total, refresh } = useIntelligenceCards(filters)
  
  // Handle search
  const handleSearch = (query: string) => {
    setLocalSearchQuery(query)
  }

  // Handle filter changes
  const updateFilter = (key: keyof IntelligenceCardFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  // Sort options - use props if provided
  const [sortByLocal, setSortByLocal] = useState<'date' | 'relevance' | 'credibility'>('date')
  const activeSortBy = sortBy || sortByLocal
  const setSortBy = sortBy ? () => {} : setSortByLocal
  
  const sortedCards = [...cards].sort((a, b) => {
    let result = 0
    switch (activeSortBy) {
      case 'relevance':
        result = (b.relevance_score || 0) - (a.relevance_score || 0)
        break
      case 'credibility':
        result = (b.credibility_score || 0) - (a.credibility_score || 0)
        break
      case 'title':
        result = a.title.localeCompare(b.title)
        break
      default:
        result = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    // Apply sort order
    return sortOrder === 'asc' ? -result : result
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading intelligence cards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">Error loading cards</p>
          <button
            onClick={refresh}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      {showFilters && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search intelligence cards..."
                value={localSearchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                showFilterPanel 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {Object.values(localFilters).filter(v => v !== undefined).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  {Object.values(localFilters).filter(v => v !== undefined).length}
                </span>
              )}
            </button>

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Credibility Score Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min. Credibility Score
                  </label>
                  <select
                    value={localFilters.minCredibilityScore || ''}
                    onChange={(e) => updateFilter('minCredibilityScore', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    {[1, 3, 5, 7, 9].map(score => (
                      <option key={score} value={score}>
                        {score}+ / 10
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relevance Score Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min. Relevance Score
                  </label>
                  <select
                    value={localFilters.minRelevanceScore || ''}
                    onChange={(e) => updateFilter('minRelevanceScore', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Any</option>
                    {[1, 3, 5, 7, 9].map(score => (
                      <option key={score} value={score}>
                        {score}+ / 10
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="date">Most Recent</option>
                    <option value="relevance">Highest Relevance</option>
                    <option value="credibility">Highest Credibility</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setLocalFilters({})
                    setLocalSearchQuery('')
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count and selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {setSelectedCardIds && sortedCards.length > 0 && (
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCardIds.size === sortedCards.length && sortedCards.length > 0}
                ref={(el) => {
                  if (el) {
                    el.indeterminate = selectedCardIds.size > 0 && selectedCardIds.size < sortedCards.length
                  }
                }}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCardIds(new Set(sortedCards.map(card => card.id)))
                    setIsSelectionMode?.(true)
                  } else {
                    setSelectedCardIds(new Set())
                    setIsSelectionMode?.(false)
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Select all</span>
            </label>
          )}
          <p className="text-sm text-gray-600">
            {total === 0 ? 'No intelligence cards found' : `${total} intelligence card${total === 1 ? '' : 's'}`}
          </p>
        </div>
        
        {isSelectionMode && selectedCardIds.size > 0 && (
          <button
            onClick={() => {
              setSelectedCardIds?.(new Set())
              setIsSelectionMode?.(false)
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Cancel selection
          </button>
        )}
      </div>

      {/* Cards Display */}
      {sortedCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No intelligence cards found</h3>
          <p className="text-sm text-gray-600">
            {filters.searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first intelligence card to get started'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {sortedCards.map((card) => (
            <IntelligenceCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onRefresh={refresh}
              isSelected={selectedCardIds.has(card.id)}
              onToggleSelect={setSelectedCardIds ? () => {
                const newSelection = new Set(selectedCardIds)
                if (newSelection.has(card.id)) {
                  newSelection.delete(card.id)
                } else {
                  newSelection.add(card.id)
                  setIsSelectionMode?.(true)
                }
                setSelectedCardIds(newSelection)
              } : undefined}
              isSelectionMode={isSelectionMode}
            />
          ))}
        </div>
      )}

      {/* Load More - placeholder for future pagination */}
      {cards.length < total && (
        <div className="text-center pt-4">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Load more cards
          </button>
        </div>
      )}
    </div>
  )
}