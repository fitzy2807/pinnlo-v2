'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Target, FileText, Brain, Search, Users, Zap } from 'lucide-react'
import { useStrategies } from '@/hooks/useStrategies'
import { useCards } from '@/hooks/useCards'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'

interface UnifiedContextSelectorProps {
  sessionState: any
  onUpdateSession: (updates: any) => void
  onNext: () => void
  onPrevious: () => void
}

const categoryIcons = {
  market: '📈',
  competitor: '👥',
  technology: '💻',
  consumer: '🎯',
  regulatory: '⚖️',
  trends: '💡',
  financial: '💰',
  operational: '⚙️'
}

export default function UnifiedContextSelector({
  sessionState,
  onUpdateSession,
  onNext,
  onPrevious
}: UnifiedContextSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [relevanceFilter, setRelevanceFilter] = useState<'all' | 'high' | 'medium'>('high')
  const [expandedSections, setExpandedSections] = useState({
    strategies: true,
    blueprints: false,
    intelligence: false
  })
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Hooks
  const { strategies, loading: strategiesLoading, error: strategiesError } = useStrategies()
  const { cards: blueprintCards, loading: blueprintLoading, error: blueprintError } = useCards(
    sessionState.strategyId ? parseInt(sessionState.strategyId) : undefined
  )
  const { cards: intelligenceCards, loading: intelligenceLoading, error: intelligenceError } = useIntelligenceCards()
  const { groups: intelligenceGroups, loading: groupsLoading, error: groupsError } = useIntelligenceGroups()

  // Filter functions
  const filteredBlueprintCards = blueprintCards?.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const filteredIntelligenceCards = intelligenceCards?.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory
    const matchesRelevance = relevanceFilter === 'all' || card.relevance_score >= (relevanceFilter === 'high' ? 0.8 : 0.5)
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesRelevance && matchesSearch
  }) || []

  const filteredIntelligenceGroups = intelligenceGroups?.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Helper functions
  const toggleSection = (section: 'strategies' | 'blueprints' | 'intelligence') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  // Handle strategy selection
  const handleStrategySelect = (strategy: any) => {
    onUpdateSession({
      strategyId: strategy.id.toString(),
      strategyName: strategy.title,
      selectedBlueprintCards: [],
      selectedIntelligenceCards: [],
      selectedIntelligenceGroups: []
    })
    
    // Auto-expand blueprints section after strategy selection
    setExpandedSections(prev => ({
      ...prev,
      strategies: false,
      blueprints: true
    }))
  }

  // Handle blueprint card selection
  const handleBlueprintCardToggle = (card: any) => {
    const currentSelected = sessionState.selectedBlueprintCards || []
    const isSelected = currentSelected.some((c: any) => c.id === card.id)
    
    const updated = isSelected
      ? currentSelected.filter((c: any) => c.id !== card.id)
      : [...currentSelected, card]
    
    onUpdateSession({ selectedBlueprintCards: updated })
  }

  // Handle intelligence card selection
  const handleIntelligenceCardToggle = (card: any) => {
    const currentSelected = sessionState.selectedIntelligenceCards || []
    const isSelected = currentSelected.some((c: any) => c.id === card.id)
    
    const updated = isSelected
      ? currentSelected.filter((c: any) => c.id !== card.id)
      : [...currentSelected, card]
    
    onUpdateSession({ selectedIntelligenceCards: updated })
  }

  // Handle intelligence group selection
  const handleIntelligenceGroupToggle = (group: any) => {
    const currentSelected = sessionState.selectedIntelligenceGroups || []
    const isSelected = currentSelected.some((g: any) => g.id === group.id)
    
    const updated = isSelected
      ? currentSelected.filter((g: any) => g.id !== group.id)
      : [...currentSelected, group]
    
    onUpdateSession({ selectedIntelligenceGroups: updated })
  }

  // Check if step is complete - only need strategy + at least 1 card from blueprint OR intelligence
  const isStepComplete = () => {
    const hasStrategy = !!sessionState.strategyId
    const hasBlueprintCards = (sessionState.selectedBlueprintCards || []).length > 0
    const hasIntelligenceCards = (sessionState.selectedIntelligenceCards || []).length > 0 || 
                                 (sessionState.selectedIntelligenceGroups || []).length > 0
    
    return hasStrategy && (hasBlueprintCards || hasIntelligenceCards)
  }

  // Calculate total context summary
  const getContextSummary = () => {
    const blueprintCount = (sessionState.selectedBlueprintCards || []).length
    const intelligenceCount = (sessionState.selectedIntelligenceCards || []).length
    const groupCount = (sessionState.selectedIntelligenceGroups || []).length
    
    return {
      blueprint: blueprintCount,
      intelligence: intelligenceCount,
      groups: groupCount,
      total: blueprintCount + intelligenceCount + groupCount
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Context Selection</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select your strategy and context cards to generate relevant content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getContextSummary().total > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                {getContextSummary().total} items selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content - Single scrollable area with collapsible sections */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Strategy Selection Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <button
              onClick={() => toggleSection('strategies')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Select Strategy</h3>
                  <p className="text-sm text-gray-600">Choose the strategy for card generation</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {sessionState.strategyId && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedSections.strategies ? 'rotate-90' : ''
                }`} />
              </div>
            </button>
            
            {expandedSections.strategies && (
              <div className="border-t border-gray-200 p-4">
                {strategiesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : strategiesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Error loading strategies</p>
                    <p className="text-sm text-gray-600">{strategiesError}</p>
                  </div>
                ) : strategies && strategies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {strategies.map((strategy) => (
                      <button
                        key={strategy.id}
                        onClick={() => handleStrategySelect(strategy)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          sessionState.strategyId === strategy.id.toString()
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <h4 className="font-medium text-gray-900">{strategy.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Created {new Date(strategy.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-2">No strategies found</p>
                    <p className="text-sm text-gray-500">Create your first strategy to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blueprint Context Section - Only show if strategy selected */}
          {sessionState.strategyId && (
            <div className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection('blueprints')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Blueprint Context</h3>
                    <p className="text-sm text-gray-600">Select existing cards to provide context</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {(sessionState.selectedBlueprintCards || []).length > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      {(sessionState.selectedBlueprintCards || []).length} selected
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSections.blueprints ? 'rotate-90' : ''
                  }`} />
                </div>
              </button>
              
              {expandedSections.blueprints && (
                <div className="border-t border-gray-200 p-4">
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search blueprint cards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Blueprint Cards */}
                  {blueprintLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {filteredBlueprintCards.map((card) => {
                        const isSelected = (sessionState.selectedBlueprintCards || []).some((c: any) => c.id === card.id)
                        
                        return (
                          <div
                            key={card.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleBlueprintCardToggle(card)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{card.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                  {card.cardType} • {card.priority}
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded border-2 ${
                                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Intelligence Context Section - Only show if strategy selected */}
          {sessionState.strategyId && (
            <div className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection('intelligence')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Intelligence Context</h3>
                    <p className="text-sm text-gray-600">Select intelligence cards and groups to inform strategy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {((sessionState.selectedIntelligenceCards || []).length + (sessionState.selectedIntelligenceGroups || []).length) > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      {(sessionState.selectedIntelligenceCards || []).length + (sessionState.selectedIntelligenceGroups || []).length} selected
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSections.intelligence ? 'rotate-90' : ''
                  }`} />
                </div>
              </button>
              
              {expandedSections.intelligence && (
                <div className="border-t border-gray-200 p-4">
                  {/* Search and Filters */}
                  <div className="space-y-3 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search intelligence..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(categoryIcons).map(([key, icon]) => (
                          <option key={key} value={key}>
                            {icon} {key.charAt(0).toUpperCase() + key.slice(1)}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={relevanceFilter}
                        onChange={(e) => setRelevanceFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Relevance</option>
                        <option value="high">High Relevance</option>
                        <option value="medium">Medium+ Relevance</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {/* Intelligence Groups */}
                    {filteredIntelligenceGroups.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Intelligence Groups
                        </h4>
                        <div className="space-y-2">
                          {filteredIntelligenceGroups.map((group) => {
                            const isGroupSelected = (sessionState.selectedIntelligenceGroups || []).some((g: any) => g.id === group.id)
                            const isExpanded = expandedGroups.has(group.id)
                            
                            return (
                              <div key={group.id} className="border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between p-3">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <button
                                      onClick={() => toggleGroup(group.id)}
                                      className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded"
                                    >
                                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                                        isExpanded ? 'rotate-90' : ''
                                      }`} />
                                      <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: group.color }}
                                      />
                                      <span className="text-sm font-medium">{group.name}</span>
                                      <span className="text-xs text-gray-500">({group.card_count} cards)</span>
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => handleIntelligenceGroupToggle(group)}
                                    className={`w-4 h-4 rounded border-2 transition-colors ${
                                      isGroupSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'
                                    }`}
                                  >
                                    {isGroupSelected && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                    )}
                                  </button>
                                </div>
                                
                                {isExpanded && (
                                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                                    <p className="text-xs text-gray-600 mb-2">{group.description}</p>
                                    <div className="text-xs text-gray-500">
                                      Updated {new Date(group.updated_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Individual Intelligence Cards */}
                    {filteredIntelligenceCards.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          Individual Cards
                        </h4>
                        <div className="space-y-2">
                          {filteredIntelligenceCards.map((card) => {
                            const isSelected = (sessionState.selectedIntelligenceCards || []).some((c: any) => c.id === card.id)
                            
                            return (
                              <div
                                key={card.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => handleIntelligenceCardToggle(card)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm">{categoryIcons[card.category] || '📄'}</span>
                                      <h4 className="font-medium text-gray-900">{card.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                                    <div className="mt-2 text-xs text-gray-500">
                                      {card.category} • Relevance: {Math.round(card.relevance_score * 100)}%
                                    </div>
                                  </div>
                                  <div className={`w-4 h-4 rounded border-2 ${
                                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevious}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {isStepComplete() ? (
                <span className="text-green-600 font-medium">Ready to generate cards</span>
              ) : (
                <span>Select strategy + at least 1 context card</span>
              )}
            </div>
            
            <button
              onClick={onNext}
              disabled={!isStepComplete()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}