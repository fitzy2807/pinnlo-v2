'use client'

import React, { useState } from 'react'
import { Plus, Search, FileText, Database, Settings, Filter, Grid3X3, List, Trash2, Copy, Pin, Upload, Link2, Zap, ArrowUpDown, Sparkles, Edit2, FolderPlus, ChevronDown, User, EyeOff, Layers, MoreHorizontal, X } from 'lucide-react'
import MasterCard from '../cards/MasterCard'
import { useTemplateCards } from '@/hooks/useTemplateCards'
import { toast } from 'react-hot-toast'

interface TemplateBankProps {
  onClose?: () => void
}

export default function TemplateBank({ onClose }: TemplateBankProps) {
  const [selectedSection, setSelectedSection] = useState('section1')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())

  const { cards, loading, createCard, updateCard, deleteCard } = useTemplateCards()

  // Demo sections with generic template labels
  const sections = [
    { id: 'section1', label: 'Section 1', count: 3 },
    { id: 'section2', label: 'Section 2', count: 0 },
    { id: 'section3', label: 'Section 3', count: 5 },
    { id: 'section4', label: 'Section 4', count: 0 },
    { id: 'section5', label: 'Section 5', count: 2 },
    { id: 'section6', label: 'Section 6', count: 0 },
    { id: 'section7', label: 'Section 7', count: 1 },
    { id: 'section8', label: 'Section 8', count: 0 },
  ]

  // Demo tools with generic template labels
  const tools = [
    { id: 'tool1', label: 'Tool 1' },
    { id: 'tool2', label: 'Tool 2' },
    { id: 'tool3', label: 'Tool 3' },
    { id: 'tool4', label: 'Tool 4' },
    { id: 'tool5', label: 'Tool 5' },
  ]

  const handleSelectAll = () => {
    if (selectedCards.size === cards.length) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(cards.map(card => card.id)))
    }
  }

  const handleSelectCard = (cardId: string) => {
    const newSelected = new Set(selectedCards)
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId)
    } else {
      newSelected.add(cardId)
    }
    setSelectedCards(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return
    
    const confirmed = window.confirm(`Delete ${selectedCards.size} selected cards?`)
    if (!confirmed) return

    try {
      await Promise.all(Array.from(selectedCards).map(id => deleteCard(id)))
      setSelectedCards(new Set())
      toast.success(`Deleted ${selectedCards.size} cards`)
    } catch (error) {
      toast.error('Failed to delete cards')
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedCards.size === 0) return

    try {
      const selectedCardData = cards.filter(card => selectedCards.has(card.id))
      await Promise.all(selectedCardData.map(card => 
        createCard({
          title: `${card.title} (Copy)`,
          description: card.description,
          card_type: card.card_type,
          priority: card.priority,
          card_data: card.card_data
        })
      ))
      toast.success(`Duplicated ${selectedCards.size} cards`)
      setSelectedCards(new Set())
    } catch (error) {
      toast.error('Failed to duplicate cards')
    }
  }

  const handleCreateCard = async () => {
    const newCard = await createCard({
      title: 'New Template Card',
      description: 'This is a template card for demonstration',
      card_type: 'template',
      priority: 'medium',
      card_data: {}
    })
    toast.success('Card created')
  }

  const handleGenerateCard = () => {
    toast.info('AI generation coming soon!')
  }

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId === selectedTool ? null : toolId)
    toast.info(`${toolId === selectedTool ? 'Deselected' : 'Selected'} ${tools.find(t => t.id === toolId)?.label}`)
  }

  const handleBulkEdit = () => {
    if (selectedCards.size === 0) return
    toast.info('Bulk edit coming soon!')
  }

  const handleBulkGroup = () => {
    if (selectedCards.size === 0) return
    toast.info('Group functionality coming soon!')
  }

  const filteredCards = cards.filter(card => {
    // Filter by search query
    if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !card.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filter by section (in a real app, cards would have a section property)
    // For demo purposes, we'll just show all cards for all sections
    // In production, you'd filter like: if (selectedSection !== 'all' && card.section !== selectedSection) return false
    
    return true
  })

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Tools & Sections */}
      <div className="w-64 bg-white border-r border-gray-200">
        {/* Tools Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Tools</h3>
          
          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                    ${selectedTool === tool.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-xs">+</span>
                    <span className="text-xs">{tool.label}</span>
                  </div>
                </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">Template bank for unified architecture testing</p>
          
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Template Sections
          </h4>
          
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`
                w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                ${selectedSection === section.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
                }
                `}
                >
                <div className="flex items-center gap-1.5">
                <span className="text-gray-400 text-xs">+</span>
                <span className="text-xs">{section.label}</span>
                </div>
                <span className={`text-xs ${selectedSection === section.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {section.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tool Panel (if tool selected) - Full Page */}
        {selectedTool && (
          <div className="flex-1 flex flex-col bg-white">
            {/* Tool Header - Minimal */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-medium text-gray-900">
                    {tools.find(t => t.id === selectedTool)?.label}
                  </h1>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Tool functionality and settings for {tools.find(t => t.id === selectedTool)?.label?.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="p-1 text-black hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Tool Content */}
            <div className="flex-1 p-6">
              <p className="text-sm text-gray-600">
                Tool functionality would go here. This page can contain forms, 
                settings, or other interactive elements specific to each tool.
              </p>
            </div>
          </div>
        )}

        {/* Main Content - Only show when no tool is selected */}
        {!selectedTool && (
          <>
            {/* Page Header - Text Links Style */}
            <div className="bg-white border-b border-gray-200">
              {/* Title Section */}
              <div className="px-4 pt-2.5 pb-1.5">
                <h1 className="text-lg font-medium text-gray-900">
                  {sections.find(s => s.id === selectedSection)?.label || 'Template Section'}
                </h1>
                <p className="text-[11px] text-gray-500 mt-0.5">Define the template foundation and context for your testing</p>
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
                      className="pl-7 pr-2.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>

                  {/* Sort */}
                  <button className="flex items-center gap-1 text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors">
                    <ArrowUpDown className="w-3 h-3" />
                    Sort
                  </button>

                  {/* Filter */}
                  <button className="flex items-center gap-1 text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors">
                    <Filter className="w-3 h-3" />
                    Filter
                  </button>

                  {/* Add */}
                  <button 
                    onClick={handleCreateCard}
                    className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    Add
                  </button>

                  {/* Quick Add */}
                  <button className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors">
                    Quick Add
                  </button>

                  {/* AI Generate */}
                  <button 
                    onClick={handleGenerateCard}
                    className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                  >
                    AI Generate
                  </button>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Select All */}
                  <label className="flex items-center gap-1 text-gray-700 cursor-pointer hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCards.size === cards.length && cards.length > 0}
                      onChange={handleSelectAll}
                      className="w-3 h-3 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span>Select All</span>
                  </label>

                  {/* Icon Actions */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={handleBulkEdit}
                      className={`p-1 rounded transition-colors ${
                        selectedCards.size > 0 
                          ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={selectedCards.size === 0}
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className={`p-1 rounded transition-colors ${
                        selectedCards.size > 0 
                          ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={selectedCards.size === 0}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleBulkDuplicate}
                      className={`p-1 rounded transition-colors ${
                        selectedCards.size > 0 
                          ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={selectedCards.size === 0}
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleBulkGroup}
                      className={`p-1 rounded transition-colors ${
                        selectedCards.size > 0 
                          ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={selectedCards.size === 0}
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

                  {/* Close Button - Only show if onClose is provided */}
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
                  {selectedCards.size > 0 && (
                    <span className="text-[11px] text-gray-500 ml-1">
                      {selectedCards.size} selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cards Section */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">CARDS</h2>
              
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading cards...</div>
                </div>
              ) : filteredCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>No cards found</p>
                  <button
                    onClick={handleCreateCard}
                    className="mt-4 px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Create First Card
                  </button>
                </div>
              ) : (
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                    : 'space-y-2'
                  }
                `}>
                  {filteredCards.map((card) => (
                    <div key={card.id} className="relative">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedCards.has(card.id)}
                        onChange={() => handleSelectCard(card.id)}
                        className="absolute top-2 left-2 z-10 rounded border-gray-300"
                      />
                      <MasterCard
                        cardData={{
                          id: card.id,
                          title: card.title,
                          description: card.description,
                          cardType: card.card_type,
                          priority: card.priority,
                          ...card.card_data
                        }}
                        onUpdate={(updates) => updateCard(card.id, updates)}
                        onDelete={() => deleteCard(card.id)}
                        onDuplicate={() => {
                          createCard({
                            title: `${card.title} (Copy)`,
                            description: card.description,
                            card_type: card.card_type,
                            priority: card.priority,
                            card_data: card.card_data
                          })
                        }}
                        onAIEnhance={() => toast.info('AI Enhancement coming soon!')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
