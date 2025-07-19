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
  CheckCircle,
  Edit,
  Copy,
  Trash2,
  ChevronDown
} from 'lucide-react'
import { CardData } from '@/types/card'
import { BLUEPRINT_REGISTRY } from '@/components/blueprints/registry'
import { useStrategy } from '@/contexts/StrategyContext'

interface WorkspacePreviewProps {
  pages: CardData[]
  loading: boolean
  selectedPage: CardData | null
  searchQuery: string
  filters: any
  onPageSelect: (page: CardData) => void
  onSearchChange: (query: string) => void
  onFiltersChange: (filters: any) => void
  onAddPage: () => void
  onGenerateAI: () => void
  hubId: string
  sectionId: string
}

export default function WorkspacePreview({ 
  pages, 
  loading, 
  selectedPage, 
  searchQuery, 
  filters,
  onPageSelect,
  onSearchChange,
  onFiltersChange,
  onAddPage,
  onGenerateAI,
  hubId,
  sectionId
}: WorkspacePreviewProps) {
  const { currentStrategy } = useStrategy()
  const [showFilters, setShowFilters] = useState(false)

  const filteredPages = pages.filter(page => {
    // Strategy filtering - only show pages for current strategy
    const matchesStrategy = !currentStrategy || page.strategy_id === currentStrategy.id
    
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filters.priority === 'all' || page.priority === filters.priority
    const matchesStatus = filters.status === 'all' || page.cardType === filters.status
    
    return matchesStrategy && matchesSearch && matchesPriority && matchesStatus
  })

  // Debug logging
  console.log('🔍 WorkspacePreview Debug:', {
    pagesReceived: pages.length,
    currentStrategy: currentStrategy?.id,
    filteredPages: filteredPages.length,
    sortedPages: filteredPages.length,
    hubId,
    sectionId,
    firstPage: pages[0] ? {
      id: pages[0].id,
      title: pages[0].title,
      strategy_id: pages[0].strategy_id,
      cardType: pages[0].cardType,
      strategyIdType: typeof pages[0].strategy_id,
      currentStrategyType: typeof currentStrategy?.id
    } : null,
    allPagesData: pages.map(p => ({
      title: p.title,
      cardType: p.cardType,
      strategy_id: p.strategy_id
    }))
  })

  const sortedPages = [...filteredPages].sort((a, b) => {
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

  const getBlueprintIcon = (cardType: string) => {
    const blueprint = BLUEPRINT_REGISTRY[cardType]
    return blueprint?.icon || '📄'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500'
      case 'Medium': return 'text-yellow-500'
      case 'Low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSectionTitle = () => {
    const blueprint = BLUEPRINT_REGISTRY[sectionId]
    return blueprint?.name || sectionId
  }

  const getFormattedId = (page: CardData) => {
    const blueprint = BLUEPRINT_REGISTRY[page.cardType]
    const prefix = blueprint?.prefix || 'GEN'
    const numericId = page.id?.replace(/\D/g, '') || '1'
    return `${prefix}-${numericId}`
  }

  // Special home view
  if (hubId === 'home') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Workspace</h2>
          <p className="text-sm text-gray-500">Overview of your workspace pages</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900">Strategy Pages</h3>
              <p className="text-sm text-blue-700">15 active pages</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900">Intelligence Pages</h3>
              <p className="text-sm text-green-700">8 active pages</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-medium text-orange-900">Development Pages</h3>
              <p className="text-sm text-orange-700">12 active pages</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900">Organisation Pages</h3>
              <p className="text-sm text-purple-700">5 active pages</p>
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
          <p className="text-gray-600">Loading workspace pages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">
            {getSectionTitle()}
          </h2>
          <span className="text-xs text-gray-300">
            {sortedPages.length} pages
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent h-8"
          />
        </div>

        {/* Expandable Filter Controls */}
        <div className="mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-xs border border-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5" />
              <span>{showFilters ? 'Hide Filters' : 'Add Filters'}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-2 p-3 bg-gray-800 border border-gray-600 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-700 border border-gray-600 text-white rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-1 focus:ring-orange-500 h-7 mr-2"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="title">Title A-Z</option>
                  <option value="priority">Priority</option>
                </select>

                <button
                  onClick={() => onFiltersChange({ ...filters, sortBy: filters.sortBy === 'asc' ? 'desc' : 'asc' })}
                  className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-md transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 h-6"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 h-6"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-3">
          <button
            onClick={onAddPage}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-xs font-medium h-8 w-full"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>

          <button
            onClick={onGenerateAI}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 border border-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs font-medium h-8 w-full"
          >
            <Zap className="w-4 h-4" />
            <span>Generate AI</span>
          </button>
        </div>

      </div>

      {/* Page Preview List */}
      <div className="flex-1 overflow-y-auto p-2">
        {sortedPages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-3">
              <Plus className="w-8 h-8 mx-auto mb-2" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No pages yet</h3>
            <p className="text-xs text-gray-600 mb-3">
              Create your first {getSectionTitle().toLowerCase()} page to get started.
            </p>
            <button
              onClick={onAddPage}
              className="px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-xs font-medium"
            >
              New Page
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPages.map((page) => {
              return (
                <div
                  key={page.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 hover:shadow-sm w-[212px] h-[102px] flex flex-col bg-gray-800 border-gray-700 mx-auto ${
                    selectedPage?.id === page.id
                      ? 'border-orange-600 shadow-sm'
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => onPageSelect(page)}
                >
                  {/* Card ID at top */}
                  <div className="text-xs font-mono text-gray-500 mb-1" style={{fontSize: '10px'}}>
                    {getFormattedId(page)}
                  </div>
                  
                  {/* Separator line */}
                  <div className="w-full h-px bg-gray-600 mb-2"></div>
                  
                  {/* Page title */}
                  <h3 className="text-sm font-medium text-white leading-tight flex-1 overflow-hidden">
                    <div className="line-clamp-3">
                      {page.title}
                    </div>
                  </h3>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}