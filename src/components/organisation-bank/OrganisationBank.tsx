'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, FileText, Database, Settings, Filter, Grid3X3, List, Trash2, Copy, Pin, Upload, Link2, Zap, ArrowUpDown, Sparkles, Edit2, FolderPlus, ChevronDown, User, EyeOff, Layers, MoreHorizontal, X, Users, Folder, FolderPlus as FolderPlusIcon } from 'lucide-react'
import MasterCard from '../cards/MasterCard'
import { useOrganisationCards } from '@/hooks/organisation/useOrganisationCards'
import { useOrganisationGroups, OrganisationGroup } from '@/hooks/organisation/useOrganisationGroups'
import { toast } from 'react-hot-toast'

interface OrganisationBankProps {
  onClose?: () => void
}

export default function OrganisationBank({ onClose }: OrganisationBankProps) {
  const [selectedSection, setSelectedSection] = useState('companies')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'section' | 'group'>('section')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [showQuickAddForm, setShowQuickAddForm] = useState(false)
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false)
  const [showGroupSelectionModal, setShowGroupSelectionModal] = useState(false)
  const [quickAddTitle, setQuickAddTitle] = useState('')
  const [quickAddDescription, setQuickAddDescription] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupColor, setNewGroupColor] = useState('blue')
  const [groupCards, setGroupCards] = useState<any[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const quickAddRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Check if click is outside dropdown controls area
      const outsideDropdowns = dropdownRef.current && !dropdownRef.current.contains(target)
      
      // Check if click is outside Quick Add form
      const outsideQuickAdd = quickAddRef.current && !quickAddRef.current.contains(target)
      
      if (outsideDropdowns) {
        setShowSortDropdown(false)
        setShowFilterDropdown(false)
      }
      
      // Only close Quick Add if click is outside both the controls AND the form
      if (outsideDropdowns && outsideQuickAdd) {
        setShowQuickAddForm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { cards, loading, createCard, updateCard, deleteCard } = useOrganisationCards()
  const { 
    groups, 
    loading: groupsLoading, 
    createGroup, 
    updateGroup, 
    deleteGroup, 
    getGroupCards,
    addCardToGroup,
    removeCardFromGroup,
    addCardsToGroup
  } = useOrganisationGroups()

  // Load group cards when a group is selected
  useEffect(() => {
    if (selectedGroup && viewType === 'group') {
      loadGroupCards()
    }
  }, [selectedGroup, viewType])

  const loadGroupCards = async () => {
    if (!selectedGroup) return
    try {
      console.log('Loading cards for group:', selectedGroup)
      const cards = await getGroupCards(selectedGroup)
      console.log('Raw group cards data:', cards)
      console.log('Number of cards loaded:', cards?.length || 0)
      setGroupCards(cards || [])
    } catch (error) {
      console.error('Error loading group cards:', error)
      setGroupCards([])
    }
  }

  // Sort options
  const sortOptions = [
    { value: 'created', label: 'Created Date' },
    { value: 'updated', label: 'Updated Date' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'priority', label: 'Priority' },
  ]

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Cards' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'recent', label: 'Recent (7 days)' },
  ]

  // Color options for groups
  const colorOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
  ]

  // Organisation-specific sections with their corresponding card types
  const sections = [
    { id: 'companies', label: 'Companies', count: 0, cardType: 'company' },
    { id: 'departments', label: 'Departments', count: 0, cardType: 'department' },
    { id: 'teams', label: 'Teams', count: 0, cardType: 'team' },
    { id: 'people', label: 'People', count: 0, cardType: 'person' },
    { id: 'divisions', label: 'Divisions', count: 0, cardType: 'department' },
    { id: 'business_units', label: 'Business Units', count: 0, cardType: 'department' },
    { id: 'partners', label: 'Partners', count: 0, cardType: 'company' },
    { id: 'archived', label: 'Archived', count: 0, cardType: 'organisation' },
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
    const currentCards = viewType === 'group' ? groupCards : filteredCards
    if (selectedCards.size === currentCards.length) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(currentCards.map(card => card.id)))
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
      if (viewType === 'group') await loadGroupCards()
      toast.success(`Deleted ${selectedCards.size} cards`)
    } catch (error) {
      toast.error('Failed to delete cards')
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedCards.size === 0) return

    try {
      const currentCards = viewType === 'group' ? groupCards : cards
      const selectedCardData = currentCards.filter(card => selectedCards.has(card.id))
      await Promise.all(selectedCardData.map(card => 
        createCard({
          title: `${card.title} (Copy)`,
          description: card.description,
          card_type: card.card_type,
          priority: card.priority,
          card_data: { ...card.card_data, section: selectedSection }
        })
      ))
      toast.success(`Duplicated ${selectedCards.size} cards`)
      setSelectedCards(new Set())
    } catch (error) {
      toast.error('Failed to duplicate cards')
    }
  }

  const handleCreateCard = async () => {
    const currentSection = sections.find(s => s.id === selectedSection)
    const cardType = currentSection?.cardType || 'organisation'
    const title = `New ${currentSection?.label.slice(0, -1) || 'Organisation'}`
    
    const newCard = await createCard({
      title,
      description: `New ${currentSection?.label.toLowerCase().slice(0, -1) || 'organisation'}`,
      card_type: cardType,
      priority: 'medium',
      card_data: { 
        section: selectedSection,
        status: 'active'
      }
    })
    toast.success(`${currentSection?.label.slice(0, -1) || 'Organisation'} card created`)
  }

  const handleGenerateCard = () => {
    toast('AI generation coming soon!')
  }

  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue)
    setShowSortDropdown(false)
    toast.success(`Sorted by ${sortOptions.find(opt => opt.value === sortValue)?.label}`)
  }

  const handleFilterChange = (filterValue: string) => {
    setFilterBy(filterValue)
    setShowFilterDropdown(false)
    toast.success(`Filtered by ${filterOptions.find(opt => opt.value === filterValue)?.label}`)
  }

  const handleQuickAddToggle = () => {
    setShowQuickAddForm(!showQuickAddForm)
    setShowSortDropdown(false)
    setShowFilterDropdown(false)
    if (!showQuickAddForm) {
      setQuickAddTitle('')
      setQuickAddDescription('')
    }
  }

  const handleQuickAddSubmit = async () => {
    if (!quickAddTitle.trim()) {
      toast.error('Please enter a card title')
      return
    }

    const currentSection = sections.find(s => s.id === selectedSection)
    const cardType = currentSection?.cardType || 'organisation'

    try {
      await createCard({
        title: quickAddTitle.trim(),
        description: quickAddDescription.trim() || `New ${currentSection?.label.toLowerCase().slice(0, -1) || 'organisation'}`,
        card_type: cardType,
        priority: 'medium',
        card_data: { 
          source: 'quick_add', 
          section: selectedSection,
          status: 'active'
        }
      })
      
      setQuickAddTitle('')
      setQuickAddDescription('')
      setShowQuickAddForm(false)
      toast.success('Card created successfully!')
    } catch (error) {
      toast.error('Failed to create card')
    }
  }

  const handleQuickAddCancel = () => {
    setQuickAddTitle('')
    setQuickAddDescription('')
    setShowQuickAddForm(false)
  }

  const handleQuickAddKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleQuickAddSubmit()
    } else if (e.key === 'Escape') {
      handleQuickAddCancel()
    }
  }

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId === selectedTool ? null : toolId)
    toast(`${toolId === selectedTool ? 'Deselected' : 'Selected'} ${tools.find(t => t.id === toolId)?.label}`)
  }

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId)
    setSelectedTool(null)
    setViewType('section')
    setSelectedGroup(null)
    setSelectedCards(new Set())
  }

  const handleGroupClick = (groupId: string) => {
    setSelectedGroup(groupId)
    setSelectedTool(null)
    setViewType('group')
    setSelectedCards(new Set())
  }

  const handleBulkEdit = () => {
    if (selectedCards.size === 0) return
    toast('Bulk edit coming soon!')
  }

  const handleBulkGroup = () => {
    if (selectedCards.size === 0) return
    setShowGroupSelectionModal(true)
  }

  const handleCreateGroupSubmit = async () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    try {
      await createGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        color: newGroupColor
      })
      
      setNewGroupName('')
      setNewGroupDescription('')
      setNewGroupColor('blue')
      setShowCreateGroupForm(false)
      toast.success('Group created successfully!')
    } catch (error) {
      toast.error('Failed to create group')
    }
  }

  const handleAddToGroup = async (groupId: string) => {
    if (selectedCards.size === 0) return

    try {
      console.log('Adding cards to group:', groupId)
      console.log('Selected card IDs:', Array.from(selectedCards))
      await addCardsToGroup(groupId, Array.from(selectedCards))
      setSelectedCards(new Set())
      setShowGroupSelectionModal(false)
      // Refresh group cards if we're currently viewing this group
      if (selectedGroup === groupId && viewType === 'group') {
        console.log('Refreshing group view after adding cards')
        await loadGroupCards()
      }
      console.log('Cards added successfully')
    } catch (error) {
      console.error('Error in handleAddToGroup:', error)
      toast.error('Failed to add cards to group')
    }
  }

  const handleRemoveFromGroup = async (cardId: string) => {
    if (!selectedGroup) return

    try {
      await removeCardFromGroup(selectedGroup, cardId)
      await loadGroupCards()
    } catch (error) {
      toast.error('Failed to remove card from group')
    }
  }

  const filteredCards = cards.filter(card => {
    // Filter by search query
    if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !card.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filter by section (only for section view)
    if (viewType === 'section') {
      const cardSection = card.card_data?.section || 'companies'
      if (cardSection !== selectedSection) {
        return false
      }
    }
    
    // Filter by priority/type
    if (filterBy !== 'all') {
      if (filterBy === 'recent') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(card.created_at) >= weekAgo
      } else if (['high', 'medium', 'low'].includes(filterBy)) {
        return card.priority === filterBy
      }
    }
    
    return true
  }).sort((a, b) => {
    // Apply sorting
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'created':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const displayCards = viewType === 'group' ? groupCards : filteredCards
  const currentSection = sections.find(s => s.id === selectedSection)
  const currentGroup = groups.find(g => g.id === selectedGroup)

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Tools, Sections & Groups */}
      <div className="w-64 bg-white border-r border-gray-200">
        {/* Tools Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Tools</h3>
          
          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                  ${selectedTool === tool.id
                    ? 'bg-black bg-opacity-50 text-white'
                    : 'text-black hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Sections</h3>
          
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                  ${selectedSection === section.id && viewType === 'section' && !selectedTool
                    ? 'bg-black bg-opacity-50 text-white'
                    : 'text-black hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xs">{section.label}</span>
                <span className={`text-xs ${
                  selectedSection === section.id && viewType === 'section' && !selectedTool
                    ? 'text-white'
                    : 'text-black'
                }`}>{section.count}</span>
              </button>
            ))}
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
              <FolderPlusIcon className="w-3 h-3" />
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
                  className="px-2 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateGroupForm(false)
                    setNewGroupName('')
                    setNewGroupDescription('')
                    setNewGroupColor('blue')
                  }}
                  className="px-2 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
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
                  ${selectedGroup === group.id && viewType === 'group' && !selectedTool
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
                  selectedGroup === group.id && viewType === 'group' && !selectedTool
                    ? 'text-white'
                    : 'text-black'
                }`}>{group.card_count || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedTool ? (
          // Tool Content
          <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 pt-2.5 pb-1.5">
              <h1 className="text-lg font-medium text-gray-900">
                {tools.find(t => t.id === selectedTool)?.label}
              </h1>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Tool functionality and settings for {tools.find(t => t.id === selectedTool)?.label?.toLowerCase()}
              </p>
            </div>
            <div className="px-4 pb-2">
              <div className="flex items-center justify-end">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 text-black hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
            <div className="flex-1 p-6 text-center text-gray-500">
              Tool content for {tools.find(t => t.id === selectedTool)?.label} coming soon...
            </div>
          </div>
        ) : (
          // Section/Group Content
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
              {/* Title Section */}
              <div className="px-4 pt-2.5 pb-1.5">
                <h1 className="text-lg font-medium text-gray-900">
                  {viewType === 'section' 
                    ? `${currentSection?.label}` 
                    : `${currentGroup?.name}`
                  }
                </h1>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {viewType === 'section' 
                    ? 'Define the template foundation and context for your testing'
                    : currentGroup?.description || 'Group collection of template cards'
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
                            onClick={() => handleSortChange(option.value)}
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

                  {/* Add Controls (only show in section view) */}
                  {viewType === 'section' && (
                    <>
                      <button 
                        onClick={handleCreateCard}
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
                      checked={selectedCards.size === displayCards.length && displayCards.length > 0}
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
                  {selectedCards.size > 0 && (
                    <span className="text-[11px] text-gray-500 ml-1">
                      {selectedCards.size} selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Add Form */}
            {showQuickAddForm && (
              <div
                ref={quickAddRef}
                className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
                  showQuickAddForm ? 'max-h-32' : 'max-h-0'
                }`}
              >
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">Quick Add Card to {currentSection?.label}</span>
                    </div>
                    <button
                      onClick={handleQuickAddCancel}
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
                      onKeyPress={handleQuickAddKeyPress}
                      className="flex-1 px-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={quickAddDescription}
                      onChange={(e) => setQuickAddDescription(e.target.value)}
                      onKeyPress={handleQuickAddKeyPress}
                      className="flex-1 px-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black"
                    />
                    <button
                      onClick={handleQuickAddCancel}
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
              {loading || groupsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-sm text-gray-500">Loading...</div>
                </div>
              ) : displayCards.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <button
                    onClick={viewType === 'section' ? handleCreateCard : undefined}
                    className={`max-w-md p-8 border-2 border-dashed border-gray-300 rounded-lg text-center space-y-3 transition-colors ${
                      viewType === 'section' ? 'hover:border-gray-400 hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viewType === 'section' ? 'Add New Card' : 'No Cards in Group'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {viewType === 'section' 
                          ? `Create a new ${sections.find(s => s.id === selectedSection)?.label.toLowerCase().slice(0, -1) || 'organisation'} card`
                          : 'Add cards to this group from sections'
                        }
                      </div>
                      {viewType === 'group' && (
                        <div className="text-xs text-gray-400 mt-2">
                          Debug Info:<br/>
                          Group ID: {selectedGroup}<br/>
                          Cards in state: {groupCards.length}<br/>
                          View Type: {viewType}<br/>
                          Display Cards: {displayCards.length}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              ) : (
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {displayCards.map((card) => (
                    <div key={card.id} className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedCards.has(card.id)}
                          onChange={() => handleSelectCard(card.id)}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black bg-white shadow-sm"
                        />
                      </div>
                      {viewType === 'group' && (
                        <div className="absolute top-8 right-2 z-10 flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <button
                            onClick={() => handleRemoveFromGroup(card.id)}
                            className="text-[10px] text-red-500 hover:text-red-600 transition-colors whitespace-nowrap"
                            title="Remove from group"
                          >
                            remove from group
                          </button>
                        </div>
                      )}
                      <MasterCard
                        cardData={{
                          id: card.id,
                          title: card.title,
                          description: card.description || '',
                          cardType: card.card_type,
                          priority: card.priority.charAt(0).toUpperCase() + card.priority.slice(1) as 'High' | 'Medium' | 'Low',
                          confidenceLevel: card.card_data?.confidenceLevel || 'Medium',
                          priorityRationale: card.card_data?.priorityRationale || '',
                          confidenceRationale: card.card_data?.confidenceRationale || '',
                          tags: card.card_data?.tags || [],
                          relationships: card.card_data?.relationships || [],
                          strategicAlignment: card.card_data?.strategicAlignment || '',
                          createdDate: card.created_at,
                          lastModified: card.updated_at,
                          creator: 'User',
                          owner: 'User',
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
                            card_data: { ...card.card_data, section: selectedSection }
                          })
                        }}
                        onAIEnhance={() => toast('AI Enhancement coming soon!')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Group Selection Modal */}
      {showGroupSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add to Group</h3>
            <div className="space-y-2 mb-4">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleAddToGroup(group.id)}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${colorOptions.find(c => c.value === group.color)?.color || 'bg-gray-400'}`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-gray-500">{group.description}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{group.card_count || 0} cards</div>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGroupSelectionModal(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}