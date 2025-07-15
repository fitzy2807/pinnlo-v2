'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Search, FileText, Database, Settings, Filter, Grid3X3, List, Trash2, Copy, Pin, Upload, Link2, Zap, ArrowUpDown, Sparkles, Edit2, FolderPlus, ChevronDown, User, EyeOff, Layers, MoreHorizontal, X, Users, Folder, FolderPlus as FolderPlusIcon } from 'lucide-react'
import { useDevelopmentCards } from '@/hooks/useDevelopmentCards'
import { useDevelopmentGroups, DevelopmentGroup } from '@/hooks/useDevelopmentGroups'
import IntelligenceCardGrid from '@/components/intelligence-cards/IntelligenceCardGrid'
import { transformDevelopmentCardsToIntelligence, transformIntelligenceToDevelopmentCard } from './utils/dataTransformer'
import { toast } from 'react-hot-toast'
import AgentsSection from './AgentsSection'
import { GeneratedCard } from '@/components/shared/card-creator/types'
import { getAgentsForHub } from '@/lib/agentRegistry'

interface DevelopmentBankProps {
  strategy: any
  onBack: () => void
  onClose: () => void
}

export default function DevelopmentBank({ strategy, onBack, onClose }: DevelopmentBankProps) {
  const [selectedSection, setSelectedSection] = useState('section1')
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
  const [showAgents, setShowAgents] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const quickAddRef = useRef<HTMLDivElement>(null)
  
  // Get agents for development hub
  const developmentAgents = getAgentsForHub('development')

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

  const { cards, loading, createCard, updateCard, deleteCard, getSectionCounts, getCardsBySection } = useDevelopmentCards(strategy?.id)
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
  } = useDevelopmentGroups(strategy?.id)

  // Create sample task list for testing
  const createSampleTaskList = useCallback(async () => {
    console.log('createSampleTaskList called')
    console.log('Strategy ID:', strategy?.id)
    try {
      const sampleTaskList = {
        title: 'User Authentication Implementation',
        description: 'Complete task list for implementing user authentication system',
        card_type: 'task-list',
        priority: 'High',
        card_data: {
          // Required metadata object for task lists
          metadata: {
            task_list_id: 'TASK-AUTH-001',
            version: '1.0',
            status: 'In Progress',
            assigned_team: 'Backend Team',
            sprint: 'Sprint 12',
            priority: 'High',
            estimated_effort: '3 weeks',
            completion_percentage: '25',
            created_date: new Date().toISOString(),
            last_updated: new Date().toISOString()
          },
          
          // Required categories array
          categories: [
            {
              id: 'backend-dev',
              name: 'Backend Development',
              description: 'Backend API and database tasks',
              tasks: []
            },
            {
              id: 'frontend-dev', 
              name: 'Frontend Development',
              description: 'UI and frontend integration tasks',
              tasks: []
            },
            {
              id: 'testing',
              name: 'Testing & QA',
              description: 'Testing and quality assurance tasks',
              tasks: []
            },
            {
              id: 'deployment',
              name: 'Deployment & DevOps',
              description: 'Infrastructure and deployment tasks',
              tasks: []
            }
          ],
          task_list_id: 'TASK-AUTH-001',
          version: '1.0',
          status: 'In Progress',
          assigned_team: 'Backend Team',
          sprint: 'Sprint 12',
          priority: 'High',
          estimated_effort: '3 weeks',
          completion_percentage: '25',
          
          // Task Overview
          task_summary: 'Implement a complete user authentication system with login, registration, password reset, and session management.',
          business_value: 'Enable user accounts and secure access to the platform, supporting personalized experiences and data security.',
          acceptance_criteria: 'Users can register, login, logout, reset passwords, and maintain secure sessions. All authentication flows work correctly.',
          success_metrics: 'Authentication success rate >99%, login time <2 seconds, zero security vulnerabilities.',
          
          // Development Tasks
          backend_tasks: 'Create user model and database tables, implement JWT authentication, build login/register APIs, add password hashing, create session management.',
          frontend_tasks: 'Build login and registration forms, implement authentication state management, create protected routes, add password strength validation.',
          integration_tasks: 'Integrate with email service for verification, connect to OAuth providers (Google, GitHub), implement 2FA integration.',
          infrastructure_tasks: 'Set up Redis for session storage, configure SSL certificates, implement rate limiting, set up monitoring.',
          
          // Testing & QA
          unit_testing_tasks: 'Write tests for authentication functions, test password hashing, validate JWT token generation and verification.',
          integration_testing_tasks: 'Test complete authentication flows, verify API endpoints, test OAuth integrations.',
          user_testing_tasks: 'Conduct usability testing for login flows, test password reset experience, validate error messaging.',
          performance_testing_tasks: 'Load test login endpoints, test concurrent session handling, verify response times.',
          security_testing_tasks: 'Penetration testing for authentication, verify password policies, test session security.',
          
          // Dependencies
          technical_dependencies: 'User database schema must be finalized, email service configuration completed.',
          external_dependencies: 'OAuth app registrations with Google and GitHub, SSL certificate procurement.',
          current_blockers: 'Waiting for security review of password policies, email service vendor selection pending.',
          risk_mitigation: 'Have backup email provider ready, plan for OAuth service outages, implement graceful degradation.',
          
          // Documentation
          technical_documentation: 'API documentation for authentication endpoints, authentication flow diagrams, security implementation guide.',
          user_documentation: 'User guide for account creation and login, password reset instructions, 2FA setup guide.',
          process_documentation: 'Deployment checklist for authentication changes, rollback procedures, monitoring setup.',
          knowledge_transfer: 'Team training on authentication architecture, security best practices review.',
          
          // Timeline
          phase_breakdown: 'Phase 1: Basic auth (1 week), Phase 2: OAuth integration (1 week), Phase 3: 2FA and security hardening (1 week).',
          key_milestones: 'Week 1: Basic login working, Week 2: OAuth providers integrated, Week 3: Full security audit passed.',
          deadline_requirements: 'Must be completed before Q1 product launch, security review required 1 week before release.',
          resource_allocation: '2 backend developers, 1 frontend developer, 0.5 DevOps engineer, security consultant review.',
          
          // Metadata
          linked_features: 'User Profile Management, Dashboard Personalization',
          source_requirements: 'TRD-AUTH-001, PRD-USER-SYSTEM',
          tags: 'authentication, security, backend, frontend, high-priority',
          progress_notes: 'Basic backend structure complete, working on frontend integration. OAuth setup in progress.',
          source_trd_id: 'TRD-AUTH-001',
          generated_from: 'AI Generated from TRD-AUTH-001',
          last_sync_date: new Date().toISOString().split('T')[0]
        }
      }
      
      console.log('About to create card with data:', sampleTaskList)
      await createCard(sampleTaskList)
      console.log('Card created successfully')
      toast.success('Sample task list created!')
    } catch (error) {
      console.error('Failed to create sample task list:', error)
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      })
      toast.error('Failed to create sample task list')
    }
  }, [createCard])

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

  // Development sections with real data counts
  const sectionCounts = getSectionCounts ? getSectionCounts() : {}
  const sections = [
    { id: 'section1', label: 'PRD', count: sectionCounts.section1 || 0 },
    { id: 'section2', label: 'Tech Stack', count: sectionCounts.section2 || 0 },
    { id: 'section3', label: 'Technical Requirements', count: sectionCounts.section3 || 0 },
    { id: 'section4', label: 'Task Lists', count: sectionCounts.section4 || 0 },
    { id: 'section5', label: 'Testing & QA', count: sectionCounts.section5 || 0 },
    { id: 'section6', label: 'Deployment', count: sectionCounts.section6 || 0 },
    { id: 'section7', label: 'Documentation', count: sectionCounts.section7 || 0 },
    { id: 'section8', label: 'Code Review', count: sectionCounts.section8 || 0 },
  ]

  // Demo tools with development-specific labels
  const tools = [
    { id: 'card-creator', label: 'Card Creator', icon: Sparkles },
    { id: 'tool1', label: 'PRD Writer' },
    { id: 'tool2', label: 'Tech Stack Diagnostic' },
    { id: 'tool3', label: 'TRD Writer' },
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
          card_data: { ...card.card_data }
        })
      ))
      toast.success(`Duplicated ${selectedCards.size} cards`)
      setSelectedCards(new Set())
    } catch (error) {
      toast.error('Failed to duplicate cards')
    }
  }

  const handleCreateCard = async () => {
    // Map sections to appropriate card types
    const sectionCardTypeMap: Record<string, string> = {
      'section1': 'prd', // PRD
      'section2': 'tech-stack', // Tech Stack
      'section3': 'technical-requirement', // Technical Requirements
      'section4': 'task-list', // Task Lists
      'section5': 'test-scenario', // Testing & QA
      'section6': 'deployment-config', // Deployment
      'section7': 'documentation', // Documentation
      'section8': 'code-review' // Code Review
    }

    const cardType = sectionCardTypeMap[selectedSection] || 'feature'
    const sectionName = sections.find(s => s.id === selectedSection)?.label || 'Development'

    const newCard = await createCard({
      title: `New ${sectionName} Card`,
      description: `This is a ${sectionName.toLowerCase()} card for development`,
      card_type: cardType,
      priority: 'Medium',
      card_data: {}
    })
    toast.success('Card created')
  }

  const handleGenerateCard = async () => {
    console.log('Generate card clicked for section:', selectedSection)
    console.log('Strategy available:', !!strategy, 'Strategy ID:', strategy?.id)
    
    if (selectedSection === 'section1') {
      // Create sample PRD for testing
      try {
        await createCard({
          title: 'Sample Product Requirements Document',
          description: 'Product requirements for new feature development',
          card_type: 'prd',
          priority: 'High',
          card_data: {
            prd_id: `PRD-${Date.now()}`,
            version: '1.0',
            status: 'draft',
            product_manager: 'Product Manager',
            last_reviewed: new Date().toISOString().split('T')[0],
            
            // Sample content
            product_vision: 'Create a revolutionary product that solves user problems',
            problem_statement: 'Users currently face challenges with existing solutions',
            solution_overview: 'Our solution provides a comprehensive approach',
            target_audience: 'Primary: Enterprise users, Secondary: SMB customers',
            value_proposition: 'Unique value through innovative features',
            success_summary: 'Success measured by user adoption and satisfaction'
          }
        })
        toast.success('Sample PRD created!')
      } catch (error) {
        toast.error('Failed to create PRD')
      }
    } else if (selectedSection === 'section3') {
      // Create sample technical requirement for testing
      try {
        await createCard({
          title: 'Sample Technical Requirement',
          description: 'This is a sample technical requirement document for testing the migration.',
          card_type: 'technical-requirement-structured',
          priority: 'High',
          card_data: {
            requirementType: 'System Integration',
            businessNeed: 'Need to integrate with external payment system',
            functionalDescription: 'System must support payment processing via Stripe API',
            documentControl: {
              trdId: 'TRD-' + Date.now(),
              version: '1.0.0',
              approvalStatus: 'draft',
              lastUpdated: new Date().toISOString()
            }
          }
        })
        toast.success('Sample Technical Requirement created!')
      } catch (error) {
        toast.error('Failed to create technical requirement')
      }
    } else if (selectedSection === 'section4') {
      console.log('Creating sample task list...')
      
      // First try a simple task list to test basic creation
      console.log('Testing simple task list creation first...')
      try {
        const simpleTaskList = {
          title: 'Simple Task List Test',
          description: 'Basic task list for testing',
          card_type: 'task-list',
          priority: 'Medium',
          card_data: {
            // Required metadata object for task lists
            metadata: {
              task_list_id: 'TASK-SIMPLE-001',
              version: '1.0',
              status: 'Not Started',
              completion_percentage: '0',
              created_date: new Date().toISOString(),
              last_updated: new Date().toISOString()
            },
            
            // Required categories array
            categories: [
              {
                id: 'general',
                name: 'General Tasks',
                description: 'Basic task category for testing',
                tasks: []
              }
            ],
            status: 'Not Started',
            completion_percentage: '0'
          }
        }
        
        console.log('Creating simple task list:', simpleTaskList)
        await createCard(simpleTaskList)
        console.log('Simple task list created successfully!')
        toast.success('Simple task list created!')
        return
      } catch (simpleError) {
        console.error('Simple task list creation failed:', simpleError)
        console.error('Simple error details:', {
          message: simpleError?.message,
          details: simpleError?.details,
          hint: simpleError?.hint,
          code: simpleError?.code
        })
      }
      
      // If simple creation fails, don't try the complex one
      // Create sample task list for testing
      try {
        await createSampleTaskList()
      } catch (error) {
        console.error('Error creating task list:', error)
        toast.error('Failed to create task list')
      }
    } else {
      toast('AI generation coming soon!')
    }
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

    try {
      // Map sections to appropriate card types
      const sectionCardTypeMap: Record<string, string> = {
        'section1': 'prd', // PRD
        'section2': 'tech-stack', // Tech Stack
        'section3': 'technical-requirement', // Technical Requirements
        'section4': 'task-list', // Task Lists
        'section5': 'test-scenario', // Testing & QA
        'section6': 'deployment-config', // Deployment
        'section7': 'documentation', // Documentation
        'section8': 'code-review' // Code Review
      }

      const cardType = sectionCardTypeMap[selectedSection] || 'feature'

      await createCard({
        title: quickAddTitle.trim(),
        description: quickAddDescription.trim() || 'Quick add card',
        card_type: cardType,
        priority: 'Medium',
        card_data: { source: 'quick_add' }
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

  const handleCardsCreated = async (generatedCards: GeneratedCard[]) => {
    try {
      // Convert GeneratedCard to createCard format
      for (const generatedCard of generatedCards) {
        await createCard({
          title: generatedCard.title,
          description: generatedCard.description,
          card_type: generatedCard.card_type,
          priority: generatedCard.priority,
          card_data: generatedCard.card_data
        })
      }
      toast.success(`Added ${generatedCards.length} cards successfully!`)
      setSelectedTool(null) // Close card creator
    } catch (error) {
      console.error('Error creating cards:', error)
      toast.error('Failed to create cards')
    }
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

  // Get cards for current view
  let baseCards = cards
  if (viewType === 'section' && getCardsBySection) {
    baseCards = getCardsBySection(selectedSection)
  }

  const filteredCards = baseCards.filter(card => {
    // Filter by search query
    if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !card.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filter by priority/type
    if (filterBy !== 'all') {
      if (filterBy === 'recent') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(card.created_at) >= weekAgo
      } else if (['high', 'medium', 'low'].includes(filterBy)) {
        return card.priority.toLowerCase() === filterBy
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
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Agent Tools</h3>
          
          <div className="space-y-1">
            {/* Dynamic Agents */}
            {developmentAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleToolClick(`agent-${agent.id}`)}
                className={`
                  w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                  ${selectedTool === `agent-${agent.id}`
                    ? 'bg-black bg-opacity-50 text-white'
                    : 'text-black hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xs">{agent.name}</span>
              </button>
            ))}
            
            {/* Other Tools */}
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
        {showAgents ? (
          <AgentsSection
            strategy={strategy}
            onClose={() => setShowAgents(false)}
            onCardsCreated={handleCardsCreated}
          />
        ) : selectedTool ? (
          // Tool Content
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200">
              <div className="px-4 py-1.5">
                <h1 className="text-sm font-medium text-gray-900">
                  {tools.find(t => t.id === selectedTool)?.label}
                </h1>
                <p className="text-[10px] text-gray-500">
                  {selectedTool === 'card-creator' 
                    ? 'Generate cards using AI based on existing development context'
                    : `Tool functionality and settings for ${tools.find(t => t.id === selectedTool)?.label?.toLowerCase()}`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex-1 p-6 text-center text-gray-500">
                Tool content for {tools.find(t => t.id === selectedTool)?.label} coming soon...
              </div>
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
                      {/* For sections 1, 3 & 4, only show Add button that directly creates cards */}
                      {(selectedSection === 'section1' || selectedSection === 'section3' || selectedSection === 'section4') ? (
                        <button 
                          onClick={handleGenerateCard}
                          className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                        >
                          {selectedSection === 'section1' ? 'Add PRD' : selectedSection === 'section3' ? 'Add TRD' : 'Add Task List'}
                        </button>
                      ) : (
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

                  {/* View Toggle - only show for sections other than 3 & 4 */}
                  {selectedSection !== 'section3' && selectedSection !== 'section4' && (
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
                  )}

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

            {/* Quick Add Form - only show for sections other than 3 & 4 */}
            {showQuickAddForm && selectedSection !== 'section3' && selectedSection !== 'section4' && (
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
                    onClick={viewType === 'section' && selectedSection !== 'section3' && selectedSection !== 'section4' ? handleCreateCard : undefined}
                    className={`max-w-md p-8 border-2 border-dashed border-gray-300 rounded-lg text-center space-y-3 transition-colors ${
                      viewType === 'section' && selectedSection !== 'section3' && selectedSection !== 'section4' ? 'hover:border-gray-400 hover:bg-gray-50 cursor-pointer' : 'cursor-default'
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
                          ? (selectedSection === 'section3' 
                              ? 'Click "Add TRD" to create a technical requirements document'
                              : selectedSection === 'section4'
                              ? 'Click "Add Task List" to create a new task list'
                              : 'Create a new development card')
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
                      {viewType === 'section' && (
                        <div className="text-xs text-gray-400 mt-2">
                          Development Debug:<br/>
                          Strategy ID: {strategy?.id}<br/>
                          Section: {selectedSection}<br/>
                          Total Cards: {cards.length}<br/>
                          Filtered Cards: {displayCards.length}<br/>
                          Section Type: {sections.find(s => s.id === selectedSection)?.label}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              ) : (
                <IntelligenceCardGrid
                  cards={transformDevelopmentCardsToIntelligence(displayCards)}
                  onCreateCard={handleCreateCard}
                  onUpdateCard={async (id, updates) => {
                    // Transform Intelligence card format back to Development format
                    const devUpdates = transformIntelligenceToDevelopmentCard(updates as any)
                    await updateCard(id, devUpdates)
                  }}
                  onDeleteCard={async (id) => {
                    await deleteCard(id)
                  }}
                  searchQuery={searchQuery}
                  selectedCardIds={selectedCards}
                  onSelectCard={handleSelectCard}
                  viewMode={viewMode}
                  loading={loading || groupsLoading}
                />
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