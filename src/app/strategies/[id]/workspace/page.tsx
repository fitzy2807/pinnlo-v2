'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import BlueprintNavigation from '@/components/workspace/BlueprintNavigation'
import PageController from '@/components/workspace/PageController'
import ContentArea, { ContentAreaRef } from '@/components/workspace/ContentArea'
import StrategyTools from '@/components/workspace/StrategyTools'
import BlueprintManager from '@/components/workspace/BlueprintManager'
import ExecutiveSummary from '@/components/workspace/ExecutiveSummary'
import QuickAdd from '@/components/workspace/QuickAdd'
import { getAllBlueprints } from '@/components/blueprints/registry'
import { useCards } from '@/hooks/useCards'

export default function WorkspacePage() {
  const params = useParams()
  const [activeBlueprint, setActiveBlueprint] = useState('strategicContext')
  const [enabledBlueprints, setEnabledBlueprints] = useState<string[]>(['strategicContext', 'valuePropositions'])
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const contentAreaRef = useRef<ContentAreaRef>(null)
  
  const allBlueprints = getAllBlueprints()
  
  // Load actual cards for this strategy
  const { cards: allCards } = useCards(parseInt(params.id as string))
  
  // Handle mapping between blueprint registry IDs and database card types
  const getCardTypeForBlueprint = (blueprintId: string): string => {
    const blueprintToCardTypeMap: Record<string, string> = {
      'valuePropositions': 'value-proposition',
      'strategicContext': 'strategic-context',
      'personas': 'persona',
      'okrs': 'okr',
      'kpis': 'kpi',
      'problem-statement': 'problem-statement',
      'features': 'feature',
      'epics': 'epic',
      'workstreams': 'workstream'
    }
    
    return blueprintToCardTypeMap[blueprintId] || blueprintId
  }
  
  // Filter cards by active blueprint type using mapped cardType
  const expectedCardType = getCardTypeForBlueprint(activeBlueprint)
  const activeCards = allCards.filter(card => card.cardType === expectedCardType)
  
  // Debug logging
  console.log('🔍 WorkspacePage Debug:')
  console.log('- Active Blueprint:', activeBlueprint)
  console.log('- Expected CardType:', expectedCardType)
  console.log('- All Cards Count:', allCards.length)
  console.log('- Active Cards Count:', activeCards.length)
  console.log('- Active Cards:', activeCards.map(c => ({ title: c.title, cardType: c.cardType })))
  console.log('- All Cards by Type:', allCards.reduce((acc, card) => {
    acc[card.cardType] = (acc[card.cardType] || 0) + 1
    return acc
  }, {} as Record<string, number>))
  console.log('- Value Proposition Cards (value-proposition):', allCards.filter(c => c.cardType === 'value-proposition').length)
  console.log('- Value Proposition Cards (valuePropositions):', allCards.filter(c => c.cardType === 'valuePropositions').length)
  console.log('- Value Proposition Cards (value-propositions):', allCards.filter(c => c.cardType === 'value-propositions').length)
  
  // Create blueprint list with card counts (TODO: get real counts from database)
  const blueprints = enabledBlueprints.map(blueprintId => {
    const blueprint = allBlueprints.find(b => b.id === blueprintId)
    return {
      id: blueprintId,
      name: blueprint?.name || blueprintId,
      icon: blueprint?.icon || '📝',
      count: 0 // TODO: Get actual card count from useCards hook
    }
  }).filter(Boolean)
  
  const currentBlueprint = blueprints.find(b => b.id === activeBlueprint)

  // Handle blueprint configuration changes from BlueprintManager
  const handleBlueprintsChange = (newBlueprints: string[]) => {
    console.log('🔄 Blueprints updated:', newBlueprints)
    setEnabledBlueprints(newBlueprints)
    
    // If current active blueprint is no longer enabled, switch to first available
    if (!newBlueprints.includes(activeBlueprint) && newBlueprints.length > 0) {
      setActiveBlueprint(newBlueprints[0])
    }
  }

  const handleAddCard = () => {
    console.log('🔄 Add Card button clicked');
    console.log('ContentArea ref:', contentAreaRef.current);
    
    if (contentAreaRef.current) {
      console.log('🎯 Calling createCard...');
      contentAreaRef.current.createCard();
    } else {
      console.error('❌ ContentArea ref is not available');
    }
  }

  const handleQuickAddSubmit = async (title: string, description: string) => {
    try {
      setLoading(true)
      // Use the ContentArea ref to create the card with title and description
      if (contentAreaRef.current) {
        await contentAreaRef.current.createCard(title, description)
        setShowQuickAdd(false)
      }
    } catch (error) {
      console.error('Failed to create card:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAI = () => {
    console.log('🤖 Generate AI button clicked');
    // TODO: Implement AI card generation
    // This could open a modal or trigger the card creator
    if (contentAreaRef.current) {
      console.log('🎯 Calling generateCards...');
      // contentAreaRef.current.generateCards();
    }
  }


  return (
    <div className="flex flex-col h-full">
      {/* Blueprint Manager Bar */}
      <BlueprintManager 
        strategyId={params.id as string} 
        onBlueprintsChange={handleBlueprintsChange}
      />
      
      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Blueprint Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <BlueprintNavigation 
            blueprints={blueprints}
            activeBlueprint={activeBlueprint}
            onSelectBlueprint={setActiveBlueprint}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Controller with Quick Add */}
          <div className="relative">
            <PageController 
              blueprint={currentBlueprint} 
              onAddCard={handleAddCard} 
              onQuickAdd={() => setShowQuickAdd(!showQuickAdd)}
              onGenerateAI={handleGenerateAI}
            />
            
            {/* Quick Add Panel - slides out from under PageController */}
            <QuickAdd
              isVisible={showQuickAdd}
              onClose={() => setShowQuickAdd(false)}
              onSubmit={handleQuickAddSubmit}
              loading={loading}
              blueprintId={activeBlueprint}
            />
          </div>
          
          {/* Content Area with Executive Summary */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Executive Summary */}
              <ExecutiveSummary
                strategyId={parseInt(params.id as string)}
                blueprintType={activeBlueprint}
                cards={activeCards}
              />
              
              {/* Original Content Area */}
              <ContentArea ref={contentAreaRef} blueprint={currentBlueprint} strategyId={params.id as string} />
            </div>
          </div>
        </div>

        {/* Right Panel - Strategy Tools */}
        <div className="w-80 bg-white border-l border-gray-200">
          <StrategyTools />
        </div>
      </div>
    </div>
  )
}
