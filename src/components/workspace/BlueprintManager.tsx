'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Share2, MoreHorizontal, Settings, Plus, Check, Search, Filter, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getAllBlueprints, BLUEPRINT_CATEGORIES, MANDATORY_BLUEPRINTS, validateBlueprintDependencies, getSuggestedBlueprints } from '../blueprints/registry'

interface BlueprintManagerProps {
  strategyId: string
  onBlueprintsChange?: (blueprints: string[]) => void
}

const CATEGORIES = ['All', ...Object.keys(BLUEPRINT_CATEGORIES)]

export default function BlueprintManager({ strategyId, onBlueprintsChange }: BlueprintManagerProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedBlueprints, setSelectedBlueprints] = useState<string[]>(MANDATORY_BLUEPRINTS)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Load saved blueprints on mount
  useEffect(() => {
    loadBlueprintsFromDatabase()
  }, [strategyId])

  const loadBlueprintsFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('blueprint_config')
        .eq('id', strategyId)
        .single()

      if (error) {
        console.error('Error loading blueprint config:', error)
        return
      }

      if (data?.blueprint_config?.enabledBlueprints) {
        const enabledBlueprints = data.blueprint_config.enabledBlueprints
        setSelectedBlueprints(enabledBlueprints)
        onBlueprintsChange?.(enabledBlueprints)
      }
    } catch (error) {
      console.error('Error loading blueprints:', error)
    }
  }

  const allBlueprints = getAllBlueprints()

  // Filter blueprints based on search and category
  const filteredBlueprints = useMemo(() => {
    return allBlueprints.filter(blueprint => {
      const matchesSearch = blueprint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           blueprint.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || blueprint.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, allBlueprints])

  // Get validation results
  const validation = validateBlueprintDependencies(selectedBlueprints)
  const suggestions = getSuggestedBlueprints(selectedBlueprints)

  const handleBlueprintToggle = (blueprintId: string) => {
    // Prevent deselecting mandatory blueprints
    if (MANDATORY_BLUEPRINTS.includes(blueprintId) && selectedBlueprints.includes(blueprintId)) {
      return
    }

    const newBlueprints = selectedBlueprints.includes(blueprintId)
      ? selectedBlueprints.filter(id => id !== blueprintId)
      : [...selectedBlueprints, blueprintId]
    
    setSelectedBlueprints(newBlueprints)
  }

  const handleSave = async () => {
    if (!validation.isValid) {
      alert('Please resolve blueprint dependencies before saving.')
      return
    }

    setIsLoading(true)
    try {
      console.log('Saving blueprints for strategy:', strategyId, selectedBlueprints)
      
      const { error } = await supabase
        .from('strategies')
        .update({
          blueprint_config: {
            enabledBlueprints: selectedBlueprints,
            mandatoryBlueprints: MANDATORY_BLUEPRINTS,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq('id', strategyId)

      if (error) {
        throw error
      }

      // Notify parent component of the change
      onBlueprintsChange?.(selectedBlueprints)
      
      setModalOpen(false)
      console.log('✅ Blueprints saved successfully')
    } catch (error) {
      console.error('Failed to save blueprints:', error)
      alert('Failed to save blueprint configuration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addSuggestedBlueprint = (blueprintId: string) => {
    if (!selectedBlueprints.includes(blueprintId)) {
      const newBlueprints = [...selectedBlueprints, blueprintId]
      setSelectedBlueprints(newBlueprints)
    }
  }

  const toggleModal = () => {
    setModalOpen(!modalOpen)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const isBlueprintMandatory = (blueprintId: string) => {
    return MANDATORY_BLUEPRINTS.includes(blueprintId)
  }

  const isBlueprintSuggested = (blueprintId: string) => {
    return suggestions.includes(blueprintId)
  }

  return (
    <div className="relative">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span className="text-xs font-medium">Back to Dashboard</span>
            </Link>
            
            <div className="text-gray-300">|</div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Strategy #2</span>
              <span className="text-gray-300">/</span>
              <span className="text-xs font-medium text-gray-900">Strategic Context</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Share2 size={12} />
              <span>Share</span>
            </button>
            
            <button className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Settings size={12} />
              <span>Settings</span>
            </button>
            
            <button className="p-1 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Manager Module */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          <div className="w-64"></div>
          <div className="flex-1 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Strategy Blueprints</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Choose which strategy components to include in your workspace. Each blueprint provides structured templates and guidance for different aspects of your strategy.
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={toggleModal}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <Plus size={14} />
                  <span>Manage Blueprints</span>
                  <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                    {selectedBlueprints.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-80"></div>
        </div>
      </div>

      {/* Blueprint Selection Modal - Slides Down */}
      <div className={`absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl z-50 overflow-hidden transition-all duration-300 ease-out ${
        modalOpen ? 'max-h-screen opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
      }`}>
        <div className="px-6 py-5">
          {/* Modal Header with Search */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Select Strategy Blueprints</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filteredBlueprints.length} blueprint{filteredBlueprints.length !== 1 ? 's' : ''} available
                  {searchQuery && ` • Searching for "${searchQuery}"`}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500">{selectedBlueprints.length} selected</span>
                <button
                  onClick={toggleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Validation Errors */}
            {!validation.isValid && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-800 font-medium mb-1">Blueprint Dependencies Required:</p>
                <ul className="text-xs text-red-700 space-y-0.5">
                  {validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800 font-medium mb-1">Suggested Blueprints:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map(suggestionId => {
                    const blueprint = allBlueprints.find(b => b.id === suggestionId)
                    if (!blueprint) return null
                    return (
                      <button
                        key={suggestionId}
                        onClick={() => addSuggestedBlueprint(suggestionId)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        + {blueprint.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search blueprints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Compact Blueprint Grid - 7 columns for scalability */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2 mb-4 max-h-80 overflow-y-auto">
            {filteredBlueprints.map((blueprint) => {
              const isSelected = selectedBlueprints.includes(blueprint.id)
              const isMandatory = isBlueprintMandatory(blueprint.id)
              const isSuggested = isBlueprintSuggested(blueprint.id)
              
              return (
                <button
                  key={blueprint.id}
                  onClick={() => handleBlueprintToggle(blueprint.id)}
                  disabled={isMandatory && isSelected}
                  className={`p-2 rounded-md border transition-all duration-200 text-left group relative ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${isMandatory && isSelected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Badges */}
                  <div className="absolute top-1 right-1 flex space-x-1">
                    {isMandatory && (
                      <span className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                        Required
                      </span>
                    )}
                    {isSuggested && !isSelected && (
                      <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        Suggested
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between mb-1 pr-12">
                    <span className="text-sm">{blueprint.icon}</span>
                    {isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                      <Check size={8} className="text-gray-900" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className={`text-xs font-medium mb-0.5 leading-tight ${
                    isSelected ? 'text-white' : 'text-gray-900'
                  }`}>
                    {blueprint.name}
                  </h4>
                  
                  <p className={`text-xs leading-tight line-clamp-2 ${
                    isSelected ? 'text-gray-200' : 'text-gray-500'
                  }`}>
                    {blueprint.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* No Results State */}
          {filteredBlueprints.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Search size={24} className="mx-auto" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">No blueprints found</h4>
              <p className="text-xs text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedBlueprints(filteredBlueprints.map(b => b.id))}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                Select All ({filteredBlueprints.length})
              </button>
              <button
                onClick={() => setSelectedBlueprints(MANDATORY_BLUEPRINTS)}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reset to Required
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary btn-sm"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`btn btn-sm ${
                  validation.isValid ? 'btn-primary' : 'btn-secondary opacity-50'
                }`}
                disabled={isLoading || !validation.isValid}
              >
                {isLoading ? 'Saving...' : `Save ${selectedBlueprints.length} Blueprint${selectedBlueprints.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}