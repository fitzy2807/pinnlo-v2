'use client'

import React, { useState } from 'react'
import { X, Building2, ArrowRight, Check, FileCode, Sparkles, TestTube, ListTodo } from 'lucide-react'
import { useSession } from '@supabase/auth-helpers-react'
import { useStrategies } from '@/hooks/useStrategies'
import DevelopmentBank from './DevelopmentBank'
import SpecificationDisplay from './SpecificationDisplay'
import { createClient } from '@supabase/supabase-js'
import type { DevBankAsset } from '@/services/developmentBankService'

interface DevelopmentBankModalProps {
  isOpen: boolean
  onClose: () => void
  strategyId?: string
}

export default function DevelopmentBankModal({ 
  isOpen, 
  onClose, 
  strategyId 
}: DevelopmentBankModalProps) {
  const session = useSession()
  const { strategies, loading: strategiesLoading } = useStrategies()
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategyId || '')
  const [generatingSpec, setGeneratingSpec] = useState(false)
  const [currentSpecAsset, setCurrentSpecAsset] = useState<DevBankAsset | null>(null)
  const [generatingTests, setGeneratingTests] = useState(false)
  const [currentTestAsset, setCurrentTestAsset] = useState<DevBankAsset | null>(null)
  const [generatingTasks, setGeneratingTasks] = useState(false)
  const [currentTaskAsset, setCurrentTaskAsset] = useState<DevBankAsset | null>(null)
  const [selectedStack, setSelectedStack] = useState<any>(null)
  const [cards, setCards] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>('tech-stack')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const generateSpecification = async () => {
    if (!selectedStack || cards.length === 0) return
    
    setGeneratingSpec(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      
      // Get feature cards
      const featureCards = cards.filter(c => c.card_type === 'feature')
      if (featureCards.length === 0) {
        throw new Error('No feature cards found')
      }
      
      const response = await fetch('/api/development-bank/generate-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          featureIds: featureCards.map(c => c.id),
          techStackId: selectedStack.id,
          options: {
            format: 'ai-ready',
            includeExamples: true,
            includeDiagrams: true
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate specification')
      }
      
      const result = await response.json()
      if (result.success && result.asset) {
        setCurrentSpecAsset(result.asset)
      }
    } catch (error) {
      console.error('Error generating specification:', error)
    } finally {
      setGeneratingSpec(false)
    }
  }

  const generateTestScenarios = async () => {
    if (!selectedStack || cards.length === 0) return
    
    setGeneratingTests(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      
      const featureCards = cards.filter(c => c.card_type === 'feature')
      if (featureCards.length === 0) {
        throw new Error('No feature cards found')
      }
      
      const response = await fetch('/api/development-bank/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          featureIds: featureCards.map(c => c.id),
          techStackId: selectedStack.id,
          options: {
            format: 'ai-ready',
            includeEdgeCases: true,
            includeTestData: true
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate test scenarios')
      }
      
      const result = await response.json()
      if (result.success && result.asset) {
        setCurrentTestAsset(result.asset)
      }
    } catch (error) {
      console.error('Error generating test scenarios:', error)
    } finally {
      setGeneratingTests(false)
    }
  }

  const generateTaskList = async () => {
    if (!selectedStack || cards.length === 0) return
    
    setGeneratingTasks(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      
      const featureCards = cards.filter(c => c.card_type === 'feature')
      if (featureCards.length === 0) {
        throw new Error('No feature cards found')
      }
      
      const response = await fetch('/api/development-bank/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          strategyId: selectedStrategyId,
          featureIds: featureCards.map(c => c.id),
          techStackId: selectedStack.id
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate task list')
      }
      
      const result = await response.json()
      if (result.success && result.asset) {
        setCurrentTaskAsset(result.asset)
      }
    } catch (error) {
      console.error('Error generating task list:', error)
    } finally {
      setGeneratingTasks(false)
    }
  }

  if (!isOpen) return null

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please sign in to access the Development Bank.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Strategy selection UI when no strategy is selected
  if (!selectedStrategyId && strategies && strategies.length > 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <span>Development Bank</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Select a strategy to begin working with your development assets
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-3">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategyId(strategy.id.toString())}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                      {strategy.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {strategy.description || 'No description provided'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (strategiesLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading strategies...</p>
          </div>
        </div>
      </div>
    )
  }

  // No strategies found
  if (!strategies || strategies.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Strategies Found</h2>
            <p className="text-gray-600 mb-4">
              Create a strategy first to access the Development Bank.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main Development Bank interface
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <span>Development Bank</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Bridge your strategy to development execution
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Tab Navigation for Demo */}
          <div className="border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('tech-stack')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tech-stack'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tech Stack
              </button>
              <button
                onClick={() => setActiveTab('spec')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'spec'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'test'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Test Scenarios
              </button>
              <button
                onClick={() => setActiveTab('task')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'task'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Task Lists
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'tech-stack' && (
              <DevelopmentBank 
                strategyId={selectedStrategyId} 
                onClose={onClose}
              />
            )}

            {activeTab === 'spec' && selectedStack && (
              <div>
                {!currentSpecAsset && !generatingSpec && (
                  <div className="text-center py-12">
                    <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      Generate technical specifications from your {cards.filter(c => c.card_type === 'feature').length} feature cards
                    </p>
                    <button 
                      onClick={generateSpecification}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Specification</span>
                    </button>
                  </div>
                )}
                
                <SpecificationDisplay
                  asset={currentSpecAsset}
                  loading={generatingSpec}
                  onRegenerate={generateSpecification}
                />
              </div>
            )}

            {activeTab === 'spec' && !selectedStack && (
              <div className="text-center py-12">
                <FileCode className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  Select a tech stack first to generate specifications
                </p>
              </div>
            )}

            {activeTab === 'test' && selectedStack && (
              <div>
                {!currentTestAsset && !generatingTests && (
                  <div className="text-center py-12">
                    <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      Create comprehensive test scenarios from acceptance criteria
                    </p>
                    <button 
                      onClick={generateTestScenarios}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Test Scenarios</span>
                    </button>
                  </div>
                )}
                
                <SpecificationDisplay
                  asset={currentTestAsset}
                  loading={generatingTests}
                  onRegenerate={generateTestScenarios}
                />
              </div>
            )}

            {activeTab === 'test' && !selectedStack && (
              <div className="text-center py-12">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  Select a tech stack first to generate test scenarios
                </p>
              </div>
            )}

            {activeTab === 'task' && selectedStack && (
              <div>
                {!currentTaskAsset && !generatingTasks && (
                  <div className="text-center py-12">
                    <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      Break down features into actionable development tasks
                    </p>
                    <button 
                      onClick={generateTaskList}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Task List</span>
                    </button>
                  </div>
                )}
                
                <SpecificationDisplay
                  asset={currentTaskAsset}
                  loading={generatingTasks}
                  onRegenerate={generateTaskList}
                />
              </div>
            )}

            {activeTab === 'task' && !selectedStack && (
              <div className="text-center py-12">
                <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  Select a tech stack first to generate task lists
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}