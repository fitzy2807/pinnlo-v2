'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Wrench, 
  Lightbulb, 
  FileCode, 
  Package, 
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { DevelopmentBankService, type TechStackSelection, type DevBankAsset } from '@/services/developmentBankService'
import TechStackSelector from './TechStackSelector'
import SpecificationDisplay from './SpecificationDisplay'

interface DevelopmentBankProps {
  strategyId: string
  onClose: () => void
}

type ActiveTab = 'tech-stack' | 'specifications' | 'assets'

export default function DevelopmentBank({ strategyId, onClose }: DevelopmentBankProps) {
  const { user, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('tech-stack')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Tech Stack state
  const [techStacks, setTechStacks] = useState<TechStackSelection[]>([])
  const [selectedTechStack, setSelectedTechStack] = useState<TechStackSelection | null>(null)
  const [generatingTechStack, setGeneratingTechStack] = useState(false)
  
  // Specification state
  const [specifications, setSpecifications] = useState<DevBankAsset[]>([])
  const [selectedSpecification, setSelectedSpecification] = useState<DevBankAsset | null>(null)
  const [generatingSpec, setGeneratingSpec] = useState(false)

  // Load existing data when user is available
  useEffect(() => {
    if (strategyId && user && !authLoading) {
      loadTechStacks()
      loadSpecifications()
    }
  }, [strategyId, user, authLoading])

  const loadTechStacks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const stacks = await DevelopmentBankService.getTechStacks(Number(strategyId))
      setTechStacks(stacks)
    } catch (err) {
      setError('Failed to load tech stacks')
      console.error('Error loading tech stacks:', err)
    } finally {
      setLoading(false)
    }
  }, [strategyId])

  const loadSpecifications = useCallback(async () => {
    try {
      const specs = await DevelopmentBankService.getAssets(Number(strategyId), 'tech-spec')
      setSpecifications(specs)
    } catch (err) {
      console.error('Error loading specifications:', err)
    }
  }, [strategyId])

  const handleTechStackGenerated = useCallback((newTechStack: TechStackSelection) => {
    setTechStacks(prev => [newTechStack, ...prev])
    setSelectedTechStack(newTechStack)
    setActiveTab('tech-stack')
  }, [])

  const handleSpecificationGenerated = useCallback((newSpec: DevBankAsset) => {
    setSpecifications(prev => [newSpec, ...prev])
    setSelectedSpecification(newSpec)
    setActiveTab('specifications')
  }, [])

  const handleRegenerateSpec = useCallback(() => {
    if (selectedSpecification) {
      setGeneratingSpec(true)
      // Logic to regenerate specification
      setTimeout(() => {
        setGeneratingSpec(false)
        // Refresh the specification
        loadSpecifications()
      }, 2000)
    }
  }, [selectedSpecification, loadSpecifications])

  const tabs = [
    { id: 'tech-stack', label: 'Tech Stack', icon: Wrench, count: techStacks.length },
    { id: 'specifications', label: 'Specifications', icon: FileCode, count: specifications.length },
    { id: 'assets', label: 'Assets', icon: Package, count: 0 }
  ]

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-600">Initializing Development Bank...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please sign in to access the Development Bank.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
        {/* Tab Navigation */}
        <div className="p-4 border-b border-gray-200">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
                {count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === id ? 'bg-gray-200 text-black' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content Lists */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'tech-stack' && (
            <div className="space-y-3">
              {techStacks.map((stack) => (
                <button
                  key={stack.id}
                  onClick={() => setSelectedTechStack(stack)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTechStack?.id === stack.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{stack.stack_name}</h4>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {Object.keys(stack.layers || {}).length} layers configured
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(stack.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
              
              {techStacks.length === 0 && !generatingTechStack && (
                <div className="text-center py-8">
                  <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No tech stacks generated yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="space-y-3">
              {specifications.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecification(spec)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSpecification?.id === spec.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">Tech Specification</h4>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Version {spec.version} • {spec.source_card_ids?.length || 0} features
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(spec.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
              
              {specifications.length === 0 && !generatingSpec && (
                <div className="text-center py-8">
                  <FileCode className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No specifications generated yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Asset management coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tech-stack' && (
            <TechStackSelector
              strategyId={strategyId}
              selectedTechStack={selectedTechStack}
              onTechStackGenerated={handleTechStackGenerated}
            />
          )}

          {activeTab === 'specifications' && (
            <SpecificationDisplay
              asset={selectedSpecification}
              loading={generatingSpec}
              onRegenerate={handleRegenerateSpec}
            />
          )}

          {activeTab === 'assets' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Asset Management</h3>
                <p className="text-gray-600">
                  Advanced asset management features coming soon
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}