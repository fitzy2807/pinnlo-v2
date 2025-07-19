'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Home, 
  Target, 
  Brain, 
  Code, 
  Users, 
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Settings,
  User,
  LogOut,
  Bell,
  HelpCircle,
  X,
  Plus
} from 'lucide-react'
import { BLUEPRINT_REGISTRY, getBlueprintsByHub, getStrategyHubBlueprintsInOrder, getDefaultStrategyHubSelections, getDefaultIntelligenceHubSelections, getDefaultDevelopmentHubSelections, getDefaultOrganisationHubSelections } from '@/components/blueprints/registry'
import StrategySelector from '@/components/strategy/StrategySelector'
import CreateStrategyModal from '@/components/strategy/CreateStrategyModal'
import { useStrategy } from '@/contexts/StrategyContext'
import { useNavigation } from '@/contexts/NavigationContext'
import { useCards } from '@/hooks/useCards'
import { getCardTypeForSection, getSectionFromCardType } from '@/utils/blueprintConstants'

interface LeftNavigationProps {
  selectedHub: string
  selectedSection: string
}

const HUBS = [
  {
    id: 'home',
    name: 'Home',
    icon: Home,
    color: 'gray',
    sections: []
  },
  {
    id: 'strategy',
    name: 'Strategy Hub',
    icon: Target,
    color: 'purple',
    sections: []
  },
  {
    id: 'intelligence',
    name: 'Intelligence Hub',
    icon: Brain,
    color: 'blue',
    sections: []
  },
  {
    id: 'development',
    name: 'Development Hub',
    icon: Code,
    color: 'orange',
    sections: []
  },
  {
    id: 'organisation',
    name: 'Organisation Hub',
    icon: Users,
    color: 'green',
    sections: []
  }
]

export default function LeftNavigation({ 
  selectedHub, 
  selectedSection
}: LeftNavigationProps) {
  const { navigateTo } = useNavigation()
  const { currentStrategy, hasStrategies, strategies } = useStrategy()
  
  // Load cards for current strategy to get counts
  const strategyId = currentStrategy?.id ? parseInt(currentStrategy.id) : 0
  const { cards } = useCards(strategyId)
  
  const [showCreateStrategyModal, setShowCreateStrategyModal] = useState(false)
  const [expandedHub, setExpandedHub] = useState(selectedHub)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedSettingsTab, setSelectedSettingsTab] = useState('strategy')
  const [settingsStrategyId, setSettingsStrategyId] = useState<string>('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  // Strategy-specific blueprint selections: strategyId -> hubType -> blueprintIds
  const [strategyBlueprintSelections, setStrategyBlueprintSelections] = useState<Record<string, Record<string, string[]>>>({})
  
  // Initialize settings strategy when strategy context changes
  useEffect(() => {
    if (currentStrategy && !settingsStrategyId) {
      setSettingsStrategyId(currentStrategy.id)
    }
  }, [currentStrategy, settingsStrategyId])

  // Load strategy-specific blueprint selections from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const savedSelections = localStorage.getItem('strategyBlueprintSelections')
      if (savedSelections) {
        const parsed = JSON.parse(savedSelections)
        console.log('🔄 Loaded strategy blueprint selections from localStorage:', parsed)
        setStrategyBlueprintSelections(parsed)
      } else {
        console.log('📝 No saved strategy blueprint selections found in localStorage')
      }
    } catch (error) {
      console.error('Error loading strategy blueprint selections:', error)
      // Clear corrupted data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('strategyBlueprintSelections')
      }
    }
  }, [])

  // Save strategy blueprint selections to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (Object.keys(strategyBlueprintSelections).length > 0) {
      localStorage.setItem('strategyBlueprintSelections', JSON.stringify(strategyBlueprintSelections))
    }
  }, [strategyBlueprintSelections])

  // Get blueprint selections for a specific strategy and hub
  const getBlueprintSelections = (strategyId: string, hubType: string): string[] => {
    if (!strategyId) {
      console.log(`🔍 getBlueprintSelections: No strategyId provided`)
      return []
    }
    
    const strategySelections = strategyBlueprintSelections[strategyId]
    if (!strategySelections) {
      console.log(`🔍 getBlueprintSelections: No selections found for strategy ${strategyId}`)
      return []
    }
    
    const hubSelections = strategySelections[hubType]
    if (hubSelections === undefined) {
      console.log(`🔍 getBlueprintSelections: Hub ${hubType} not initialized for strategy ${strategyId}`)
      return []
    }
    
    console.log(`✅ getBlueprintSelections: Strategy ${strategyId}, Hub ${hubType}:`, hubSelections)
    return hubSelections
  }

  // Initialize strategy with defaults only when explicitly needed (e.g., first time settings opened)
  const initializeStrategyDefaults = (strategyId: string) => {
    if (!strategyBlueprintSelections[strategyId]) {
      setStrategyBlueprintSelections(prev => ({
        ...prev,
        [strategyId]: {
          strategy: getDefaultStrategyHubSelections(),
          intelligence: getDefaultIntelligenceHubSelections(),
          development: getDefaultDevelopmentHubSelections(),
          organisation: getDefaultOrganisationHubSelections()
        }
      }))
    }
  }

  // Handle blueprint selection toggle for specific strategy
  const handleBlueprintToggle = (blueprintId: string, isEnabled: boolean, hubType: string, targetStrategyId?: string) => {
    const strategyId = targetStrategyId || settingsStrategyId
    if (!strategyId) return
    
    if (blueprintId === 'strategicContext') {
      // strategicContext is mandatory and cannot be disabled
      return
    }
    
    setSaveStatus('saving')
    
    setStrategyBlueprintSelections(prev => {
      const newSelections = { ...prev }
      
      // Initialize strategy if it doesn't exist using defaults
      if (!newSelections[strategyId]) {
        newSelections[strategyId] = {
          strategy: getDefaultStrategyHubSelections(),
          intelligence: getDefaultIntelligenceHubSelections(),
          development: getDefaultDevelopmentHubSelections(),
          organisation: getDefaultOrganisationHubSelections()
        }
      }
      
      // Initialize hub if it doesn't exist with defaults
      if (newSelections[strategyId][hubType] === undefined) {
        switch (hubType) {
          case 'strategy': newSelections[strategyId][hubType] = getDefaultStrategyHubSelections(); break
          case 'intelligence': newSelections[strategyId][hubType] = getDefaultIntelligenceHubSelections(); break
          case 'development': newSelections[strategyId][hubType] = getDefaultDevelopmentHubSelections(); break
          case 'organisation': newSelections[strategyId][hubType] = getDefaultOrganisationHubSelections(); break
          default: newSelections[strategyId][hubType] = []; break
        }
      }
      
      // Update blueprint selection
      const currentSelections = newSelections[strategyId][hubType]
      if (isEnabled) {
        // Add blueprint if not already present
        if (!currentSelections.includes(blueprintId)) {
          newSelections[strategyId][hubType] = [...currentSelections, blueprintId]
        }
      } else {
        // Remove blueprint
        newSelections[strategyId][hubType] = currentSelections.filter(id => id !== blueprintId)
      }
      
      console.log(`🔧 Blueprint ${blueprintId} ${isEnabled ? 'enabled' : 'disabled'} for strategy ${strategyId} in ${hubType} hub`)
      console.log('📊 Updated selections:', newSelections[strategyId][hubType])
      
      return newSelections
    })
    
    // Show saved feedback
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 300)
  }

  // Get dynamic sections for any hub based on strategy-specific blueprint selections
  const getHubSections = (hubType: string) => {
    if (!currentStrategy) {
      return []
    }
    
    let selectedBlueprints = getBlueprintSelections(currentStrategy.id, hubType)
    
    // For strategy hub, always ensure mandatory blueprints are included
    if (hubType === 'strategy') {
      // Add mandatory blueprints if they're not already included
      const mandatoryBlueprints = ['strategicContext']
      mandatoryBlueprints.forEach(mandatoryId => {
        if (!selectedBlueprints.includes(mandatoryId)) {
          selectedBlueprints = [mandatoryId, ...selectedBlueprints]
        }
      })
    }
    
    return selectedBlueprints
      .map(blueprintId => {
        const blueprint = BLUEPRINT_REGISTRY[blueprintId]
        if (!blueprint) {
          console.log('Blueprint not found:', blueprintId)
          return null
        }
        return {
          id: blueprintId,
          name: blueprint.name
        }
      })
      .filter(Boolean)
  }

  // Update HUBS to use dynamic sections - reactive to blueprint selections and strategy changes
  const getDynamicHubs = () => {
    return HUBS.map(hub => {
      if (['strategy', 'intelligence', 'development', 'organisation'].includes(hub.id)) {
        return {
          ...hub,
          sections: getHubSections(hub.id)
        }
      }
      return hub
    })
  }

  // Make dynamicHubs reactive to strategy and blueprint selection changes
  // Function to get card count for a specific section
  const getCardCountForSection = useMemo(() => {
    return (sectionId: string): number => {
      if (!currentStrategy || !cards.length) return 0
      
      // Convert section ID to card type for database queries
      const cardType = getCardTypeForSection(sectionId)
      return cards.filter(card => card.cardType === cardType).length
    }
  }, [currentStrategy, cards])

  const dynamicHubs = React.useMemo(() => {
    return getDynamicHubs()
  }, [currentStrategy, strategyBlueprintSelections])

  const handleHubClick = (hubId: string) => {
    if (hubId === 'home') {
      navigateTo('home')
      setExpandedHub('')
      return
    }

    if (expandedHub === hubId) {
      setExpandedHub('')
    } else {
      setExpandedHub(hubId)
      const hub = HUBS.find(h => h.id === hubId)
      if (hub && hub.sections.length === 0) {
        navigateTo(hubId)
      }
    }
  }

  const handleSectionClick = (hubId: string, sectionId: string) => {
    navigateTo(hubId, sectionId)
  }

  const getHubColor = (color: string, isSelected: boolean) => {
    const colors = {
      gray: 'text-gray-300',
      purple: 'text-gray-300',
      blue: 'text-gray-300',
      orange: 'text-gray-300',
      green: 'text-gray-300'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">PINNLO<span className="text-orange-600 font-bold">.</span></h1>
          </div>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-300" />
          </button>
        </div>
        
        {/* User Menu Overlay */}
        {showUserMenu && (
          <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">john.doe@company.com</p>
            </div>
            <div className="py-1">
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button 
                onClick={() => {
                  setShowSettingsModal(true)
                  setShowUserMenu(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span>Help & Support</span>
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Strategy Section */}
      <div className="border-b border-gray-700">
        
        <StrategySelector />
        
        {/* Create Strategy Button */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setShowCreateStrategyModal(true)}
            className="w-full flex items-center justify-center space-x-2 p-2 border border-orange-600 rounded-md text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Strategy</span>
          </button>
        </div>
      </div>

      {/* Create Strategy Modal */}
      <CreateStrategyModal
        isOpen={showCreateStrategyModal}
        onClose={() => setShowCreateStrategyModal(false)}
        onSuccess={() => {
          // Strategy will be automatically selected due to context
        }}
      />
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-1/2 h-1/2 flex overflow-hidden">
            {/* Settings Left Navigation */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Settings</h2>
              </div>
              <div className="p-3 space-y-1">
                <button
                  onClick={() => setSelectedSettingsTab('strategy')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedSettingsTab === 'strategy'
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Strategy Hub</span>
                </button>
                <button
                  onClick={() => setSelectedSettingsTab('intelligence')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedSettingsTab === 'intelligence'
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>Intelligence Hub</span>
                </button>
                <button
                  onClick={() => setSelectedSettingsTab('development')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedSettingsTab === 'development'
                      ? 'bg-orange-100 text-orange-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>Development Hub</span>
                </button>
                <button
                  onClick={() => setSelectedSettingsTab('organisation')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedSettingsTab === 'organisation'
                      ? 'bg-green-100 text-green-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Organisation Hub</span>
                </button>
                <button
                  onClick={() => setSelectedSettingsTab('ai')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedSettingsTab === 'ai'
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>AI Settings</span>
                </button>
                <button
                  onClick={() => setSelectedSettingsTab('agent')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedSettingsTab === 'agent'
                      ? 'bg-pink-100 text-pink-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Agent Settings</span>
                </button>
              </div>
            </div>
            
            {/* Settings Content */}
            <div className="flex-1 flex flex-col">
              {/* Content Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 capitalize">
                  {selectedSettingsTab === 'ai' ? 'AI Settings' : 
                   selectedSettingsTab === 'agent' ? 'Agent Settings' :
                   `${selectedSettingsTab} Hub Settings`}
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              {/* Content Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                {selectedSettingsTab === 'strategy' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900">Blueprint Manager</h4>
                      <div className="flex items-center space-x-2">
                        {saveStatus === 'saved' && (
                          <span className="text-xs text-green-600">✓ Saved</span>
                        )}
                        {saveStatus === 'saving' && (
                          <span className="text-xs text-gray-500">Saving...</span>
                        )}
                        <button 
                          className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                          disabled={saveStatus === 'saving'}
                        >
                          {saveStatus === 'saving' ? 'Saving...' : 'Save Blueprint'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Strategy Selection Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Configure for Strategy</label>
                      <select
                        value={settingsStrategyId}
                        onChange={(e) => setSettingsStrategyId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="">Select a strategy...</option>
                        {strategies.map((strategy) => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.title}
                          </option>
                        ))}
                      </select>
                      {!settingsStrategyId && (
                        <p className="text-xs text-yellow-600">Select a strategy to configure blueprints</p>
                      )}
                    </div>
                    
                    {settingsStrategyId ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Select Active Blueprints</label>
                          <p className="text-xs text-gray-500 mb-3">Choose which blueprints appear in the Strategy Hub navigation</p>
                          
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {getStrategyHubBlueprintsInOrder().map((blueprint) => {
                              const isEnabled = getBlueprintSelections(settingsStrategyId, 'strategy').includes(blueprint.id)
                              const isMandatory = blueprint.id === 'strategicContext'
                              
                              return (
                                <div key={blueprint.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <input
                                    type="checkbox"
                                    id={`blueprint-${blueprint.id}`}
                                    checked={isEnabled || isMandatory}
                                    disabled={isMandatory}
                                    onChange={(e) => {
                                      handleBlueprintToggle(blueprint.id, e.target.checked, 'strategy')
                                    }}
                                    className="mt-0.5 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <label htmlFor={`blueprint-${blueprint.id}`} className="text-xs font-medium text-gray-900 cursor-pointer">
                                        {blueprint.name}
                                      </label>
                                      {isMandatory && (
                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{blueprint.description}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-xs">Please select a strategy to configure blueprint settings.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedSettingsTab === 'intelligence' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900">Intelligence Hub Blueprint Manager</h4>
                      <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                        Save Blueprint
                      </button>
                    </div>
                    
                    {/* Strategy Selection Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Configure for Strategy</label>
                      <select
                        value={settingsStrategyId}
                        onChange={(e) => setSettingsStrategyId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select a strategy...</option>
                        {strategies.map((strategy) => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.title}
                          </option>
                        ))}
                      </select>
                      {!settingsStrategyId && (
                        <p className="text-xs text-yellow-600">Select a strategy to configure blueprints</p>
                      )}
                    </div>
                    
                    {settingsStrategyId ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Select Active Blueprints</label>
                          <p className="text-xs text-gray-500 mb-3">Choose which blueprints appear in the Intelligence Hub navigation</p>
                          
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {getBlueprintsByHub('intelligence').map((blueprint) => {
                              const isEnabled = getBlueprintSelections(settingsStrategyId, 'intelligence').includes(blueprint.id)
                              
                              return (
                                <div key={blueprint.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <input
                                    type="checkbox"
                                    id={`intelligence-${blueprint.id}`}
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      handleBlueprintToggle(blueprint.id, e.target.checked, 'intelligence')
                                    }}
                                    className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <label htmlFor={`intelligence-${blueprint.id}`} className="text-xs font-medium text-gray-900 cursor-pointer">
                                        {blueprint.name}
                                      </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{blueprint.description}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-xs">Please select a strategy to configure blueprint settings.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedSettingsTab === 'ai' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-medium text-gray-900">AI Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">AI Model</label>
                        <select className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
                          <option>GPT-4</option>
                          <option>Claude-3</option>
                          <option>Gemini</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Temperature</label>
                        <input type="range" min="0" max="1" step="0.1" className="w-full" />
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedSettingsTab === 'agent' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-medium text-gray-900">Agent Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Agent response time</label>
                        <select className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500">
                          <option>Instant</option>
                          <option>5 seconds</option>
                          <option>10 seconds</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Development and Organisation tabs */}
                {selectedSettingsTab === 'development' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900">Development Hub Blueprint Manager</h4>
                      <button className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors">
                        Save Blueprint
                      </button>
                    </div>
                    
                    {/* Strategy Selection Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Configure for Strategy</label>
                      <select
                        value={settingsStrategyId}
                        onChange={(e) => setSettingsStrategyId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="">Select a strategy...</option>
                        {strategies.map((strategy) => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.title}
                          </option>
                        ))}
                      </select>
                      {!settingsStrategyId && (
                        <p className="text-xs text-yellow-600">Select a strategy to configure blueprints</p>
                      )}
                    </div>
                    
                    {settingsStrategyId ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Select Active Blueprints</label>
                          <p className="text-xs text-gray-500 mb-3">Choose which blueprints appear in the Development Hub navigation</p>
                          
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {getBlueprintsByHub('development').map((blueprint) => {
                              const isEnabled = getBlueprintSelections(settingsStrategyId, 'development').includes(blueprint.id)
                              
                              return (
                                <div key={blueprint.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <input
                                    type="checkbox"
                                    id={`development-${blueprint.id}`}
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      handleBlueprintToggle(blueprint.id, e.target.checked, 'development')
                                    }}
                                    className="mt-0.5 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <label htmlFor={`development-${blueprint.id}`} className="text-xs font-medium text-gray-900 cursor-pointer">
                                        {blueprint.name}
                                      </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{blueprint.description}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-xs">Please select a strategy to configure blueprint settings.</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedSettingsTab === 'organisation' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900">Organisation Hub Blueprint Manager</h4>
                      <button className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                        Save Blueprint
                      </button>
                    </div>
                    
                    {/* Strategy Selection Dropdown */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">Configure for Strategy</label>
                      <select
                        value={settingsStrategyId}
                        onChange={(e) => setSettingsStrategyId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="">Select a strategy...</option>
                        {strategies.map((strategy) => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.title}
                          </option>
                        ))}
                      </select>
                      {!settingsStrategyId && (
                        <p className="text-xs text-yellow-600">Select a strategy to configure blueprints</p>
                      )}
                    </div>
                    
                    {settingsStrategyId ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Select Active Blueprints</label>
                          <p className="text-xs text-gray-500 mb-3">Choose which blueprints appear in the Organisation Hub navigation</p>
                          
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {getBlueprintsByHub('organisation').map((blueprint) => {
                              const isEnabled = getBlueprintSelections(settingsStrategyId, 'organisation').includes(blueprint.id)
                              
                              return (
                                <div key={blueprint.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                  <input
                                    type="checkbox"
                                    id={`organisation-${blueprint.id}`}
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      handleBlueprintToggle(blueprint.id, e.target.checked, 'organisation')
                                    }}
                                    className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <label htmlFor={`organisation-${blueprint.id}`} className="text-xs font-medium text-gray-900 cursor-pointer">
                                        {blueprint.name}
                                      </label>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{blueprint.description}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p className="text-xs">Please select a strategy to configure blueprint settings.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hub Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {/* Always show Home hub */}
          {dynamicHubs.filter(hub => hub.id === 'home').map((hub) => {
            const Icon = hub.icon
            const isSelected = selectedHub === hub.id
            
            return (
              <div key={hub.id} className="space-y-1">
                <button
                  onClick={() => handleHubClick(hub.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    getHubColor(hub.color, isSelected)
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{hub.name}</span>
                  </div>
                </button>
              </div>
            )
          })}
          
          {/* Strategy-dependent hubs - only show if strategy is selected or no strategies exist */}
          {(currentStrategy || !hasStrategies) && dynamicHubs.filter(hub => hub.id !== 'home').map((hub) => {
            const Icon = hub.icon
            const isSelected = selectedHub === hub.id
            const isExpanded = expandedHub === hub.id && hub.sections.length > 0
            const hasSubSections = hub.sections.length > 0

            return (
              <div key={hub.id} className="space-y-1">
                {/* Hub Button */}
                <button
                  onClick={() => handleHubClick(hub.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    getHubColor(hub.color, isSelected)
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium">{hub.name}</span>
                  </div>
                  {hasSubSections && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {hub.sections.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </div>
                  )}
                </button>

                {/* Sections */}
                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    <div className="border-l-2 border-gray-700 pl-4 space-y-1">
                      {hub.sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(hub.id, section.id)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                            selectedSection === section.id
                              ? 'bg-orange-600 text-white'
                              : 'text-gray-300 hover:bg-gray-800'
                          }`}
                        >
                          <span className="text-xs">{section.name}</span>
                          <span className="text-xs text-gray-400">
                            {getCardCountForSection(section.id)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          
          {/* Show empty state message for strategy-dependent hubs when no strategy selected */}
          {hasStrategies && !currentStrategy && (
            <div className="mt-6 p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
              <div className="text-center">
                <Target className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <h3 className="text-xs font-medium text-white mb-1">Select a Strategy</h3>
                <p className="text-xs text-gray-300 mb-3">
                  Choose a strategy above to access workspace hubs.
                </p>
                <button
                  onClick={() => setShowCreateStrategyModal(true)}
                  className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
                >
                  Create Strategy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <p>v2.0.0 • Unified Interface</p>
        </div>
      </div>
    </div>
  )
}