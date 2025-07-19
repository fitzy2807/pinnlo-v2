'use client'

import { useState, useEffect } from 'react'
import LeftNavigation from './LeftNavigation'
import WorkspacePreview from '../workspace/WorkspacePreview'
import WorkspacePage from '../workspace/WorkspacePage'
import AgentTools from './AgentTools'
import { CardData } from '@/types/card'
import { StrategyProvider, useStrategy } from '@/contexts/StrategyContext'
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext'
import { useCards } from '@/hooks/useCards'
import { getCardTypeForSection } from '@/utils/blueprintConstants'

// Inner component that can use strategy context hooks
function UnifiedLayoutInner() {
  const { currentStrategy } = useStrategy()
  const { currentHub, currentSection, selectedPage, setSelectedPage } = useNavigation()
  const [filteredCards, setFilteredCards] = useState<CardData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    sortBy: 'updated'
  })

  // Load cards for current strategy
  const strategyId = currentStrategy?.id ? parseInt(currentStrategy.id) : 0
  const { cards, loading, createCard, updateCard, deleteCard } = useCards(strategyId)

  // Handle card selection
  const handleCardSelect = (card: CardData) => {
    setSelectedPage(card)
  }

  // Handle card updates
  const handleCardUpdate = async (updatedCard: Partial<CardData>) => {
    if (selectedPage) {
      const updated = await updateCard(selectedPage.id, updatedCard)
      if (updated) {
        setSelectedPage(updated)
      }
    }
  }

  // Handle card deletion
  const handleCardDelete = async () => {
    if (selectedPage) {
      const success = await deleteCard(selectedPage.id)
      if (success) {
        setSelectedPage(null)
      }
    }
  }

  // Handle card duplication
  const handleCardDuplicate = async () => {
    if (selectedPage) {
      const duplicated = await createCard({
        ...selectedPage,
        title: `${selectedPage.title} (Copy)`,
        id: undefined // Let the service generate new ID
      })
      if (duplicated) {
        setSelectedPage(duplicated)
      }
    }
  }

  // Handle closing workspace page
  const handleCloseWorkspacePage = () => {
    setSelectedPage(null)
  }

  // Handle card creation
  const handleAddCard = async () => {
    if (!currentStrategy) return
    
    const cardType = getCardTypeForSection(currentSection)
    const newCard = await createCard({
      title: `New ${currentSection} Card`,
      description: '',
      cardType: cardType,
      priority: 'Medium',
      confidenceLevel: 'Medium',
      priorityRationale: '',
      confidenceRationale: '',
      tags: [],
      relationships: [],
      strategicAlignment: ''
    })
    
    if (newCard) {
      setSelectedPage(newCard)
    }
  }

  // Handle AI generation
  const handleGenerateAI = () => {
    // TODO: Implement AI generation
    console.log('Generate AI clicked for:', currentHub, currentSection)
  }

  // Filter cards based on current section and search/filters
  useEffect(() => {
    if (!cards.length) {
      setFilteredCards([])
      setSelectedPage(null)
      return
    }

    let filtered = cards

    // Filter by section/card type if we're not on home
    if (currentHub !== 'home' && currentSection && currentSection !== 'default') {
      const cardType = getCardTypeForSection(currentSection)
      filtered = cards.filter(card => card.cardType === cardType)
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(card => card.priority === filters.priority)
    }

    // Apply status filter (using cardType as status for now)
    if (filters.status !== 'all') {
      filtered = filtered.filter(card => card.cardType === filters.status)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
        case 'updated':
        default:
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      }
    })

    setFilteredCards(filtered)

    // Auto-select first card if none selected or current selection is not in filtered results
    if (!selectedPage || !filtered.find(card => card.id === selectedPage.id)) {
      setSelectedPage(filtered[0] || null)
    }
  }, [cards, currentHub, currentSection, searchQuery, filters, selectedPage])

  return (
    <div className="min-h-screen bg-black">
      {/* 4-Column CSS Grid Layout: 16% | 17% | 51% | 16% */}
      <div className="h-screen grid grid-cols-[0.64fr_0.672fr_2.048fr_0.64fr] gap-4 p-4">
        {/* Column 1: Left Navigation (16%) */}
        <div className="overflow-y-auto">
          <LeftNavigation
            selectedHub={currentHub}
            selectedSection={currentSection}
          />
        </div>

        {/* Columns 2 & 3: Card Container */}
        <div className="col-span-2 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-full grid grid-cols-[0.672fr_2.048fr]">
            {/* Column 2: WorkspacePreview (17%) */}
            <div className="border-r border-gray-700 overflow-y-auto bg-black rounded-l-lg">
              <WorkspacePreview
                pages={filteredCards}
                loading={loading}
                selectedPage={selectedPage}
                searchQuery={searchQuery}
                filters={filters}
                onPageSelect={handleCardSelect}
                onSearchChange={setSearchQuery}
                onFiltersChange={setFilters}
                onAddPage={handleAddCard}
                onGenerateAI={handleGenerateAI}
                hubId={currentHub}
                sectionId={currentSection}
              />
            </div>

            {/* Column 3: WorkspacePage (51%) */}
            <div className="overflow-y-auto rounded-r-lg">
              <WorkspacePage
                page={selectedPage}
                onUpdate={handleCardUpdate}
                onDelete={handleCardDelete}
                onDuplicate={handleCardDuplicate}
                onClose={handleCloseWorkspacePage}
              />
            </div>
          </div>
        </div>

        {/* Column 4: Agent Tools (16%) */}
        <div className="overflow-y-auto">
          <AgentTools
            selectedHub={currentHub}
            selectedSection={currentSection}
            selectedCard={selectedPage}
            isOverlayOpen={isOverlayOpen}
            onOverlayChange={setIsOverlayOpen}
          />
        </div>
      </div>
    </div>
  )
}

// Main component wrapper
export default function UnifiedLayout() {
  return (
    <StrategyProvider>
      <NavigationProvider>
        <UnifiedLayoutInner />
      </NavigationProvider>
    </StrategyProvider>
  )
}