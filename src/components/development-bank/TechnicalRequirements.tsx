'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Plus, FileText, X, Check, Edit3, Trash2, Copy } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { TRDCardData, createTRDTemplate } from '@/types/trd-structured'
import { createTaskListFromTRD, TASK_CATEGORIES } from '@/types/task-list'

interface TechnicalRequirementsProps {
  strategyId: string
  onClose: () => void
}

interface FeatureCard {
  id: string
  title: string
  description: string
  card_data: any
}

interface TechnicalRequirement {
  id: string
  title: string
  description: string
  card_type: string
  card_data: TRDCardData
  strategy_id: number
  created_at: string
  updated_at: string
  created_by: string
  version: string
  status: 'draft' | 'review' | 'approved' | 'deprecated'
  isExpanded?: boolean
}

export default function TechnicalRequirements({ strategyId, onClose }: TechnicalRequirementsProps) {
  const { user } = useAuth()
  const [featuresExpanded, setFeaturesExpanded] = useState(false)
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [technicalRequirements, setTechnicalRequirements] = useState<TechnicalRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (user && strategyId) {
      loadFeatureCards()
      loadTechnicalRequirements()
    }
  }, [user, strategyId])

  const createSampleFeatures = async () => {
    try {
      const sampleFeatures = [
        {
          title: 'User Authentication',
          description: 'Login, registration, password reset, and user profile management',
          card_type: 'feature',
          strategy_id: Number(strategyId),
          card_data: {
            userStories: ['As a user, I want to create an account', 'As a user, I want to login securely'],
            acceptanceCriteria: ['Email validation', 'Password requirements', 'Session management']
          }
        },
        {
          title: 'Dashboard',
          description: 'Main dashboard with key metrics and navigation',
          card_type: 'feature',
          strategy_id: Number(strategyId),
          card_data: {
            userStories: ['As a user, I want to see my key metrics at a glance'],
            acceptanceCriteria: ['Real-time data display', 'Responsive design', 'Quick actions']
          }
        },
        {
          title: 'Data Export',
          description: 'Export data in multiple formats (CSV, PDF, Excel)',
          card_type: 'feature',
          strategy_id: Number(strategyId),
          card_data: {
            userStories: ['As a user, I want to export my data'],
            acceptanceCriteria: ['Multiple formats', 'Bulk export', 'Scheduled exports']
          }
        }
      ]

      const { data, error } = await supabase
        .from('cards')
        .insert(sampleFeatures)
        .select()

      if (error) throw error
      
      setFeatureCards(data || [])
      setFeaturesExpanded(true)
    } catch (error) {
      console.error('Error creating sample features:', error)
    }
  }

  const loadFeatureCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('strategy_id', strategyId)
        .eq('card_type', 'feature')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeatureCards(data || [])
    } catch (error) {
      console.error('Error loading feature cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTechnicalRequirements = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('strategy_id', strategyId)
        .eq('card_type', 'technical-requirement-structured')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const requirements: TechnicalRequirement[] = (data || []).map(item => {
        // Ensure card_data has proper structure with array defaults
        const cardData = item.card_data as TRDCardData
        
        // Fix any array fields that might not be arrays
        if (cardData?.documentControl?.stakeholderRaci) {
          cardData.documentControl.stakeholderRaci.responsible = Array.isArray(cardData.documentControl.stakeholderRaci.responsible) ? cardData.documentControl.stakeholderRaci.responsible : []
          cardData.documentControl.stakeholderRaci.accountable = Array.isArray(cardData.documentControl.stakeholderRaci.accountable) ? cardData.documentControl.stakeholderRaci.accountable : []
          cardData.documentControl.stakeholderRaci.consulted = Array.isArray(cardData.documentControl.stakeholderRaci.consulted) ? cardData.documentControl.stakeholderRaci.consulted : []
          cardData.documentControl.stakeholderRaci.informed = Array.isArray(cardData.documentControl.stakeholderRaci.informed) ? cardData.documentControl.stakeholderRaci.informed : []
        }
        
        if (cardData?.documentControl?.traceabilityMatrix) {
          cardData.documentControl.traceabilityMatrix.businessRequirementIds = Array.isArray(cardData.documentControl.traceabilityMatrix.businessRequirementIds) ? cardData.documentControl.traceabilityMatrix.businessRequirementIds : []
          cardData.documentControl.traceabilityMatrix.userStoryIds = Array.isArray(cardData.documentControl.traceabilityMatrix.userStoryIds) ? cardData.documentControl.traceabilityMatrix.userStoryIds : []
          cardData.documentControl.traceabilityMatrix.testScenarioIds = Array.isArray(cardData.documentControl.traceabilityMatrix.testScenarioIds) ? cardData.documentControl.traceabilityMatrix.testScenarioIds : []
          cardData.documentControl.traceabilityMatrix.implementationTaskIds = Array.isArray(cardData.documentControl.traceabilityMatrix.implementationTaskIds) ? cardData.documentControl.traceabilityMatrix.implementationTaskIds : []
        }
        
        if (cardData?.businessContext?.strategicObjective) {
          cardData.businessContext.strategicObjective.complianceRequirements = Array.isArray(cardData.businessContext.strategicObjective.complianceRequirements) ? cardData.businessContext.strategicObjective.complianceRequirements : []
        }
        
        return {
          id: item.id,
          title: item.title,
          description: item.description || '',
          card_type: item.card_type,
          card_data: cardData,
          strategy_id: item.strategy_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          created_by: item.created_by,
          version: cardData?.documentControl?.version || '1.0.0',
          status: cardData?.documentControl?.approvalStatus || 'draft',
          isExpanded: false
        }
      })
      
      setTechnicalRequirements(requirements)
    } catch (error) {
      console.error('Error loading technical requirements:', error)
    }
  }

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    )
  }

  const generateRequirement = async () => {
    if (selectedFeatures.length === 0) return

    console.log('🚀 FRONTEND: Starting TRD generation')
    console.log('📋 FRONTEND: Selected features:', selectedFeatures)
    console.log('📋 FRONTEND: Feature cards:', featureCards)

    setGenerating(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Not authenticated')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const selectedCards = featureCards.filter(card => selectedFeatures.includes(card.id))
      console.log('🎯 FRONTEND: Selected cards for generation:', selectedCards)
      console.log('📋 FRONTEND: Detailed card analysis:')
      selectedCards.forEach((card, index) => {
        console.log(`  Card ${index + 1}:`)
        console.log(`    - ID: ${card.id}`)
        console.log(`    - Title: ${card.title}`)
        console.log(`    - Description: ${card.description}`)
        console.log(`    - Card Type: ${card.card_type}`)
        console.log(`    - Card Data: ${JSON.stringify(card.card_data, null, 4)}`)
        console.log(`    - Strategy ID: ${card.strategy_id}`)
      })
      
      const requestPayload = {
        strategyId: Number(strategyId),
        features: selectedCards.map(card => ({
          id: card.id,
          name: card.title,
          description: card.description,
          cardData: card.card_data, // Include the full card_data for better context
          cardType: card.card_type
        })),
        options: {
          model: 'claude-4',
          includeArchitecture: true,
          includeDataModels: true,
          includeAPIs: true,
          includeSecurityRequirements: true
        }
      }
      
      console.log('📤 FRONTEND: Sending request payload:', JSON.stringify(requestPayload, null, 2))
      
      const response = await fetch('/api/development-bank/generate-technical-requirement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestPayload)
      })

      console.log('📞 FRONTEND: API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ FRONTEND: API error response:', errorText)
        throw new Error(`Failed to generate technical requirement: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ FRONTEND: API response result:', JSON.stringify(result, null, 2))
      
      if (result.success && result.requirement) {
        // Create structured TRD card instead of technical_requirements record
        const selectedCards = featureCards.filter(card => selectedFeatures.includes(card.id))
        const trdTemplate = createTRDTemplate(
          result.requirement.name || 'Technical Requirement',
          result.requirement.description || '',
          selectedCards.map(card => ({
            id: card.id,
            name: card.title,
            description: card.description,
            cardData: card.card_data
          }))
        )
        
        // Enhance the template with AI-generated content if available
        if (result.requirement.description) {
          // Parse the AI-generated content and map to structured fields
          // For now, store the full content in featureOverview and businessContext
          trdTemplate.featureRequirements.featureOverview = result.requirement.description
          trdTemplate.businessContext.strategicObjective.targetMarket = 'AI-generated technical requirements'
        }
        
        const { data: savedTRD, error: saveError } = await supabase
          .from('cards')
          .insert({
            strategy_id: Number(strategyId),
            title: result.requirement.name || 'Technical Requirement',
            description: result.requirement.description || '',
            card_type: 'technical-requirement-structured',
            card_data: trdTemplate,
            created_by: user.id
          })
          .select()
          .single()

        if (saveError) throw saveError

        // Add to local state
        const newRequirement: TechnicalRequirement = {
          id: savedTRD.id,
          title: savedTRD.title,
          description: savedTRD.description || '',
          card_type: savedTRD.card_type,
          card_data: savedTRD.card_data as TRDCardData,
          strategy_id: savedTRD.strategy_id,
          created_at: savedTRD.created_at,
          updated_at: savedTRD.updated_at,
          created_by: savedTRD.created_by,
          version: trdTemplate.documentControl.version,
          status: trdTemplate.documentControl.approvalStatus,
          isExpanded: true
        }
        
        setTechnicalRequirements(prev => [newRequirement, ...prev])
        setSelectedFeatures([])
        
        console.log('✅ FRONTEND: TRD saved and added to local state')
        console.log('📊 FRONTEND: New requirements count:', technicalRequirements.length + 1)
      }
    } catch (error) {
      console.error('Error generating technical requirement:', error)
    } finally {
      setGenerating(false)
    }
  }

  const toggleRequirement = (id: string) => {
    setTechnicalRequirements(prev => 
      prev.map(req => req.id === id ? { ...req, isExpanded: !req.isExpanded } : req)
    )
  }

  const deleteRequirement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTechnicalRequirements(prev => prev.filter(req => req.id !== id))
      console.log('✅ FRONTEND: TRD deleted successfully')
    } catch (error) {
      console.error('❌ FRONTEND: Error deleting TRD:', error)
    }
  }

  const duplicateRequirement = async (requirement: TechnicalRequirement) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Not authenticated')

      // Create a copy of the TRD template with updated metadata
      const duplicatedTemplate = {
        ...requirement.card_data,
        documentControl: {
          ...requirement.card_data.documentControl,
          trdId: `TRD-${Date.now()}`,
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          approvalStatus: 'draft' as const
        }
      }

      const { data: duplicatedTRD, error: duplicateError } = await supabase
        .from('cards')
        .insert({
          strategy_id: Number(strategyId),
          title: `${requirement.title} (Copy)`,
          description: requirement.description,
          card_type: 'technical-requirement-structured',
          card_data: duplicatedTemplate,
          created_by: user.id
        })
        .select()
        .single()

      if (duplicateError) throw duplicateError

      const newRequirement: TechnicalRequirement = {
        id: duplicatedTRD.id,
        title: duplicatedTRD.title,
        description: duplicatedTRD.description || '',
        card_type: duplicatedTRD.card_type,
        card_data: duplicatedTRD.card_data as TRDCardData,
        strategy_id: duplicatedTRD.strategy_id,
        created_at: duplicatedTRD.created_at,
        updated_at: duplicatedTRD.updated_at,
        created_by: duplicatedTRD.created_by,
        version: duplicatedTemplate.documentControl.version,
        status: duplicatedTemplate.documentControl.approvalStatus,
        isExpanded: false
      }
      
      setTechnicalRequirements(prev => [newRequirement, ...prev])
      console.log('✅ FRONTEND: TRD duplicated successfully')
    } catch (error) {
      console.error('❌ FRONTEND: Error duplicating TRD:', error)
    }
  }

  const updateRequirementName = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ title })
        .eq('id', id)

      if (error) throw error
      
      setTechnicalRequirements(prev => 
        prev.map(req => req.id === id ? { ...req, title } : req)
      )
    } catch (error) {
      console.error('❌ FRONTEND: Error updating TRD title:', error)
    }
  }

  const editRequirement = (id: string) => {
    // For now, just expand the requirement for editing
    // In the future, this could open a dedicated editing modal
    setTechnicalRequirements(prev => 
      prev.map(req => req.id === id ? { ...req, isExpanded: true } : req)
    )
    console.log('📝 FRONTEND: Opening TRD for editing:', id)
  }

  const commitToTaskList = async (requirement: TechnicalRequirement) => {
    try {
      console.log('📋 FRONTEND: Committing TRD to structured task list via MCP:', requirement.title)
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Not authenticated')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      
      console.log('🎯 FRONTEND: Calling MCP-powered API endpoint')
      console.log('📊 FRONTEND: TRD data being sent:', {
        trdId: requirement.id,
        trdTitle: requirement.title,
        strategyId: strategyId,
        userId: user.id,
        trdContentKeys: Object.keys(requirement.card_data)
      })
      
      // Call the MCP-powered API endpoint
      const response = await fetch('/api/development-bank/commit-trd-to-task-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          trdId: requirement.id,
          trdTitle: requirement.title,
          trdContent: requirement.card_data,
          strategyId: strategyId,
          userId: user.id
        })
      })
      
      console.log('📞 FRONTEND: API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ FRONTEND: API error response:', errorText)
        throw new Error(`Failed to commit TRD to task list: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ FRONTEND: MCP API response:', result)
      
      if (!result.success) {
        throw new Error(`Task list generation failed: ${result.error}`)
      }
      
      console.log('🎉 FRONTEND: Successfully committed TRD to structured task list!')
      console.log('📊 FRONTEND: Generated task list metadata:', result.metadata)
      
      // Update the TRD in local state to show it's been committed
      const updatedCardData = {
        ...requirement.card_data,
        implementationRoadmap: {
          ...requirement.card_data.implementationRoadmap,
          committedToTasks: true,
          committedAt: new Date().toISOString(),
          taskListId: result.taskList.id,
          taskIds: result.tasks.map((task: any) => task.id),
          totalTasks: result.metadata.totalTasks,
          totalEffort: result.metadata.totalEffort
        }
      }
      
      setTechnicalRequirements(prev => 
        prev.map(req => req.id === requirement.id ? {
          ...req,
          card_data: updatedCardData
        } : req)
      )
      
      console.log('🎯 FRONTEND: Task list committed successfully!')
      console.log(`📋 FRONTEND: Created ${result.metadata.totalTasks} tasks across ${result.metadata.categories} categories`)
      console.log(`💪 FRONTEND: Total effort: ${result.metadata.totalEffort} story points`)
      console.log('🔗 FRONTEND: Task list ID:', result.taskList.id)
      
      // Show success message to user
      alert(`Successfully created ${result.metadata.totalTasks} tasks! Switch to the Task Lists tab to see them.`)
      
      // Trigger a refresh of task lists by dispatching a custom event
      window.dispatchEvent(new CustomEvent('taskListCreated', {
        detail: {
          taskListId: result.taskList.id,
          taskCount: result.metadata.totalTasks,
          effort: result.metadata.totalEffort
        }
      }))
      
    } catch (error: any) {
      console.error('❌ FRONTEND: Error committing TRD to task list:', error)
      // Show error to user
      alert(`Error creating task list: ${error.message}`)
    }
  }
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Features Container */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setFeaturesExpanded(!featuresExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-black"
          >
            {featuresExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>Features</span>
            <span className="text-gray-500">({selectedFeatures.length} selected)</span>
          </button>
          
          <button
            onClick={generateRequirement}
            disabled={selectedFeatures.length === 0 || generating}
            className="px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? 'Generating...' : 'Submit Selected'}
          </button>
        </div>

        {featuresExpanded && (
          <div className="p-4">
            {featureCards.length === 0 ? (
              <div className="text-center py-8 text-black">
                <FileText className="w-8 h-8 mx-auto mb-2 text-black" />
                <p>No feature cards found in this strategy.</p>
                <button
                  onClick={() => createSampleFeatures()}
                  className="mt-3 px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Create Sample Features
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {featureCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => toggleFeature(card.id)}
                    className={`w-full text-left p-3 border rounded-md transition-colors ${
                      selectedFeatures.includes(card.id)
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-black text-sm">{card.title}</div>
                        <div className="text-black text-xs mt-1 line-clamp-2">{card.description}</div>
                      </div>
                      {selectedFeatures.includes(card.id) && (
                        <Check className="w-4 h-4 text-black flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Technical Requirements */}
      <div className="space-y-4">
        {technicalRequirements.map(requirement => (
          <div key={requirement.id} className="border border-gray-200 rounded-lg bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleRequirement(requirement.id)}
                  className="flex items-center space-x-2 text-sm font-medium text-black flex-1 text-left"
                >
                  {requirement.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <input
                    type="text"
                    value={requirement.title}
                    onChange={(e) => {
                      e.stopPropagation()
                      updateRequirementName(requirement.id, e.target.value)
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent border-none outline-none focus:bg-white rounded px-2 py-1 -ml-2"
                    placeholder="Requirement name"
                  />
                </button>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      commitToTaskList(requirement)
                    }}
                    disabled={requirement.card_data.implementationRoadmap?.committedToTasks}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      requirement.card_data.implementationRoadmap?.committedToTasks
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={requirement.card_data.implementationRoadmap?.committedToTasks 
                      ? 'Already committed to tasks' 
                      : 'Convert TRD to actionable tasks'}
                  >
                    {requirement.card_data.implementationRoadmap?.committedToTasks 
                      ? 'Already Committed' 
                      : 'Commit to Task List'}
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        editRequirement(requirement.id)
                      }}
                      className="p-1.5 text-black hover:text-blue-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        duplicateRequirement(requirement)
                      }}
                      className="p-1.5 text-black hover:text-green-600 rounded transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteRequirement(requirement.id)
                      }}
                      className="p-1.5 text-black hover:text-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-black mt-2 ml-6">
                Based on: {requirement.card_data.documentControl.traceabilityMatrix.userStoryIds.map(id => 
                  featureCards.find(f => f.id === id)?.title
                ).filter(Boolean).join(', ') || 'No features linked'}
                <span className="ml-4">Status: {requirement.status}</span>
                <span className="ml-4">Version: {requirement.version}</span>
                <span className="ml-4">TRD ID: {requirement.card_data.documentControl.trdId}</span>
                {requirement.card_data.implementationRoadmap?.committedToTasks && (
                  <span className="ml-4 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                    ✅ Committed to Tasks ({requirement.card_data.implementationRoadmap.totalTasks || 0} tasks, {requirement.card_data.implementationRoadmap.totalEffort || 0} points)
                  </span>
                )}
              </div>
            </div>

            {/* Collapsible Content */}
            {requirement.isExpanded && (
              <div className="p-4">
                <div className="space-y-6">
                  {/* Document Control */}
                  <div>
                    <h4 className="font-medium text-black mb-2">Document Control</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-black">
                      <div><span className="font-medium">TRD ID:</span> {requirement.card_data.documentControl.trdId}</div>
                      <div><span className="font-medium">Version:</span> {requirement.card_data.documentControl.version}</div>
                      <div><span className="font-medium">Status:</span> {requirement.card_data.documentControl.approvalStatus}</div>
                      <div><span className="font-medium">Last Updated:</span> {new Date(requirement.card_data.documentControl.lastUpdated).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Business Context */}
                  <div>
                    <h4 className="font-medium text-black mb-2">Business Context</h4>
                    <div className="text-sm text-black space-y-2">
                      {requirement.card_data.businessContext.strategicObjective.targetMarket && (
                        <div><span className="font-medium">Target Market:</span> {requirement.card_data.businessContext.strategicObjective.targetMarket}</div>
                      )}
                      {requirement.card_data.businessContext.strategicObjective.competitiveAdvantage && (
                        <div><span className="font-medium">Competitive Advantage:</span> {requirement.card_data.businessContext.strategicObjective.competitiveAdvantage}</div>
                      )}
                    </div>
                  </div>

                  {/* Feature Requirements */}
                  <div>
                    <h4 className="font-medium text-black mb-2">Feature Overview</h4>
                    <div className="text-sm text-black bg-gray-50 p-3 rounded border">
                      <div className="whitespace-pre-wrap">{requirement.card_data.featureRequirements.featureOverview}</div>
                    </div>
                  </div>

                  {/* User Stories */}
                  {requirement.card_data.featureRequirements.businessUserStories.length > 0 && (
                    <div>
                      <h4 className="font-medium text-black mb-2">Business User Stories</h4>
                      <div className="space-y-2">
                        {requirement.card_data.featureRequirements.businessUserStories.map((story, index) => (
                          <div key={index} className="text-sm text-black border-l-4 border-blue-500 pl-3">
                            <div className="font-medium text-black">{story.title}</div>
                            <div className="text-black">{story.story}</div>
                            {story.businessValue && <div className="text-green-600 text-xs mt-1">Value: {story.businessValue}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Requirements */}
                  <div>
                    <h4 className="font-medium text-black mb-2">Performance Requirements</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-black">
                      <div><span className="font-medium">Response Time:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.performance.responseTime}</div>
                      <div><span className="font-medium">Throughput:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.performance.throughput}</div>
                      <div><span className="font-medium">Latency:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.performance.latency}</div>
                      <div><span className="font-medium">Memory Usage:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.performance.memoryUsage}</div>
                    </div>
                  </div>

                  {/* Reliability Requirements */}
                  <div>
                    <h4 className="font-medium text-black mb-2">Reliability Requirements</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-black">
                      <div><span className="font-medium">Availability:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.reliability.availability}</div>
                      <div><span className="font-medium">Recovery Time:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.reliability.recoveryTime}</div>
                      <div><span className="font-medium">Data Durability:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.reliability.dataDurability}</div>
                      <div><span className="font-medium">Backup Strategy:</span> {requirement.card_data.featureRequirements.nonFunctionalRequirements.reliability.backupStrategy}</div>
                    </div>
                  </div>

                  {/* Security Requirements */}
                  <div>
                    <h4 className="font-medium text-black mb-2">Security Requirements</h4>
                    <div className="text-sm text-black space-y-2">
                      <div><span className="font-medium">Authentication:</span> {requirement.card_data.securityRequirements.authenticationAuthorization.oauthImplementation.authorizationFlow}</div>
                      <div><span className="font-medium">Data Encryption:</span> {requirement.card_data.securityRequirements.dataProtection.dataAtRest.applicationEncryption}</div>
                      <div><span className="font-medium">TLS Version:</span> {requirement.card_data.securityRequirements.dataProtection.dataInTransit.tlsVersion}</div>
                    </div>
                  </div>

                  {/* System Architecture */}
                  <div>
                    <h4 className="font-medium text-black mb-2">System Architecture</h4>
                    <div className="text-sm text-black space-y-2">
                      <div><span className="font-medium">Primary Database:</span> {requirement.card_data.technicalArchitecture.systemArchitecture.dataArchitecture.primaryDatabase}</div>
                      <div><span className="font-medium">Cache Layer:</span> {requirement.card_data.technicalArchitecture.systemArchitecture.dataArchitecture.cacheLayer}</div>
                      <div><span className="font-medium">Container Platform:</span> {requirement.card_data.technicalArchitecture.systemArchitecture.infrastructureArchitecture.containerPlatform}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {technicalRequirements.length === 0 && (
          <div className="text-center py-12 text-black">
            <FileText className="w-8 h-8 mx-auto mb-2 text-black" />
            <p className="text-sm">No technical requirements yet.</p>
            <p className="text-xs">Select features and click Submit Selected to generate requirements.</p>
          </div>
        )}
      </div>
    </div>
  )
}
