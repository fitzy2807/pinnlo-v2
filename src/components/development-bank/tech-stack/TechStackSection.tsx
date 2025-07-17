'use client'

import React, { useState, useMemo } from 'react'
import { 
  Plus, 
  Layers, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Loader2,
  Github
} from 'lucide-react'
import MasterCard from '@/components/cards/MasterCard'
import { useTechStackComponents } from '@/hooks/useTechStackComponents'
import { supabase } from '@/lib/supabase'

interface TechStackSectionProps {
  strategyId: number
}

// Category options matching the database enum
const CATEGORIES = [
  'Frontend',
  'Backend', 
  'Database',
  'Infrastructure',
  'DevOps',
  'Analytics',
  'Security',
  'Integration',
  'Mobile'
]

// Implementation status options
const IMPLEMENTATION_STATUSES = [
  { value: 'planned', label: 'Planned', color: 'bg-gray-100 text-gray-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'deprecated', label: 'Deprecated', color: 'bg-red-100 text-red-800' }
]

export default function TechStackSection({ strategyId }: TechStackSectionProps) {
  // Data management
  const { 
    components, 
    isLoading, 
    error,
    createComponent, 
    updateComponent, 
    deleteComponent,
    duplicateComponent,
    isCreating 
  } = useTechStackComponents(strategyId)
  
  // UI state
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [aiGenerating, setAiGenerating] = useState<string | null>(null)
  const [showGitHubModal, setShowGitHubModal] = useState(false)
  const [githubAnalyzing, setGithubAnalyzing] = useState(false)
  const [githubForm, setGithubForm] = useState({
    repositoryUrl: '',
    githubToken: ''
  })
  
  // Create modal state
  const [newComponent, setNewComponent] = useState({
    technology_name: '',
    category: 'Frontend',
    description: ''
  })

  // Filter components based on search and filters
  const filteredComponents = useMemo(() => {
    if (!components) return []
    
    return components.filter(component => {
      // Search filter
      const searchLower = search.toLowerCase()
      const matchesSearch = 
        component.technology_name?.toLowerCase().includes(searchLower) ||
        component.description?.toLowerCase().includes(searchLower) ||
        component.vendor?.toLowerCase().includes(searchLower) ||
        component.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      
      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || 
        component.category === selectedCategory
      
      // Status filter
      const matchesStatus = 
        selectedStatus === 'all' || 
        component.implementation_status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [components, search, selectedCategory, selectedStatus])

  // Group components by category for display
  const groupedComponents = useMemo(() => {
    const groups: Record<string, typeof filteredComponents> = {}
    
    filteredComponents.forEach(component => {
      const category = component.category || 'Uncategorized'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(component)
    })
    
    return groups
  }, [filteredComponents])

  // Handle quick create
  const handleQuickCreate = async () => {
    if (!newComponent.technology_name || !newComponent.category) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      await createComponent({
        technology_name: newComponent.technology_name,
        title: newComponent.technology_name,
        category: newComponent.category,
        description: newComponent.description || `${newComponent.category} technology`,
        priority: 'Medium',
        confidence_level: 'Medium',
        implementation_status: 'planned'
      })
      
      // Reset form and close modal
      setNewComponent({
        technology_name: '',
        category: 'Frontend',
        description: ''
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create component:', error)
      alert('Failed to create component. Please try again.')
    }
  }

  // Handle AI generation for a component
  const handleAIGenerate = async (componentId: string) => {
    const component = components?.find(c => c.id === componentId)
    if (!component) return
    
    setAiGenerating(componentId)
    
    try {
      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')
      
      // Call MCP tool via API
      const response = await fetch('/api/mcp/invoke', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          tool: 'generate_tech_stack_component',
          arguments: {
            technology_name: component.technology_name,
            category: component.category,
            existing_stack: components?.map(c => ({
              technology_name: c.technology_name,
              category: c.category
            })) || [],
            company_context: {
              team_size: 'Medium',
              tech_maturity: 'Growing'
            }
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate content')
      }
      
      const result = await response.json()
      
      // Parse the AI response
      if (result.content?.[0]?.text) {
        const { prompts } = JSON.parse(result.content[0].text)
        
        // Call OpenAI through our API
        const openAIResponse = await fetch('/api/openai/complete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: prompts.system },
              { role: 'user', content: prompts.user }
            ],
            temperature: 0.7,
            max_tokens: 4000
          })
        })
        
        if (!openAIResponse.ok) {
          throw new Error('Failed to generate AI content')
        }
        
        const aiResult = await openAIResponse.json()
        const generatedData = JSON.parse(aiResult.choices[0].message.content)
        
        // Update component with AI-generated data
        await updateComponent(componentId, {
          ...generatedData,
          ai_generated: true,
          ai_generation_context: {
            generated_at: new Date().toISOString(),
            model: 'gpt-4'
          }
        })
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      alert('AI generation failed. Please try again.')
    } finally {
      setAiGenerating(null)
    }
  }

  // Handle GitHub repository analysis
  const handleGitHubAnalysis = async (repositoryUrl: string, githubToken: string) => {
    setGithubAnalyzing(true)
    
    try {
      // Call MCP GitHub analysis tool
      const analysisResponse = await fetch('http://localhost:3001/api/tools/analyze_github_repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repository_url: repositoryUrl,
          github_token: githubToken,
          analysis_depth: 'standard',
          focus_areas: ['frontend', 'backend', 'database', 'devops'],
          user_id: 'current-user' // TODO: Get from session
        })
      })
      
      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze GitHub repository')
      }
      
      const analysisResult = await analysisResponse.json()
      
      if (analysisResult.content?.[0]?.text) {
        const { prompts, repository_info } = JSON.parse(analysisResult.content[0].text)
        
        // Generate tech stack cards using AI
        const openAIResponse = await fetch('/api/openai/complete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: prompts.system },
              { role: 'user', content: prompts.user }
            ],
            temperature: 0.3,
            max_tokens: 4000
          })
        })
        
        if (!openAIResponse.ok) {
          throw new Error('Failed to generate tech stack cards')
        }
        
        const aiResult = await openAIResponse.json()
        const generatedContent = JSON.parse(aiResult.choices[0].message.content)
        
        // Create tech stack cards from the analysis
        if (generatedContent.tech_stack_cards) {
          for (const card of generatedContent.tech_stack_cards) {
            await createComponent({
              technology_name: card.technology_name,
              title: card.technology_name,
              category: card.category,
              description: card.description,
              version: card.version,
              implementation_status: 'active',
              strategic_value: card.priority?.toLowerCase() || 'medium',
              confidence_score: card.confidence_score,
              detected_from: card.detected_from?.join(', ') || '',
              github_repository: repository_info.html_url,
              ai_generated: true,
              ai_generation_context: {
                generated_at: new Date().toISOString(),
                model: 'github-analysis',
                repository: repository_info.full_name,
                analysis_depth: 'standard'
              },
              ...card.implementation_details
            })
          }
          
          alert(`Successfully created ${generatedContent.tech_stack_cards.length} tech stack components from ${repository_info.name}!`)
        }
      }
    } catch (error) {
      console.error('GitHub analysis failed:', error)
      alert('Failed to analyze GitHub repository. Please check your token and try again.')
    } finally {
      setGithubAnalyzing(false)
      setShowGitHubModal(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading tech stack...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Failed to load tech stack</p>
          <p className="text-xs text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Technology Stack
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Document and manage your technical architecture components
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {/* GitHub Analysis Button */}
          <button
            onClick={() => setShowGitHubModal(true)}
            disabled={githubAnalyzing}
            className="px-4 py-1.5 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {githubAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Github className="w-4 h-4" />
            )}
            Analyze from GitHub
          </button>
          
          {/* Add Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating}
            className="px-4 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Technology
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>
        
        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black appearance-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        
        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black appearance-none"
          >
            <option value="all">All Statuses</option>
            {IMPLEMENTATION_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Components Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredComponents.length} {filteredComponents.length === 1 ? 'technology' : 'technologies'}
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {selectedStatus !== 'all' && ` (${IMPLEMENTATION_STATUSES.find(s => s.value === selectedStatus)?.label})`}
        </p>
      </div>

      {/* Components Display */}
      {filteredComponents.length > 0 ? (
        viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComponents.map(component => (
              <MasterCard
                key={component.id}
                cardData={{
                  ...component,
                  cardType: 'tech-stack',
                  // Ensure all required MasterCard fields
                  id: component.id,
                  title: component.title || component.technology_name,
                  description: component.description || '',
                  priority: component.priority || 'Medium',
                  confidenceLevel: component.confidence_level || 'Medium',
                  priorityRationale: component.priority_rationale || '',
                  confidenceRationale: component.confidence_rationale || '',
                  strategicAlignment: component.strategic_alignment || '',
                  tags: component.tags || [],
                  relationships: component.relationships || [],
                  creator: component.created_by || 'system',
                  lastModified: component.updated_at || new Date().toISOString()
                }}
                onUpdate={async (updates) => {
                  await updateComponent(component.id, updates)
                }}
                onDelete={() => deleteComponent(component.id)}
                onDuplicate={() => duplicateComponent(component.id)}
                onAIEnhance={() => handleAIGenerate(component.id)}
                availableCards={components?.map(c => ({
                  id: c.id,
                  title: c.technology_name,
                  cardType: 'tech-stack'
                })) || []}
              />
            ))}
          </div>
        ) : (
          // List View - Grouped by Category
          <div className="space-y-6">
            {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {category} ({categoryComponents.length})
                </h4>
                <div className="space-y-3">
                  {categoryComponents.map(component => (
                    <MasterCard
                      key={component.id}
                      cardData={{
                        ...component,
                        cardType: 'tech-stack',
                        id: component.id,
                        title: component.title || component.technology_name,
                        description: component.description || '',
                        priority: component.priority || 'Medium',
                        confidenceLevel: component.confidence_level || 'Medium',
                        priorityRationale: component.priority_rationale || '',
                        confidenceRationale: component.confidence_rationale || '',
                        strategicAlignment: component.strategic_alignment || '',
                        tags: component.tags || [],
                        relationships: component.relationships || [],
                        creator: component.created_by || 'system',
                        lastModified: component.updated_at || new Date().toISOString()
                      }}
                      onUpdate={async (updates) => {
                        await updateComponent(component.id, updates)
                      }}
                      onDelete={() => deleteComponent(component.id)}
                      onDuplicate={() => duplicateComponent(component.id)}
                      onAIEnhance={() => handleAIGenerate(component.id)}
                      availableCards={components?.map(c => ({
                        id: c.id,
                        title: c.technology_name,
                        cardType: 'tech-stack'
                      })) || []}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Empty State
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {search || selectedCategory !== 'all' || selectedStatus !== 'all' 
              ? 'No technologies found' 
              : 'No technologies documented yet'}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {search || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Start building your tech stack documentation'}
          </p>
          {!search && selectedCategory === 'all' && selectedStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Add Your First Technology
            </button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Technology</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technology Name *
                </label>
                <input
                  type="text"
                  value={newComponent.technology_name}
                  onChange={(e) => setNewComponent({...newComponent, technology_name: e.target.value})}
                  placeholder="e.g., React, PostgreSQL, Docker"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={newComponent.category}
                  onChange={(e) => setNewComponent({...newComponent, category: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newComponent.description}
                  onChange={(e) => setNewComponent({...newComponent, description: e.target.value})}
                  placeholder="Brief description of this technology..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickCreate}
                disabled={!newComponent.technology_name || isCreating}
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Technology'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Analysis Modal */}
      {showGitHubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              Analyze GitHub Repository
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={githubForm.repositoryUrl}
                  onChange={(e) => setGithubForm({...githubForm, repositoryUrl: e.target.value})}
                  placeholder="https://github.com/owner/repo or owner/repo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubForm.githubToken}
                  onChange={(e) => setGithubForm({...githubForm, githubToken: e.target.value})}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Create a token at GitHub → Settings → Developer settings → Personal access tokens
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowGitHubModal(false)
                  setGithubForm({ repositoryUrl: '', githubToken: '' })
                }}
                disabled={githubAnalyzing}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGitHubAnalysis(githubForm.repositoryUrl, githubForm.githubToken)}
                disabled={githubAnalyzing || !githubForm.repositoryUrl || !githubForm.githubToken}
                className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {githubAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    Analyze Repository
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Loading Overlay */}
      {aiGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
            <p className="text-sm">Generating with AI...</p>
          </div>
        </div>
      )}
    </div>
  )
}