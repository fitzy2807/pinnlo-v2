'use client'

import React, { useState } from 'react'
import ExecutiveSummary from './ExecutiveSummary'
import PageHeaderControls from './PageHeaderControls'
import QuickAdd from './QuickAdd'

interface WorkspaceWithControlsProps {
  strategyId: number
  blueprintId: string
  cards: any[]
  children: React.ReactNode
}

export default function WorkspaceWithControls({
  strategyId,
  blueprintId,
  cards,
  children
}: WorkspaceWithControlsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleQuickAddSubmit = async (title: string, description: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          blueprint_id: blueprintId,
          strategy_id: strategyId
        })
      })
      
      if (response.ok) {
        console.log('Card created successfully')
        // TODO: Refresh cards or emit event to parent
      }
    } catch (error) {
      console.error('Failed to create card:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCard = () => {
    console.log('Add card clicked')
    // TODO: Implement add card modal
  }

  const handleGenerateAI = () => {
    console.log('Generate AI clicked')
    // TODO: Implement AI generation
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAllChecked(checked)
    if (checked) {
      setSelectedCards(cards.map(card => card.id))
    } else {
      setSelectedCards([])
    }
  }

  const handleBulkDelete = () => {
    console.log('Bulk delete:', selectedCards)
    // TODO: Implement bulk delete
  }

  const handleBulkDuplicate = () => {
    console.log('Bulk duplicate:', selectedCards)
    // TODO: Implement bulk duplicate
  }

  const handleBulkPin = () => {
    console.log('Bulk pin:', selectedCards)
    // TODO: Implement bulk pin
  }

  return (
    <div className="space-y-6">
      {/* Page Header Controls */}
      <div className="relative">
        <PageHeaderControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cards={cards}
          selectedCards={selectedCards}
          onSelectAll={handleSelectAll}
          selectAllChecked={selectAllChecked}
          onAddCard={handleAddCard}
          onGenerateAI={handleGenerateAI}
          onQuickAdd={() => setShowQuickAdd(!showQuickAdd)}
          onBulkDelete={handleBulkDelete}
          onBulkDuplicate={handleBulkDuplicate}
          onBulkPin={handleBulkPin}
          showQuickAdd={showQuickAdd}
          loading={loading}
        />
        
        {/* Quick Add Panel */}
        <QuickAdd
          isVisible={showQuickAdd}
          onClose={() => setShowQuickAdd(false)}
          onSubmit={handleQuickAddSubmit}
          loading={loading}
          blueprintId={blueprintId}
        />
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary
        strategyId={strategyId}
        blueprintType={blueprintId}
        cards={cards}
      />

      {/* Main Content */}
      <div>
        {children}
      </div>
    </div>
  )
}