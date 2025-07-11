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
  TestTube,
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
  Zap
} from 'lucide-react'
import IntelligenceProfile from './IntelligenceProfile'
import IntelligenceCardList from '../intelligence-cards/IntelligenceCardList'
import IntelligenceCardEditor from '../intelligence-cards/IntelligenceCardEditor'
import IntelligenceGroups from '../intelligence-groups/IntelligenceGroups'
import BulkActionsToolbar from '../intelligence-groups/BulkActionsToolbar'
import CardGroupSelector from '../intelligence-groups/CardGroupSelector'
import AutomationDashboard from '../intelligence/AutomationDashboard'
import { 
  IntelligenceCard as IntelligenceCardType,
  IntelligenceCardCategory,
  IntelligenceCardStatus,
  CreateIntelligenceCardData,
  UpdateIntelligenceCardData
} from '@/types/intelligence-cards'
import { useIntelligenceCardCounts, useCreateIntelligenceCard, useUpdateIntelligenceCard, useIntelligenceCardActions } from '@/hooks/useIntelligenceCards'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'

interface IntelligenceBankProps {
  isOpen: boolean
  onClose: () => void
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

export default function IntelligenceBank({ isOpen, onClose }: IntelligenceBankProps) {
  const [selectedCategory, setSelectedCategory] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileConfig, setShowProfileConfig] = useState(false)
  const [showFunctionsMenu, setShowFunctionsMenu] = useState(false)
  const [currentFunction, setCurrentFunction] = useState<string | null>(null)
  
  // Controller states
  const [showCreateCard, setShowCreateCard] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'relevance' | 'credibility' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Filter states
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
  
  // Editor states
  const [showEditor, setShowEditor] = useState(false)
  const [editingCard, setEditingCard] = useState<IntelligenceCardType | null>(null)

  // Hooks
  const { categoryCounts, statusCounts, refresh: refreshCounts } = useIntelligenceCardCounts()
  const { create: createCard } = useCreateIntelligenceCard()
  const { groups } = useIntelligenceGroups()
  const { save: saveCard, archive: archiveCard, delete: deleteCard } = useIntelligenceCardActions()

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

  const activeFilterCount = [
    dateRange.from || dateRange.to,
    credibilityRange[0] > 1 || credibilityRange[1] < 10,
    relevanceRange[0] > 1 || relevanceRange[1] < 10,
    sourceTypes.length > 0,
    statusFilters.length > 0,
    tagFilters.length > 0
  ].filter(Boolean).length

  // Handler for saving a new card
  const handleSaveNewCard = async (data: CreateIntelligenceCardData) => {
    const result = await createCard(data)
    if (result.success) {
      setShowCreateCard(false)
      refreshCounts()
    } else {
      alert('Failed to create card: ' + result.error)
    }
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

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        
        {/* Intelligence Bank Modal */}
        <div className="relative w-full max-w-7xl mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden flex">
          {/* Left Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-medium">Intelligence Bank</h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {/* Intelligence Tools Button */}
              <button 
                onClick={() => setShowFunctionsMenu(!showFunctionsMenu)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors mb-3 functions-menu"
              >
                <Menu className="w-3 h-3" />
                <span>Intelligence Tools</span>
              </button>
              
              {/* Functions Dropdown in Sidebar */}
              {showFunctionsMenu && (
                <div className="mb-3 space-y-1 functions-menu">
                  <button
                    onClick={() => {
                      setSelectedCategory('profile')
                      setShowFunctionsMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 rounded flex items-center space-x-2 text-gray-900"
                  >
                    <Settings className="w-3 h-3 text-gray-500" />
                    <span className="text-xs">Intelligence Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedCategory('upload-data')
                      setShowFunctionsMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 rounded flex items-center space-x-2 text-gray-900"
                  >
                    <Upload className="w-3 h-3 text-gray-500" />
                    <span className="text-xs">Upload Data</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedCategory('upload-link')
                      setShowFunctionsMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 rounded flex items-center space-x-2 text-gray-900"
                  >
                    <Link className="w-3 h-3 text-gray-500" />
                    <span className="text-xs">Upload Link</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedCategory('text-paste')
                      setShowFunctionsMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 rounded flex items-center space-x-2 text-gray-900"
                  >
                    <TestTube className="w-3 h-3 text-gray-500" />
                    <span className="text-xs">Text/Paste</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedCategory('automation')
                      setShowFunctionsMenu(false)
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 rounded flex items-center space-x-2 text-gray-900"
                  >
                    <Zap className="w-3 h-3 text-gray-500" />
                    <span className="text-xs">Automation</span>
                  </button>
                </div>
              )}
              
              <p className="text-xs text-gray-600">Strategic intelligence for informed decisions</p>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Intelligence Categories
              </h3>
              
              <div className="space-y-1">
                {categoriesWithCounts.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategory === category.id
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors text-xs ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-1.5">+</span>
                        <span>{category.name}</span>
                      </div>
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        isSelected 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  {selectedCategoryData && (
                    <>
                      <selectedCategoryData.icon className="w-5 h-5 text-gray-600 hidden sm:block" />
                      <div>
                        <h1 className="text-base font-medium">{selectedCategoryData.name} Intelligence</h1>
                        <p className="text-xs text-gray-600 hidden sm:block">{selectedCategoryData.description}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
                  {/* Selection Action Buttons - shown when cards are selected */}
                  {selectedCardIds.size > 0 ? (
                    <>
                      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-xs font-medium text-blue-700">
                          {selectedCardIds.size} selected
                        </span>
                        <button
                          onClick={() => {
                            setSelectedCardIds(new Set())
                            setIsSelectionMode(false)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => setShowGroupSelector(true)}
                        className="flex items-center space-x-1 px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                      >
                        <FolderPlus className="w-3 h-3" />
                        <span className="hidden sm:inline">Add to Group</span>
                        <span className="sm:hidden">Group</span>
                      </button>
                      
                      <button
                        onClick={async () => {
                          try {
                            const cardIds = Array.from(selectedCardIds)
                            await Promise.all(cardIds.map(id => saveCard(id)))
                            setSelectedCardIds(new Set())
                            setIsSelectionMode(false)
                            refreshCounts()
                          } catch (error) {
                            alert('Failed to save cards. Please try again.')
                            console.error('Save cards error:', error)
                          }
                        }}
                        className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                      
                      <button
                        onClick={async () => {
                          try {
                            const cardIds = Array.from(selectedCardIds)
                            await Promise.all(cardIds.map(id => archiveCard(id)))
                            setSelectedCardIds(new Set())
                            setIsSelectionMode(false)
                            refreshCounts()
                          } catch (error) {
                            alert('Failed to archive cards. Please try again.')
                            console.error('Archive cards error:', error)
                          }
                        }}
                        className="flex items-center space-x-1 px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 transition-colors"
                      >
                        <Archive className="w-3 h-3" />
                        <span className="hidden sm:inline">Archive</span>
                      </button>
                      
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete ${selectedCardIds.size} selected card${selectedCardIds.size > 1 ? 's' : ''}? This action cannot be undone.`)) {
                            try {
                              const cardIds = Array.from(selectedCardIds)
                              await Promise.all(cardIds.map(id => deleteCard(id)))
                              setSelectedCardIds(new Set())
                              setIsSelectionMode(false)
                              refreshCounts()
                            } catch (error) {
                              alert('Failed to delete cards. Please try again.')
                              console.error('Delete cards error:', error)
                            }
                          }
                        }}
                        className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Regular Action Buttons - shown when no cards are selected */}
                      {/* Add Card Button */}
                      {selectedCategory !== 'dashboard' && selectedCategory !== 'profile' && selectedCategory !== 'upload-data' && selectedCategory !== 'upload-link' && selectedCategory !== 'text-paste' && selectedCategory !== 'automation' && (
                        <button 
                          onClick={() => {
                            const event = new CustomEvent('intelligence-bank-create-card', { 
                              detail: { category: selectedCategory } 
                            });
                            document.dispatchEvent(event);
                          }}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="hidden sm:inline">Add Card</span>
                          <span className="sm:hidden">Add</span>
                        </button>
                      )}
                      
                      <button className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors">
                        <TestTube className="w-3 h-3" />
                        <span className="hidden lg:inline">Test MCP System</span>
                        <span className="lg:hidden">Test</span>
                      </button>
                      
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{totalCards}</span> cards
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Search and Filters - only for card categories */}
              {selectedCategory !== 'dashboard' && selectedCategory !== 'profile' && selectedCategory !== 'upload-data' && selectedCategory !== 'upload-link' && selectedCategory !== 'text-paste' && selectedCategory !== 'automation' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search intelligence cards..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                    />
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div className="relative sort-dropdown">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center justify-center space-x-1 px-2 py-1.5 text-xs font-medium rounded border bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors min-w-[60px]"
                    >
                      <span className="hidden sm:inline">Sort</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {/* Sort Dropdown Menu */}
                    {showSortDropdown && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setSortBy('date')
                              setSortOrder('desc')
                              setShowSortDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-900 ${
                              sortBy === 'date' && sortOrder === 'desc' ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            Date (Newest First)
                          </button>
                          <button
                            onClick={() => {
                              setSortBy('date')
                              setSortOrder('asc')
                              setShowSortDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-900 ${
                              sortBy === 'date' && sortOrder === 'asc' ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            Date (Oldest First)
                          </button>
                          <button
                            onClick={() => {
                              setSortBy('relevance')
                              setSortOrder('desc')
                              setShowSortDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-900 ${
                              sortBy === 'relevance' ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            Relevance (High to Low)
                          </button>
                          <button
                            onClick={() => {
                              setSortBy('credibility')
                              setSortOrder('desc')
                              setShowSortDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-900 ${
                              sortBy === 'credibility' ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            Credibility (High to Low)
                          </button>
                          <button
                            onClick={() => {
                              setSortBy('title')
                              setSortOrder('asc')
                              setShowSortDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-900 ${
                              sortBy === 'title' && sortOrder === 'asc' ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            Title (A to Z)
                          </button>
                          <button
                            onClick={() => {
                              setSortBy('title')
                              setSortOrder('desc')
                              setShowSortDropdown(false)
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 text-gray-900 ${
                              sortBy === 'title' && sortOrder === 'desc' ? 'bg-gray-50 font-medium' : ''
                            }`}
                          >
                            Title (Z to A)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded p-0.5">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded transition-colors ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <List className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Grid3X3 className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`flex items-center space-x-1 px-2 py-1.5 text-xs font-medium rounded border transition-colors ${
                      showAdvancedFilters 
                        ? 'bg-gray-900 text-white border-gray-900' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    <span className="hidden sm:inline">Advanced Filters</span>
                    <span className="sm:hidden">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="ml-1 px-1 py-0.5 bg-blue-600 text-white text-[10px] rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              )}
              
              {/* Advanced Filters Panel */}
              {showAdvancedFilters && selectedCategory !== 'dashboard' && selectedCategory !== 'profile' && selectedCategory !== 'upload-data' && selectedCategory !== 'upload-link' && selectedCategory !== 'text-paste' && selectedCategory !== 'automation' && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-md animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4">
                    {/* Date Range */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">From</label>
                          <input
                            type="date"
                            value={dateRange.from || ''}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">To</label>
                          <input
                            type="date"
                            value={dateRange.to || ''}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Ranges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Credibility Score: {credibilityRange[0]} - {credibilityRange[1]}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={credibilityRange[0]}
                            onChange={(e) => setCredibilityRange([parseInt(e.target.value), credibilityRange[1]])}
                            className="flex-1"
                          />
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={credibilityRange[1]}
                            onChange={(e) => setCredibilityRange([credibilityRange[0], parseInt(e.target.value)])}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Relevance Score: {relevanceRange[0]} - {relevanceRange[1]}
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={relevanceRange[0]}
                            onChange={(e) => setRelevanceRange([parseInt(e.target.value), relevanceRange[1]])}
                            className="flex-1"
                          />
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={relevanceRange[1]}
                            onChange={(e) => setRelevanceRange([relevanceRange[0], parseInt(e.target.value)])}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Source Type and Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Source Type</label>
                        <div className="space-y-1">
                          {['URL', 'Document', 'Manual', 'Transcript'].map(source => (
                            <label key={source} className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={sourceTypes.includes(source)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSourceTypes([...sourceTypes, source])
                                  } else {
                                    setSourceTypes(sourceTypes.filter(s => s !== source))
                                  }
                                }}
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              {source}
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                        <div className="space-y-1">
                          {['Active', 'Saved', 'Archived'].map(status => (
                            <label key={status} className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={statusFilters.includes(status.toLowerCase())}
                                onChange={(e) => {
                                  const statusValue = status.toLowerCase()
                                  if (e.target.checked) {
                                    setStatusFilters([...statusFilters, statusValue])
                                  } else {
                                    setStatusFilters(statusFilters.filter(s => s !== statusValue))
                                  }
                                }}
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              {status}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tagFilters.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              onClick={() => setTagFilters(tagFilters.filter((_, i) => i !== index))}
                              className="ml-1 hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add tag and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            setTagFilters([...tagFilters, e.currentTarget.value.trim()])
                            e.currentTarget.value = ''
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => {
                          setDateRange({})
                          setCredibilityRange([1, 10])
                          setRelevanceRange([1, 10])
                          setSourceTypes([])
                          setStatusFilters([])
                          setTagFilters([])
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Clear All Filters
                      </button>
                      <button
                        onClick={() => setShowAdvancedFilters(false)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {selectedCategory === 'dashboard' ? (
                <DashboardContent 
                  categoryCounts={categoryCounts}
                  statusCounts={statusCounts}
                  totalCards={totalCards}
                />
              ) : selectedCategory === 'profile' ? (
                <div className="p-6">
                  <IntelligenceProfile />
                </div>
              ) : selectedCategory === 'upload-data' ? (
                <UploadDataContent />
              ) : selectedCategory === 'upload-link' ? (
                <UploadLinkContent />
              ) : selectedCategory === 'text-paste' ? (
                <TextPasteContent />
              ) : selectedCategory === 'automation' ? (
                <AutomationContent />
              ) : selectedCategory === 'groups' ? (
                <IntelligenceGroups
                  selectedCardIds={selectedCardIds}
                  setSelectedCardIds={setSelectedCardIds}
                  isSelectionMode={isSelectionMode}
                  setIsSelectionMode={setIsSelectionMode}
                />
              ) : (
                <IntelligenceCardsContent 
                  category={selectedCategory}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  viewMode={viewMode}
                  dateRange={dateRange}
                  credibilityRange={credibilityRange}
                  relevanceRange={relevanceRange}
                  sourceTypes={sourceTypes}
                  statusFilters={statusFilters}
                  tagFilters={tagFilters}
                  selectedCardIds={selectedCardIds}
                  setSelectedCardIds={setSelectedCardIds}
                  isSelectionMode={isSelectionMode}
                  setIsSelectionMode={setIsSelectionMode}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedCardIds.size}
        onAddToGroup={() => setShowGroupSelector(true)}
        onClearSelection={() => {
          setSelectedCardIds(new Set())
          setIsSelectionMode(false)
        }}
      />

      {/* Group Selector Modal */}
      {showGroupSelector && (
        <CardGroupSelector
          cardIds={Array.from(selectedCardIds)}
          onClose={() => setShowGroupSelector(false)}
          onComplete={() => {
            setSelectedCardIds(new Set())
            setIsSelectionMode(false)
          }}
        />
      )}
    </>
  )
}

// Dashboard Content Component
interface DashboardContentProps {
  categoryCounts: Record<string, number>
  statusCounts: { saved: number, archived: number }
  totalCards: number
}

function DashboardContent({ categoryCounts, statusCounts, totalCards }: DashboardContentProps) {
  return (
    <div className="p-6">
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
              if (!categoryData || categoryData.id === 'dashboard') return null
              
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
            
            <button 
              onClick={() => console.log('Upload Data clicked')}
              className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">Upload Data</div>
                <div className="text-xs text-gray-500">Convert files to intelligence</div>
              </div>
            </button>
            
            <button 
              onClick={() => console.log('Upload Link clicked')}
              className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Link className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">Analyze URL</div>
                <div className="text-xs text-gray-500">Extract intelligence from links</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Full Cards Content Component with ALL functionality restored
interface IntelligenceCardsContentProps {
  category: string
  searchQuery: string
  sortBy: 'date' | 'relevance' | 'credibility' | 'title'
  sortOrder: 'asc' | 'desc'
  viewMode: 'list' | 'grid'
  dateRange: {from?: string, to?: string}
  credibilityRange: [number, number]
  relevanceRange: [number, number]
  sourceTypes: string[]
  statusFilters: string[]
  tagFilters: string[]
  selectedCardIds: Set<string>
  setSelectedCardIds: (ids: Set<string>) => void
  isSelectionMode: boolean
  setIsSelectionMode: (mode: boolean) => void
}

function IntelligenceCardsContent({ 
  category, 
  searchQuery,
  sortBy,
  sortOrder,
  viewMode,
  dateRange,
  credibilityRange,
  relevanceRange,
  sourceTypes,
  statusFilters,
  tagFilters,
  selectedCardIds,
  setSelectedCardIds,
  isSelectionMode,
  setIsSelectionMode
}: IntelligenceCardsContentProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [editingCard, setEditingCard] = useState<IntelligenceCardType | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { create: createCard } = useCreateIntelligenceCard()
  const { update: updateCard } = useUpdateIntelligenceCard()
  const { refresh: refreshCounts } = useIntelligenceCardCounts()

  // Map category to proper type
  const getCategoryType = (categoryId: string): IntelligenceCardCategory | IntelligenceCardStatus | undefined => {
    if (categoryId === 'saved') return IntelligenceCardStatus.SAVED
    if (categoryId === 'archive') return IntelligenceCardStatus.ARCHIVED
    return categoryId as IntelligenceCardCategory
  }

  const handleCreateCard = () => {
    setEditingCard(null)
    setShowEditor(true)
  }

  const handleEditCard = (card: IntelligenceCardType) => {
    setEditingCard(card)
    setShowEditor(true)
  }

  const handleSaveCard = async (data: CreateIntelligenceCardData | UpdateIntelligenceCardData) => {
    let result
    
    if (editingCard) {
      result = await updateCard(editingCard.id, data)
    } else {
      result = await createCard(data as CreateIntelligenceCardData)
    }
    
    if (result.success) {
      setShowEditor(false)
      setEditingCard(null)
      refreshCounts()
      setRefreshKey(prev => prev + 1)
    } else {
      alert(`Failed to ${editingCard ? 'update' : 'create'} card: ` + result.error)
    }
  }

  const categoryType = getCategoryType(category)
  const isStatusView = category === 'saved' || category === 'archive'
  
  const cardFilters = React.useMemo(() => {
    if (isStatusView) {
      return {
        category: undefined,
        status: categoryType as IntelligenceCardStatus
      }
    } else {
      return {
        category: categoryType as IntelligenceCardCategory,
        status: IntelligenceCardStatus.ACTIVE
      }
    }
  }, [category, categoryType, isStatusView])

  // Debug logging for filters
  React.useEffect(() => {
    console.log(`IntelligenceCardsContent filters for category ${category}:`, cardFilters)
  }, [category, cardFilters])

  // Listen for Add Card events from the main header
  React.useEffect(() => {
    const handleCreateCardEvent = (event: CustomEvent) => {
      if (event.detail.category === category) {
        handleCreateCard()
      }
    }
    
    document.addEventListener('intelligence-bank-create-card', handleCreateCardEvent as EventListener)
    return () => {
      document.removeEventListener('intelligence-bank-create-card', handleCreateCardEvent as EventListener)
    }
  }, [category, handleCreateCard])

  return (
    <div className="p-4">
      {/* Intelligence Card List */}
      <IntelligenceCardList
        key={`${category}-${refreshKey}`}
        category={cardFilters.category}
        status={cardFilters.status}
        onEditCard={handleEditCard}
        showFilters={false}
        showViewToggle={false}
        sortBy={sortBy}
        sortOrder={sortOrder}
        viewMode={viewMode}
        searchQuery={searchQuery}
        dateRange={dateRange}
        credibilityRange={credibilityRange}
        relevanceRange={relevanceRange}
        sourceTypes={sourceTypes}
        statusFilters={statusFilters}
        tagFilters={tagFilters}
        selectedCardIds={selectedCardIds}
        setSelectedCardIds={setSelectedCardIds}
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
      />

      {/* Card Editor Modal */}
      {showEditor && (
        <IntelligenceCardEditor
          card={editingCard}
          category={!isStatusView ? categoryType as IntelligenceCardCategory : IntelligenceCardCategory.MARKET}
          onSave={handleSaveCard}
          onCancel={() => setShowEditor(false)}
          isEditing={!!editingCard}
        />
      )}
    </div>
  )
}

// Upload Data Page Component
function UploadDataContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Data</h2>
        <p className="text-sm text-gray-600">Convert files to intelligence cards</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Upload Data functionality coming soon</p>
          <p className="text-xs text-gray-400 mt-1">Drag and drop files or select from your device</p>
        </div>
      </div>
    </div>
  )
}

// Upload Link Page Component
function UploadLinkContent() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Link</h2>
        <p className="text-sm text-gray-600">Analyze URLs for intelligence extraction</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <Link className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">URL Analysis functionality coming soon</p>
          <p className="text-xs text-gray-400 mt-1">Paste URLs to extract intelligence content</p>
        </div>
      </div>
    </div>
  )
}

// Text/Paste Page Component
function TextPasteContent() {
  const [textContent, setTextContent] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [category, setCategory] = React.useState<IntelligenceCardCategory>(IntelligenceCardCategory.MARKET)

  const handleProcess = async () => {
    if (!textContent.trim()) {
      alert('Please enter some text to process')
      return
    }

    setIsProcessing(true)
    // Placeholder for MCP processing
    console.log('Processing text content:', textContent)
    console.log('Target category:', category)
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false)
      alert('Text processing functionality will be implemented with MCP integration')
    }, 2000)
  }

  const handleClear = () => {
    setTextContent('')
  }

  const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = textContent.length

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Text/Paste Intelligence</h2>
        <p className="text-xs text-gray-600">Convert transcripts into intelligence cards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Text Input Area */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Content Input</h3>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span>{wordCount} words</span>
                  <span>{charCount} chars</span>
                </div>
              </div>
            </div>
            
            <div className="p-3">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste transcript or text content here..."
                className="w-full h-64 p-3 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none text-gray-900 bg-white"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace' }}
              />
            </div>
            
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={!textContent.trim()}
                >
                  Clear
                </button>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IntelligenceCardCategory)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-900 bg-white"
                  >
                    <option value={IntelligenceCardCategory.MARKET}>Market</option>
                    <option value={IntelligenceCardCategory.COMPETITOR}>Competitor</option>
                    <option value={IntelligenceCardCategory.CONSUMER}>Consumer</option>
                    <option value={IntelligenceCardCategory.TECHNOLOGY}>Technology</option>
                    <option value={IntelligenceCardCategory.TRENDS}>Trends</option>
                    <option value={IntelligenceCardCategory.STAKEHOLDER}>Stakeholder</option>
                    <option value={IntelligenceCardCategory.RISK}>Risk</option>
                    <option value={IntelligenceCardCategory.OPPORTUNITIES}>Opportunities</option>
                  </select>
                  
                  <button
                    onClick={handleProcess}
                    disabled={!textContent.trim() || isProcessing}
                    className="px-3 py-1 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing</span>
                      </>
                    ) : (
                      <>
                        <TestTube className="w-3 h-3" />
                        <span>Process</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Instructions */}
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center">
              <Lightbulb className="w-3 h-3 mr-1" />
              Instructions
            </h4>
            <div className="space-y-1 text-[10px] text-gray-600">
              <p>• Select category</p>
              <p>• Paste content</p>
              <p>• Click Process</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Content Types</h4>
            <div className="space-y-1">
              {[
                { type: 'Interviews', icon: '🎤' },
                { type: 'Meetings', icon: '📝' },
                { type: 'Research', icon: '📊' },
                { type: 'Feedback', icon: '💬' }
              ].map((content, index) => (
                <div key={index} className="flex items-center space-x-1 text-[10px] text-gray-600">
                  <span className="text-xs">{content.icon}</span>
                  <span>{content.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



// Automation Content Component
function AutomationContent() {
  return <AutomationDashboard />
}
