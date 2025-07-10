'use client'

import React, { useState } from 'react'
import { Search, Filter, ArrowUpDown, Plus, Zap, Trash2, Copy, Pin } from 'lucide-react'

interface PageHeaderControlsProps {
  // Search & Filter
  searchQuery: string
  onSearchChange: (query: string) => void
  
  // Cards & Selection
  cards: any[]
  selectedCards: string[]
  onSelectAll: (checked: boolean) => void
  selectAllChecked: boolean
  
  // Actions
  onAddCard: () => void
  onGenerateAI: () => void
  onQuickAdd: () => void
  onBulkDelete: () => void
  onBulkDuplicate: () => void
  onBulkPin: () => void
  
  // States
  showQuickAdd: boolean
  loading?: boolean
}

export default function PageHeaderControls({
  searchQuery,
  onSearchChange,
  cards,
  selectedCards,
  onSelectAll,
  selectAllChecked,
  onAddCard,
  onGenerateAI,
  onQuickAdd,
  onBulkDelete,
  onBulkDuplicate,
  onBulkPin,
  showQuickAdd,
  loading = false
}: PageHeaderControlsProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked)
  }

  const hasSelectedCards = selectedCards.length > 0

  return (
    <div className="space-y-4">
      {/* Main Controls Row */}
      <div className="flex items-center justify-between">
        {/* Left Side - Search & Filters */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Sort</span>
          </button>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Add Card Button */}
          <button
            onClick={onAddCard}
            disabled={loading}
            className="flex items-center space-x-2 bg-black text-white px-3 py-1.5 text-xs rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3 h-3" />
            <span>Add Card</span>
          </button>

          {/* Generate with AI Button */}
          <button
            onClick={onGenerateAI}
            disabled={loading}
            className="flex items-center space-x-2 bg-black text-white px-3 py-1.5 text-xs rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>Generate with AI</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={onQuickAdd}
            disabled={loading}
            className="flex items-center space-x-2 bg-black text-white px-3 py-1.5 text-xs rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>

      {/* Selection & Actions Row */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        {/* Left Side - Select All */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600">
            Select All ({selectedCards.length} of {cards.length})
          </span>
        </div>

        {/* Right Side - Bulk Actions */}
        {hasSelectedCards && (
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              {selectedCards.length} selected
            </div>
            
            <div className="h-4 w-px bg-gray-300"></div>
            
            <button
              onClick={onBulkDelete}
              className="p-1.5 hover:bg-red-50 rounded transition-colors"
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
            </button>
            
            <button
              onClick={onBulkDuplicate}
              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
              title="Duplicate Selected"
            >
              <Copy className="w-4 h-4 text-blue-500 hover:text-blue-700" />
            </button>
            
            <button
              onClick={onBulkPin}
              className="p-1.5 hover:bg-amber-50 rounded transition-colors"
              title="Pin Selected"
            >
              <Pin className="w-4 h-4 text-amber-500 hover:text-amber-700" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}