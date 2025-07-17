/**
 * Intelligence Bank Component
 * 
 * Main interface for viewing and managing intelligence cards.
 * Uses the compact PINNLO design system for consistency.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Search, 
  Filter, 
  Settings, 
  TrendingUp,
  Eye,
  BarChart3,
  Cpu,
  Crown,
  Target,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  Archive,
  Plus,
  ChevronDown,
  Grid3X3,
  List,
  Trash2,
  ExternalLink,
  Upload,
  Link,
  Menu,
  Folder,
  FolderPlus,
  Zap,
  Bot,
  ArrowUpDown,
  Edit2,
  Copy
} from 'lucide-react'
import IntelligenceProfile from './IntelligenceProfile'
import IntelligenceCardList from '../intelligence-cards/IntelligenceCardList'
import IntelligenceGroups from '../intelligence-groups/IntelligenceGroups'
import BulkActionsToolbar from '../intelligence-groups/BulkActionsToolbar'
import CardGroupSelector from '../intelligence-groups/CardGroupSelector'
import GroupsSelector from './GroupsSelector'
import AgentsSection from './AgentsSection'
import DashboardContent from './DashboardContent'
import { getAgentsForHub } from '@/lib/agentRegistry'
import { CardData } from '@/types/card'
import { useIntelligenceBankCards } from '@/hooks/useIntelligenceBankCards'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'
import { useTextProcessing } from '@/hooks/useTextProcessing'
import { useUrlAnalysis } from '@/hooks/useUrlAnalysis'
import { toast } from 'react-hot-toast'

interface IntelligenceBankProps {
  onClose?: () => void
}

// Intelligence categories with compact styling
const INTELLIGENCE_CATEGORIES = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: BarChart3,
    description: 'Intelligence Bank overview and insights',
    count: 0,
    color: 'text-blue-600'
  },
  {
    id: 'market',
    name: 'Market',
    icon: TrendingUp,
    description: 'Growth projections',
    count: 0,
    color: 'text-green-600'
  },
  {
    id: 'competitor',
    name: 'Competitor',
    icon: Eye,
    description: 'New product launches',
    count: 0,
    color: 'text-blue-600'
  },
  {
    id: 'trends',
    name: 'Trends',
    icon: BarChart3,
    description: 'UX/UI shifts',
    count: 0,
    color: 'text-purple-600'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: Cpu,
    description: 'Tech stack evolution',
    count: 0,
    color: 'text-indigo-600'
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder',
    icon: Crown,
    description: 'Internal goals',
    count: 0,
    color: 'text-yellow-600'
  },
  {
    id: 'consumer',
    name: 'Consumer',
    icon: Target,
    description: 'Feedback',
    count: 0,
    color: 'text-red-600'
  },
  {
    id: 'risk',
    name: 'Risk',
    icon: AlertTriangle,
    description: 'Legal',
    count: 0,
    color: 'text-orange-600'
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    icon: Lightbulb,
    description: 'White space',
    count: 0,
    color: 'text-yellow-500'
  },
  {
    id: 'saved',
    name: 'Saved Cards',
    icon: Bookmark,
    description: 'Your saved intelligence cards',
    count: 0,
    color: 'text-pink-600'
  },
  {
    id: 'archive',
    name: 'Archive',
    icon: Archive,
    description: 'Archived intelligence cards',
    count: 0,
    color: 'text-gray-500'
  },
  {
    id: 'groups',
    name: 'Groups',
    icon: Folder,
    description: 'Organized card collections',
    count: 0,
    color: 'text-purple-600'
  }
]

export default function IntelligenceBank({ onClose }: IntelligenceBankProps) {
  const [selectedCategory, setSelectedCategory] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileConfig, setShowProfileConfig] = useState(false)
  const [showFunctionsMenu, setShowFunctionsMenu] = useState(false)
  
  // Get agents for intelligence hub
  const [intelligenceAgents, setIntelligenceAgents] = useState<any[]>([])
  const [currentFunction, setCurrentFunction] = useState<string | null>(null)
  
  // Load agents on client side to avoid hydration mismatch
  React.useEffect(() => {
    setIntelligenceAgents(getAgentsForHub('intelligence'))
  }, [])
  
  // Controller states
  const [showCreateCard, setShowCreateCard] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'relevance' | 'credibility' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Filter states
  const [filterBy, setFilterBy] = useState('all')
  const [showQuickAddForm, setShowQuickAddForm] = useState(false)
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [quickAddSummary, setQuickAddSummary] = useState('')
  const [dateRange, setDateRange] = useState<{from?: string, to?: string}>({})
  const [credibilityRange, setCredibilityRange] = useState<[number, number]>([1, 10])
  const [relevanceRange, setRelevanceRange] = useState<[number, number]>([1, 10])
  const [sourceTypes, setSourceTypes] = useState<string[]>([])
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [tagFilters, setTagFilters] = useState<string[]>([])
  
  // Selection states
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [showGroupSelector, setShowGroupSelector] = useState(false)
  
  // Group states
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'category' | 'group'>('category')
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupColor, setNewGroupColor] = useState('blue')
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupCards, setGroupCards] = useState<CardData[]>([])
  const [loadingGroupCards, setLoadingGroupCards] = useState(false)
  
  // Refresh key for forcing component re-mount
  const [refreshKey, setRefreshKey] = useState(0)

  // Hooks
  const {
    cards,
    loading,
    refetch: refreshCards,
    getCategoryCounts,
    getStatusCounts,
    getCardsByCategory,
    getCardsByStatus,
    createCard,
    updateCard,
    deleteCard,
    toggleSaved,
    toggleArchived
  } = useIntelligenceBankCards()
  const { groups, createGroup, getGroupCards } = useIntelligenceGroups()
  
  const categoryCounts = getCategoryCounts()
  const statusCounts = getStatusCounts()

  // Global refresh function that updates everything
  const globalRefresh = React.useCallback(() => {
    refreshCards()
    setRefreshKey(prev => prev + 1) // Force component re-mount
    setSelectedCardIds(new Set()) // Clear selections as well
  }, [refreshCards])

  // Update category counts
  const categoriesWithCounts = INTELLIGENCE_CATEGORIES.map(cat => {
    let count = cat.count
    if (cat.id === 'saved') {
      count = statusCounts.saved || 0
    } else if (cat.id === 'archive') {
      count = statusCounts.archived || 0
    } else if (cat.id === 'groups') {
      count = groups.length || 0
    } else if (categoryCounts[cat.id]) {
      count = categoryCounts[cat.id] || 0
    }
    return { ...cat, count }
  })

  const selectedCategoryData = categoriesWithCounts.find(cat => cat.id === selectedCategory)
  const totalCards = categoriesWithCounts.reduce((sum, cat) => {
    if (cat.id === 'dashboard') return sum
    return sum + cat.count
  }, 0)
  
  // Color options for groups
  const colorOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
  ]

  const activeFilterCount = [
    dateRange.from || dateRange.to,
    credibilityRange[0] > 1 || credibilityRange[1] < 10,
    relevanceRange[0] > 1 || relevanceRange[1] < 10,
    sourceTypes.length > 0,
    statusFilters.length > 0,
    tagFilters.length > 0
  ].filter(Boolean).length

  // Handler for saving a new card
  const handleSaveNewCard = async (data: Partial<CardData>) => {
    const result = await createCard(data)
    if (result.success) {
      setShowCreateCard(false)
      globalRefresh()
    } else {
      alert('Failed to create card: ' + result.error)
    }
  }

  // Handlers
  const handleGroupClick = async (groupId: string) => {
    setSelectedGroup(groupId)
    setSelectedCategory('') // Clear category selection
    setViewType('group')
    setSelectedCardIds(new Set())
    
    // Load group cards
    setLoadingGroupCards(true)
    try {
      const groupCardsData = await getGroupCards(groupId)
      console.log('Group cards loaded:', groupCardsData)
      
      // Transform the data to match CardData interface
      const transformedCards = groupCardsData.map(item => {
        const card = item.intelligence_cards
        return {
          ...card,
          cardType: card.category, // Use category as cardType
          card_type: card.category, // Use category as card_type
          description: card.summary, // Map summary to description
          tags: card.tags || [],
          relationships: [], // Intelligence cards don't have relationships
          strategicAlignment: card.strategic_implications || '',
          createdDate: card.created_at,
          lastModified: card.updated_at,
          creator: '',
          owner: '',
          priority: 'Medium',
          confidenceLevel: 'Medium',
          priorityRationale: '',
          confidenceRationale: '',
          // Intelligence-specific fields
          intelligence_content: card.intelligence_content,
          key_findings: card.key_findings || [],
          credibility_score: card.credibility_score || 5,
          relevance_score: card.relevance_score || 5,
          source_reference: card.source_reference || '',
          recommended_actions: card.recommended_actions || ''
        }
      })
      
      setGroupCards(transformedCards)
    } catch (error) {
      console.error('Error loading group cards:', error)
      toast.error('Failed to load group cards')
      setGroupCards([])
    } finally {
      setLoadingGroupCards(false)
    }
  }
  
  const handleCreateGroupSubmit = async () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    setIsCreatingGroup(true)
    
    try {
      const newGroup = await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        color: newGroupColor
      })
      
      if (newGroup) {
        toast.success('Group created successfully!')
        
        // Reset form
        setNewGroupName('')
        setNewGroupDescription('')
        setNewGroupColor('blue')
        setShowCreateGroupForm(false)
        
        // Refresh the component to show updated counts
        globalRefresh()
      } else {
        toast.error('Failed to create group. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Failed to create group. Please try again.')
    } finally {
      setIsCreatingGroup(false)
    }
  }
  
  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy)
    setShowSortDropdown(false)
  }
  
  const sortOptions = [
    { value: 'date', label: 'Created Date' },
    { value: 'updated', label: 'Updated Date' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'relevance', label: 'Relevance' },
    { value: 'credibility', label: 'Credibility' }
  ]
  
  const handleFilterChange = (newFilter: string) => {
    setFilterBy(newFilter)
    setShowFilterDropdown(false)
  }
  
  const filterOptions = [
    { value: 'all', label: 'All Cards' },
    { value: 'active', label: 'Active' },
    { value: 'saved', label: 'Saved' },
    { value: 'archived', label: 'Archived' },
    { value: 'recent', label: 'Recent (7 days)' }
  ]
  
  const handleCreateCard = async () => {
    console.log('=== handleCreateCard START ===')
    console.log('Function called at:', new Date().toISOString())
    console.log('Selected category:', selectedCategory)
    console.log('createCard function:', typeof createCard)
    console.log('createCard function source:', createCard?.toString().substring(0, 100))
    
    const categoryBlueprintMap: Record<string, string> = {
      'market': 'market-intelligence',
      'competitor': 'competitor-intelligence',
      'trends': 'trends-intelligence',
      'technology': 'technology-intelligence',
      'stakeholder': 'stakeholder-intelligence',
      'consumer': 'consumer-intelligence',
      'risk': 'risk-intelligence',
      'opportunities': 'opportunities-intelligence'
    }
    
    console.log('Blueprint type:', categoryBlueprintMap[selectedCategory])
    console.log('Cards array length:', cards?.length)
    
    try {
      const cardData = {
        title: 'New Intelligence Card',
        description: 'Click to edit this card',
        card_type: categoryBlueprintMap[selectedCategory] || 'market-intelligence',
        card_data: {
          intelligence_content: '',
          key_findings: [],
          credibility_score: 5,
          relevance_score: 5
        }
      }
      
      console.log('Card data to create:', cardData)
      const result = await createCard(cardData)
      console.log('Create card result:', result)
      
      if (result.success) {
        toast.success('Card created successfully!')
        globalRefresh()
      } else {
        console.error('Card creation failed:', result.error)
        toast.error(result.error || 'Failed to create card')
      }
    } catch (error) {
      console.error('Exception in handleCreateCard:', error)
      toast.error('An error occurred while creating the card')
    }
  }
  
  const handleQuickAddToggle = () => {
    setShowQuickAddForm(!showQuickAddForm)
    if (!showQuickAddForm) {
      setQuickAddTitle('')
      setQuickAddSummary('')
    }
  }
  
  const handleGenerateCard = () => {
    // Create AI-generated placeholder card - opens editor
    handleCreateCard()
  }
  
  const handleQuickAddSubmit = async () => {
    if (!quickAddTitle.trim()) return
    
    const categoryBlueprintMap: Record<string, string> = {
      'market': 'market-intelligence',
      'competitor': 'competitor-intelligence',
      'trends': 'trends-intelligence',
      'technology': 'technology-intelligence',
      'stakeholder': 'stakeholder-intelligence',
      'consumer': 'consumer-intelligence',
      'risk': 'risk-intelligence',
      'opportunities': 'opportunities-intelligence'
    }
    
    const createResult = await createCard({
      title: quickAddTitle,
      description: quickAddSummary || quickAddTitle,
      card_type: categoryBlueprintMap[selectedCategory] || 'market-intelligence',
      card_data: {
        intelligence_content: '',
        key_findings: [],
        credibility_score: 5,
        relevance_score: 5,
        tags: []
      }
    })
    
    if (createResult.success) {
      toast.success('Quick Add card created successfully!')
      setShowQuickAddForm(false)
      setQuickAddTitle('')
      setQuickAddSummary('')
      globalRefresh()
    } else {
      toast.error(createResult.error || 'Failed to create card')
    }
  }
  
  // Helper function to get currently visible and filtered cards
  const getVisibleCards = () => {
    // Get cards based on view type
    const currentCards = viewType === 'group' ? groupCards : 
      selectedCategory === 'saved' ? getCardsByStatus('saved') :
      selectedCategory === 'archive' ? getCardsByStatus('archived') :
      getCardsByCategory(selectedCategory)
    
    // Apply same search filtering as IntelligenceCardGrid
    if (!searchQuery) return currentCards
    
    const query = searchQuery.toLowerCase()
    return currentCards.filter(card => 
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query)) ||
      (card.card_data?.intelligence_content && card.card_data.intelligence_content.toLowerCase().includes(query)) ||
      (card.intelligence_content && card.intelligence_content.toLowerCase().includes(query))
    )
  }

  const handleSelectAll = () => {
    const filteredCards = getVisibleCards()
    
    if (filteredCards.length === 0) {
      setSelectedCardIds(new Set())
      return
    }
    
    // Get IDs of visible cards
    const visibleCardIds = new Set(filteredCards.map(card => card.id))
    
    // Check if all visible cards are currently selected
    const allVisibleSelected = filteredCards.every(card => selectedCardIds.has(card.id))
    
    if (allVisibleSelected) {
      // All visible cards are selected, so deselect only the visible ones
      const newSelection = new Set(Array.from(selectedCardIds).filter(id => !visibleCardIds.has(id)))
      setSelectedCardIds(newSelection)
    } else {
      // Not all visible cards are selected, so add all visible cards to selection
      const newSelection = new Set(selectedCardIds)
      filteredCards.forEach(card => newSelection.add(card.id))
      setSelectedCardIds(newSelection)
    }
  }
  
  const handleBulkEdit = () => {
    if (selectedCardIds.size === 0) return
    alert('Bulk edit coming soon!')
  }
  
  const handleBulkDelete = async () => {
    if (selectedCardIds.size === 0) return
    
    const confirmMessage = `Are you sure you want to delete ${selectedCardIds.size} selected card${selectedCardIds.size > 1 ? 's' : ''}?`
    if (confirm(confirmMessage)) {
      try {
        const cardIds = Array.from(selectedCardIds)
        console.log('Deleting cards:', cardIds)
        
        // Delete cards one by one and track errors
        const results = await Promise.allSettled(
          cardIds.map(id => deleteCard(id))
        )
        
        const failed = results.filter(r => r.status === 'rejected')
        if (failed.length > 0) {
          console.error('Failed to delete some cards:', failed)
          toast.error(`Failed to delete ${failed.length} card${failed.length > 1 ? 's' : ''}`)
        } else {
          toast.success(`Deleted ${cardIds.length} card${cardIds.length > 1 ? 's' : ''}`)
        }
        
        setSelectedCardIds(new Set())
        globalRefresh()
      } catch (error) {
        console.error('Bulk delete error:', error)
        toast.error('Failed to delete cards')
      }
    }
  }
  
  const handleBulkDuplicate = () => {
    if (selectedCardIds.size === 0) return
    alert('Bulk duplicate coming soon!')
  }
  
  const handleBulkGroup = () => {
    if (selectedCardIds.size === 0) return
    setShowGroupSelector(true)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSortDropdown && !(e.target as HTMLElement).closest('.sort-dropdown')) {
        setShowSortDropdown(false)
      }
      if (showFunctionsMenu && !(e.target as HTMLElement).closest('.functions-menu')) {
        setShowFunctionsMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSortDropdown, showFunctionsMenu])

  return (
    <>
      <div className="h-full flex">
      {/* Left Sidebar - Template Bank pattern */}
      <div className="w-64 bg-white border-r border-gray-200">
        {/* Agent Tools Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Agent Tools</h3>
          
          <div className="space-y-1">
                
                
            {/* Dynamic Agents */}
            {intelligenceAgents.map((agent) => {
              const isSelected = selectedCategory === `agent-${agent.id}` && viewType === 'category'
              
              return (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedCategory(`agent-${agent.id}`)
                    setViewType('category')
                    setSelectedGroup(null)
                    setSelectedCardIds(new Set())
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors text-xs ${
                    isSelected 
                      ? 'bg-black bg-opacity-50 text-white' 
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  <span>{agent.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Intelligence Categories Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Intelligence Categories</h3>
              
              <div className="space-y-1">
                {categoriesWithCounts.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategory === category.id && viewType === 'category'
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setViewType('category')
                        setSelectedGroup(null)
                        setSelectedCardIds(new Set())
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors text-xs ${
                        isSelected 
                          ? 'bg-black bg-opacity-50 text-white' 
                          : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xs">{category.name}</span>
                    </button>
                  )
                })}
          </div>
        </div>

        {/* Groups Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider">Groups</h3>
            <button
              onClick={() => setShowCreateGroupForm(!showCreateGroupForm)}
              className="p-1 text-black hover:text-gray-600 transition-colors"
              title="Create Group"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
          </div>

          {/* Create Group Form */}
          {showCreateGroupForm && (
            <div className="mb-3 p-2 border border-gray-200 rounded-md bg-gray-50">
              <input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black mb-2"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateGroupSubmit()}
              />
              <textarea
                placeholder="Description (optional)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="w-full px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black mb-2 h-12 resize-none"
              />
              <div className="flex items-center gap-1 mb-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewGroupColor(color.value)}
                    className={`w-4 h-4 rounded-full ${color.color} ${
                      newGroupColor === color.value ? 'ring-2 ring-gray-400' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleCreateGroupSubmit}
                  disabled={isCreatingGroup || !newGroupName.trim()}
                  className="px-2 py-0.5 text-xs text-black hover:bg-black hover:bg-opacity-10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateGroupForm(false)
                    setNewGroupName('')
                    setNewGroupDescription('')
                    setNewGroupColor('blue')
                  }}
                  disabled={isCreatingGroup}
                  className="px-2 py-0.5 text-xs text-black hover:bg-black hover:bg-opacity-10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                  ${selectedGroup === group.id && viewType === 'group'
                    ? 'bg-black bg-opacity-50 text-white'
                    : 'text-black hover:bg-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colorOptions.find(c => c.value === group.color)?.color || 'bg-gray-400'}`} />
                  <span className="text-xs">{group.name}</span>
                </div>
                <span className={`text-xs ${
                  selectedGroup === group.id && viewType === 'group'
                    ? 'text-white'
                    : 'text-black'
                }`}>{group.card_count || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          {/* Title Section */}
          <div className="px-4 pt-2.5 pb-1.5">
            <h1 className="text-lg font-medium text-gray-900">
              {viewType === 'category' 
                ? `${selectedCategoryData?.name || ''}`
                : `${groups.find(g => g.id === selectedGroup)?.name || 'Group'}`
              }
            </h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {viewType === 'category'
                ? selectedCategoryData?.description || 'Intelligence collection'
                : groups.find(g => g.id === selectedGroup)?.description || 'Group collection of intelligence cards'
              }
            </p>
          </div>
          
          {/* Controls Bar */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-3 text-xs">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown)
                    setShowFilterDropdown(false)
                  }}
                  className="flex items-center gap-1 text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  Sort
                </button>
                
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value as any)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                          sortBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFilterDropdown(!showFilterDropdown)
                    setShowSortDropdown(false)
                  }}
                  className="flex items-center gap-1 text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                >
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
                
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                          filterBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Controls (only show in category view) */}
              {viewType === 'category' && selectedCategory !== 'dashboard' && selectedCategory !== 'profile' && !selectedCategory.startsWith('agent-') && selectedCategory !== 'groups' && (
                <>
                  <button 
                    onClick={() => {
                      console.log('=== Add Button Clicked ===')
                      console.log('Selected Category:', selectedCategory)
                      console.log('ViewType:', viewType)
                      handleCreateCard()
                    }}
                    className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    Add
                  </button>

                  <button 
                    onClick={handleQuickAddToggle}
                    className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    Quick Add
                  </button>

                  <button 
                    onClick={handleGenerateCard}
                    className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    AI Generate
                  </button>
                </>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Select All */}
              <label className="flex items-center gap-1 text-gray-700 cursor-pointer hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors">
                <input
                  type="checkbox"
                  ref={(el) => {
                    if (el) {
                      const visibleCards = getVisibleCards()
                      if (visibleCards.length === 0) {
                        el.checked = false
                        el.indeterminate = false
                        return
                      }
                      
                      const visibleCardIds = new Set(visibleCards.map(card => card.id))
                      const selectedVisibleCount = Array.from(selectedCardIds).filter(id => visibleCardIds.has(id)).length
                      
                      if (selectedVisibleCount === 0) {
                        el.checked = false
                        el.indeterminate = false
                      } else if (selectedVisibleCount === visibleCards.length) {
                        el.checked = true
                        el.indeterminate = false
                      } else {
                        el.checked = false
                        el.indeterminate = true
                      }
                    }
                  }}
                  onChange={() => handleSelectAll()}
                  className="w-3 h-3 rounded border-gray-300 text-black focus:ring-black"
                />
                <span>Select All</span>
              </label>

              {/* Icon Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleBulkEdit}
                  className={`p-1 rounded transition-colors ${
                    selectedCardIds.size > 0 
                      ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={selectedCardIds.size === 0}
                  title="Edit"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleBulkDelete}
                  className={`p-1 rounded transition-colors ${
                    selectedCardIds.size > 0 
                      ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={selectedCardIds.size === 0}
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleBulkDuplicate}
                  className={`p-1 rounded transition-colors ${
                    selectedCardIds.size > 0 
                      ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={selectedCardIds.size === 0}
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={handleBulkGroup}
                  className={`p-1 rounded transition-colors ${
                    selectedCardIds.size > 0 
                      ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={selectedCardIds.size === 0}
                  title="Group"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center ml-2 bg-gray-100 rounded p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List view"
                >
                  <List className="w-3 h-3" />
                </button>
              </div>

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 ml-2 text-black hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Selected Count */}
              {selectedCardIds.size > 0 && (
                <span className="text-[11px] text-gray-500 ml-1">
                  {selectedCardIds.size} selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Form */}
        {showQuickAddForm && (
          <div
            className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
              showQuickAddForm ? 'max-h-32' : 'max-h-0'
            }`}
          >
            <div className="px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700">Quick Add Card to {selectedCategoryData?.name}</span>
                </div>
                <button
                  onClick={() => {
                    setShowQuickAddForm(false)
                    setQuickAddTitle('')
                    setQuickAddSummary('')
                  }}
                  className="ml-auto text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Card title"
                  value={quickAddTitle}
                  onChange={(e) => setQuickAddTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handleQuickAddSubmit()
                    } else if (e.key === 'Escape') {
                      setShowQuickAddForm(false)
                      setQuickAddTitle('')
                      setQuickAddSummary('')
                    }
                  }}
                  className="flex-1 px-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Summary (optional)"
                  value={quickAddSummary}
                  onChange={(e) => setQuickAddSummary(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handleQuickAddSubmit()
                    } else if (e.key === 'Escape') {
                      setShowQuickAddForm(false)
                      setQuickAddTitle('')
                      setQuickAddSummary('')
                    }
                  }}
                  className="flex-1 px-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black"
                />
                <button
                  onClick={() => {
                    setShowQuickAddForm(false)
                    setQuickAddTitle('')
                    setQuickAddSummary('')
                  }}
                  className="px-1.5 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickAddSubmit}
                  disabled={!quickAddTitle.trim()}
                  className="px-1.5 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Card
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Press Esc to close • ⌘ + Enter to save
              </div>
            </div>
          </div>
        )}

        {/* Cards Content */}
        <div className="flex-1 p-4">
          {selectedCategory.startsWith('agent-') ? (
            <AgentsSection 
              selectedAgentId={selectedCategory.replace('agent-', '')}
              onClose={() => setSelectedCategory('dashboard')} 
              onCardsCreated={refreshCards}
            />
          ) : selectedCategory === 'dashboard' ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <DashboardContent 
                categoryCounts={categoryCounts}
                statusCounts={statusCounts}
                totalCards={totalCards}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          ) : selectedCategory === 'profile' ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <IntelligenceProfile />
            </div>
          ) : selectedCategory === 'groups' ? (
            <>
              {console.log('🔍 Rendering IntelligenceGroups component')}
              <IntelligenceGroups />
            </>
          ) : viewType === 'group' && loadingGroupCards ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <IntelligenceCardList
              cards={
                viewType === 'group' ? groupCards :
                selectedCategory === 'saved' ? getCardsByStatus('saved') :
                selectedCategory === 'archive' ? getCardsByStatus('archived') :
                getCardsByCategory(selectedCategory)
              }
              searchQuery={searchQuery}
              viewMode={viewMode}
              selectedCardIds={selectedCardIds}
              onSelectCard={(cardId) => {
                const newSelected = new Set(selectedCardIds)
                if (newSelected.has(cardId)) {
                  newSelected.delete(cardId)
                } else {
                  newSelected.add(cardId)
                }
                setSelectedCardIds(newSelected)
              }}
              onEditCard={(card) => {
                // For duplicating cards
                if (card.id === '') {
                  createCard(card)
                }
              }}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              onCreateCard={handleCreateCard}
              onRefresh={globalRefresh}
            />
          )}
        </div>
      </div>
    </div>

    {/* Modals */}

    {showGroupSelector && (
      <CardGroupSelector
        cardIds={Array.from(selectedCardIds)}
        onClose={() => setShowGroupSelector(false)}
        onComplete={() => {
          setSelectedCardIds(new Set())
          setShowGroupSelector(false)
          globalRefresh()
          
          // If we're viewing a group, refresh the group cards
          if (viewType === 'group' && selectedGroup) {
            handleGroupClick(selectedGroup)
          }
        }}
      />
    )}
  </>
  )
}
