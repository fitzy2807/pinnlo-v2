'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bot, Search, Database, Settings, Filter, Grid3X3, List, Trash2, Copy, Pin, Upload, Link2, Zap, ArrowUpDown, Sparkles, Edit2, FolderPlus, ChevronDown, User, EyeOff, Layers, MoreHorizontal, X, Users, Folder, FolderPlus as FolderPlusIcon, Brain, FileText, Type, Wrench, GitBranch, Package, Archive } from 'lucide-react'
import { useAgentCards } from '@/hooks/useAgentCards'
import { useAgentGroups, AgentGroup } from '@/hooks/useAgentGroups'
import AgentConfigurationPanel from './AgentConfigurationPanel'
import { toast } from 'react-hot-toast'

interface AgentHubProps {
  onClose?: () => void
}

export default function AgentHub({ onClose }: AgentHubProps) {
  const [selectedSection, setSelectedSection] = useState('content-creation')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [viewType, setViewType] = useState<'section' | 'group'>('section')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
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
  const [configuringAgent, setConfiguringAgent] = useState<any | null>(null)

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

  const { cards, loading, createCard, updateCard, deleteCard } = useAgentCards()
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
  } = useAgentGroups()

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
    { value: 'name', label: 'Name A-Z' },
    { value: 'type', label: 'Agent Type' },
  ]

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Agents' },
    { value: 'active', label: 'Active Agents' },
    { value: 'beta', label: 'Beta Agents' },
    { value: 'deprecated', label: 'Deprecated' },
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

  // Agent categories (replacing sections)
  const sections = [
    { id: 'content-creation', label: 'Content Creation', icon: FileText, count: 1 },
    { id: 'data-analysis', label: 'Data Analysis', icon: Database, count: 1 },
    { id: 'research-discovery', label: 'Research & Discovery', icon: Search, count: 1 },
    { id: 'automation', label: 'Automation', icon: Zap, count: 1 },
    { id: 'integration', label: 'Integration', icon: GitBranch, count: 0 },
    { id: 'utilities', label: 'Utilities', icon: Wrench, count: 0 },
    { id: 'custom-agents', label: 'Custom Agents', icon: Package, count: 0 },
    { id: 'archived', label: 'Archived', icon: Archive, count: 0 },
  ]

  // Agent management tools
  const tools = [
    { id: 'agent-builder', label: 'Agent Builder' },
    { id: 'agent-testing', label: 'Agent Testing' },
    { id: 'performance-metrics', label: 'Performance Metrics' },
    { id: 'version-control', label: 'Version Control' },
    { id: 'permissions', label: 'Permissions' },
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
    
    const confirmed = window.confirm(`Delete ${selectedCards.size} selected agents?`)
    if (!confirmed) return

    try {
      await Promise.all(Array.from(selectedCards).map(id => deleteCard(id)))
      setSelectedCards(new Set())
      if (viewType === 'group') await loadGroupCards()
      toast.success(`Deleted ${selectedCards.size} agents`)
    } catch (error) {
      toast.error('Failed to delete agents')
    }
  }

  const handleBulkDuplicate = async () => {
    if (selectedCards.size === 0) return

    try {
      const currentCards = viewType === 'group' ? groupCards : cards
      const selectedCardData = currentCards.filter(card => selectedCards.has(card.id))
      await Promise.all(selectedCardData.map(card => 
        createCard({
          name: `${card.name} (Copy)`,
          description: card.description,
          type: card.type,
          capabilities: card.capabilities,
          availableInHubs: card.availableInHubs,
          configuration: card.configuration,
          icon: card.icon,
          component: card.component,
          status: card.status,
          version: card.version,
          author: card.author,
          section: selectedSection
        })
      ))
      toast.success(`Duplicated ${selectedCards.size} agents`)
      setSelectedCards(new Set())
    } catch (error) {
      toast.error('Failed to duplicate agents')
    }
  }

  const handleCreateCard = async () => {
    const newCard = await createCard({
      name: 'New Agent',
      description: 'Configure this agent for your needs',
      type: 'creator',
      capabilities: [],
      availableInHubs: [],
      configuration: {},
      icon: 'Bot',
      component: 'PlaceholderAgent',
      status: 'beta',
      version: '1.0.0',
      author: 'User',
      section: selectedSection
    })
    toast.success('Agent created')
  }

  const handleGenerateCard = () => {
    toast('AI agent generation coming soon!')
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
      toast.error('Please enter an agent name')
      return
    }

    try {
      await createCard({
        name: quickAddTitle.trim(),
        description: quickAddDescription.trim() || 'Quick add agent',
        type: 'creator',
        capabilities: [],
        availableInHubs: [],
        configuration: {},
        icon: 'Bot',
        component: 'PlaceholderAgent',
        status: 'beta',
        version: '1.0.0',
        author: 'User',
        section: selectedSection
      })
      
      setQuickAddTitle('')
      setQuickAddDescription('')
      setShowQuickAddForm(false)
      toast.success('Agent created successfully!')
    } catch (error) {
      toast.error('Failed to create agent')
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
      console.log('Adding agents to group:', groupId)
      console.log('Selected agent IDs:', Array.from(selectedCards))
      await addCardsToGroup(groupId, Array.from(selectedCards))
      setSelectedCards(new Set())
      setShowGroupSelectionModal(false)
      // Refresh group cards if we're currently viewing this group
      if (selectedGroup === groupId && viewType === 'group') {
        console.log('Refreshing group view after adding agents')
        await loadGroupCards()
      }
      console.log('Agents added successfully')
    } catch (error) {
      console.error('Error in handleAddToGroup:', error)
      toast.error('Failed to add agents to group')
    }
  }

  const handleRemoveFromGroup = async (cardId: string) => {
    if (!selectedGroup) return

    try {
      await removeCardFromGroup(selectedGroup, cardId)
      await loadGroupCards()
    } catch (error) {
      toast.error('Failed to remove agent from group')
    }
  }

  const filteredCards = cards.filter(card => {
    // Filter by search query
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !card.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filter by section (only for section view)
    if (viewType === 'section') {
      const cardSection = card.section || 'content-creation'
      if (cardSection !== selectedSection) {
        return false
      }
    }
    
    // Filter by status
    if (filterBy !== 'all') {
      if (filterBy === 'recent') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(card.lastUpdated) >= weekAgo
      } else if (['active', 'beta', 'deprecated'].includes(filterBy)) {
        return card.status === filterBy
      }
    }
    
    return true
  }).sort((a, b) => {
    // Apply sorting
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'type':
        return a.type.localeCompare(b.type)
      case 'updated':
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      case 'created':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Agent Management</h3>
          
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

        {/* Agent Categories */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Agent Categories</h3>
          
          <div className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
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
                  <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3" />
                    <span className="text-xs">{section.label}</span>
                  </div>
                  <span className={`text-xs ${
                    selectedSection === section.id && viewType === 'section' && !selectedTool
                      ? 'text-white'
                      : 'text-black'
                  }`}>{section.count}</span>
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
                Manage and configure {tools.find(t => t.id === selectedTool)?.label?.toLowerCase()}
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
              {tools.find(t => t.id === selectedTool)?.label} functionality coming soon...
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
                    ? `${currentSection?.label} Agents` 
                    : `${currentGroup?.name}`
                  }
                </h1>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {viewType === 'section' 
                    ? 'Browse and configure AI agents for your hubs'
                    : currentGroup?.description || 'Group collection of agents'
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
                      placeholder="Search agents"
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
                        Add Agent
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
                      <span className="text-xs font-medium text-gray-700">Quick Add Agent to {currentSection?.label}</span>
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
                      placeholder="Agent name"
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
                      Create Agent
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
                  <div className="text-sm text-gray-500">Loading agents...</div>
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
                      <Bot className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {viewType === 'section' ? 'Add New Agent' : 'No Agents in Group'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {viewType === 'section' 
                          ? 'Create a new AI agent for your hubs'
                          : 'Add agents to this group from categories'
                        }
                      </div>
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
                      {/* Agent Card Display */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Bot className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{card.name}</h3>
                              <p className="text-xs text-gray-500">{card.type}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            card.status === 'active' ? 'bg-green-100 text-green-800' :
                            card.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {card.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{card.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Available in:</span>
                            <div className="flex gap-1">
                              {card.availableInHubs.map((hub) => (
                                <span key={hub} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">
                                  {hub}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>v{card.version}</span>
                            <span>{card.author}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => setConfiguringAgent(card)}
                              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <Settings className="w-3 h-3" />
                              Configure Agent
                            </button>
                          </div>
                        </div>
                      </div>
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
                  <div className="text-sm text-gray-500">{group.card_count || 0} agents</div>
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

      {/* Agent Configuration Panel */}
      {configuringAgent && (
        <AgentConfigurationPanel
          agent={configuringAgent}
          onClose={() => setConfiguringAgent(null)}
          onUpdate={updateCard}
        />
      )}
    </div>
  )
}