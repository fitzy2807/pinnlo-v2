'use client'

import React, { useState } from 'react'
import PageHeaderControls from './PageHeaderControls'
import QuickAdd from './QuickAdd'
import ExecutiveSummary from './ExecutiveSummary'

interface BlueprintPageProps {
  blueprintType: string
  strategyId: string
}

export default function BlueprintPage({ blueprintType, strategyId }: BlueprintPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [selectAllChecked, setSelectAllChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // TODO: Replace with actual cards from your data source
  const cards: any[] = []

  const handleQuickAddSubmit = async (title: string, description: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          blueprint_id: blueprintType,
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
    <div className="h-full flex flex-col">
      {/* Page Header with Controls */}
      <div className="mb-6">
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
            blueprintId={blueprintType}
          />
        </div>
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary
        strategyId={parseInt(strategyId)}
        blueprintId={blueprintType}
        cards={cards}
      />

      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex-1 p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {blueprintType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Cards
            </h3>
            <p className="text-gray-600 mb-8">
              This is where strategy cards for {blueprintType.replace('-', ' ')} will be displayed in a responsive grid layout.
              Click &quot;Add New Card&quot; or &quot;Generate Card&quot; to start building your strategy.
            </p>
            
            {/* Placeholder Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div
                  key={card}
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 h-40 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
                    <span className="text-gray-500 text-sm">Card Slot {card}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Strategy ID: {strategyId} • Blueprint: {blueprintType}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}