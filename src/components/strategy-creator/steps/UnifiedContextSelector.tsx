'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Target, FileText, Brain, Search, Filter, Users, Zap } from 'lucide-react'
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

type TabType = 'strategy' | 'blueprint' | 'intelligence'

const TABS = [
  { id: 'strategy', label: 'Strategy', icon: Target },
  { id: 'blueprint', label: 'Blueprint Context', icon: FileText },
  { id: 'intelligence', label: 'Intelligence Context', icon: Brain }
]

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

const suggestedCategories: Record<string, string[]> = {
  'strategic-context': ['market', 'competitor', 'trends'],
  'vision': ['trends', 'technology', 'market'],
  'value-proposition': ['consumer', 'competitor', 'market'],
  'personas': ['consumer', 'trends', 'technology'],
  'business-model': ['financial', 'market', 'operational'],
  'go-to-market': ['market', 'competitor', 'consumer'],
  'competitive-analysis': ['competitor', 'market', 'technology'],
  'risk-assessment': ['regulatory', 'financial', 'operational']
}

export default function UnifiedContextSelector({
  sessionState,
  onUpdateSession,
  onNext,
  onPrevious
}: UnifiedContextSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('strategy')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [intelligenceMode, setIntelligenceMode] = useState<'individual' | 'groups' | 'mixed'>('mixed')
  const [relevanceFilter, setRelevanceFilter] = useState<'all' | 'high' | 'medium'>('high')

  // Hooks
  const { strategies, loading: strategiesLoading } = useStrategies()
  const { cards: blueprintCards, loading: blueprintLoading } = useCards(
    sessionState.strategyId ? parseInt(sessionState.strategyId) : undefined
  )
  const { cards: intelligenceCards, loading: intelligenceLoading } = useIntelligenceCards()
  const { groups: intelligenceGroups, loading: groupsLoading } = useIntelligenceGroups()

  // Filter blueprint cards by search
  const filteredBlueprintCards = blueprintCards?.filter(card =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Filter intelligence cards by category and relevance
  const filteredIntelligenceCards = intelligenceCards?.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory
    const matchesRelevance = relevanceFilter === 'all' || card.relevance_score >= (relevanceFilter === 'high' ? 0.8 : 0.5)
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesRelevance && matchesSearch
  }) || []

  // Filter intelligence groups by search
  const filteredIntelligenceGroups = intelligenceGroups?.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Get suggested categories based on selected blueprint cards
  const getSuggestedCategories = () => {
    const selectedBlueprintTypes = sessionState.selectedBlueprintCards?.map((card: any) => card.cardType) || []
    const suggested = new Set<string>()
    
    selectedBlueprintTypes.forEach((type: string) => {
      const categories = suggestedCategories[type] || []
      categories.forEach(cat => suggested.add(cat))
    })
    
    return Array.from(suggested)
  }

  // Handle tab navigation
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSearchQuery('')
  }

  // Handle strategy selection
  const handleStrategySelect = (strategy: any) => {
    onUpdateSession({
      strategyId: strategy.id,
      strategyName: strategy.name,
      selectedBlueprintCards: [],
      selectedIntelligenceCards: [],
      selectedIntelligenceGroups: []
    })
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

  // Check if current step is complete
  const isStepComplete = () => {
    switch (activeTab) {
      case 'strategy':
        return !!sessionState.strategyId
      case 'blueprint':
        return (sessionState.selectedBlueprintCards || []).length > 0
      case 'intelligence':
        return (sessionState.selectedIntelligenceCards || []).length > 0 || 
               (sessionState.selectedIntelligenceGroups || []).length > 0
      default:
        return false
    }
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
              Select your strategy context to generate relevant cards
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isComplete = tab.id === 'strategy' ? !!sessionState.strategyId :
                                tab.id === 'blueprint' ? (sessionState.selectedBlueprintCards || []).length > 0 :
                                ((sessionState.selectedIntelligenceCards || []).length > 0 || 
                                 (sessionState.selectedIntelligenceGroups || []).length > 0)
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {isComplete && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Strategy Tab */}
        {activeTab === 'strategy' && (
          <div className="h-full p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Target Strategy</h3>
                <p className="text-sm text-gray-600">
                  Choose the strategy where you want to generate new cards
                </p>
              </div>
              
              {strategiesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {strategies?.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => handleStrategySelect(strategy)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        sessionState.strategyId === strategy.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Created {new Date(strategy.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blueprint Context Tab */}
        {activeTab === 'blueprint' && (
          <div className="h-full flex">
            {/* Left Panel - Cards */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Blueprint Context</h3>
                <p className="text-sm text-gray-600">
                  Select existing cards to provide context for AI generation
                </p>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search blueprint cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Blueprint Cards */}
              {blueprintLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
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

            {/* Right Panel - Summary */}
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-4">Selected Context</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  {(sessionState.selectedBlueprintCards || []).length} blueprint cards selected
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Intelligence Context Tab */}
        {activeTab === 'intelligence' && (
          <div className="h-full flex">
            {/* Left Panel */}
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Intelligence Context</h3>
                <p className="text-sm text-gray-600">
                  Select intelligence cards and groups to inform your strategy
                </p>
              </div>

              {/* Mode Selection */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Mode:</span>
                  {['individual', 'groups', 'mixed'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setIntelligenceMode(mode as any)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        intelligenceMode === mode
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search intelligence..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {intelligenceMode !== 'groups' && (
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
                )}
              </div>

              {/* Content based on mode */}
              {intelligenceMode === 'groups' && (
                <div className="space-y-3">
                  {groupsLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    filteredIntelligenceGroups.map((group) => {
                      const isSelected = (sessionState.selectedIntelligenceGroups || []).some((g: any) => g.id === group.id)
                      
                      return (
                        <div
                          key={group.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleIntelligenceGroupToggle(group)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: group.color }}
                                />
                                <h4 className="font-medium text-gray-900">{group.name}</h4>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                              <div className="mt-2 text-xs text-gray-500">
                                {group.card_count} cards • Updated {new Date(group.updated_at).toLocaleDateString()}
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
                    })
                  )}
                </div>
              )}

              {intelligenceMode === 'individual' && (
                <div className="space-y-3">
                  {intelligenceLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    filteredIntelligenceCards.map((card) => {
                      const isSelected = (sessionState.selectedIntelligenceCards || []).some((c: any) => c.id === card.id)
                      
                      return (
                        <div
                          key={card.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
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
                    })
                  )}
                </div>
              )}

              {intelligenceMode === 'mixed' && (
                <div className="space-y-6">
                  {/* Groups Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Intelligence Groups
                    </h4>
                    <div className="space-y-3">
                      {groupsLoading ? (
                        <div className="flex items-center justify-center h-20">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        filteredIntelligenceGroups.slice(0, 3).map((group) => {
                          const isSelected = (sessionState.selectedIntelligenceGroups || []).some((g: any) => g.id === group.id)
                          
                          return (
                            <div
                              key={group.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleIntelligenceGroupToggle(group)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: group.color }}
                                  />
                                  <span className="text-sm font-medium">{group.name}</span>
                                  <span className="text-xs text-gray-500">({group.card_count} cards)</span>
                                </div>
                                <div className={`w-3 h-3 rounded border ${
                                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                }`} />
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Individual Cards Section */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Individual Cards
                    </h4>
                    <div className="space-y-3">
                      {intelligenceLoading ? (
                        <div className="flex items-center justify-center h-20">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        filteredIntelligenceCards.slice(0, 5).map((card) => {
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs">{categoryIcons[card.category] || '📄'}</span>
                                  <span className="text-sm font-medium">{card.title}</span>
                                  <span className="text-xs text-gray-500">({Math.round(card.relevance_score * 100)}%)</span>
                                </div>
                                <div className={`w-3 h-3 rounded border ${
                                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                }`} />
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Summary */}
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-4">Intelligence Summary</h4>
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Individual Cards:</span>
                    <span className="font-medium">{(sessionState.selectedIntelligenceCards || []).length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Groups:</span>
                    <span className="font-medium">{(sessionState.selectedIntelligenceGroups || []).length}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-900 font-medium">Total Context:</span>
                    <span className="font-medium">{getContextSummary().total}</span>
                  </div>
                </div>
                
                {getSuggestedCategories().length > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Suggested Categories</h5>
                    <div className="flex flex-wrap gap-2">
                      {getSuggestedCategories().map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {categoryIcons[category]} {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
            <span className="text-sm text-gray-600">
              Step {TABS.findIndex(t => t.id === activeTab) + 1} of {TABS.length}
            </span>
            
            <button
              onClick={() => {
                if (activeTab === 'intelligence') {
                  onNext()
                } else {
                  const currentIndex = TABS.findIndex(t => t.id === activeTab)
                  if (currentIndex < TABS.length - 1) {
                    setActiveTab(TABS[currentIndex + 1].id as TabType)
                  }
                }
              }}
              disabled={!isStepComplete()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{activeTab === 'intelligence' ? 'Continue' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}