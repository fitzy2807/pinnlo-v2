'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Target, Layers, TrendingUp, Users } from 'lucide-react'
import { blueprintRegistry } from '@/components/blueprints/registry'

interface TargetBlueprintSelectorProps {
  contextSummary: string
  selectedBlueprint: string | null
  generationOptions: {
    count: number
    style: 'comprehensive' | 'focused' | 'innovative'
  }
  onUpdate: (blueprint: string, options: any) => void
  onContinue: () => void
}

const categoryIcons: Record<string, any> = {
  'Core Strategy': Target,
  'Research & Analysis': TrendingUp,
  'Planning & Execution': Layers,
  'Measurement': Users
}

// AI recommendations based on context keywords
const getRecommendations = (contextSummary: string): string[] => {
  const summary = contextSummary.toLowerCase()
  const recommendations: string[] = []

  // Pattern matching for recommendations
  if (summary.includes('vision') || summary.includes('future') || summary.includes('aspiration')) {
    recommendations.push('vision')
  }
  if (summary.includes('customer') || summary.includes('user') || summary.includes('persona')) {
    recommendations.push('personas', 'customer-journey')
  }
  if (summary.includes('competitive') || summary.includes('competitor') || summary.includes('market position')) {
    recommendations.push('competitive-analysis', 'value-proposition')
  }
  if (summary.includes('goal') || summary.includes('objective') || summary.includes('metric')) {
    recommendations.push('okrs', 'kpis')
  }
  if (summary.includes('business model') || summary.includes('revenue') || summary.includes('monetization')) {
    recommendations.push('business-model', 'financial-projections')
  }
  if (summary.includes('launch') || summary.includes('market entry') || summary.includes('go to market')) {
    recommendations.push('go-to-market')
  }
  if (summary.includes('risk') || summary.includes('threat') || summary.includes('challenge')) {
    recommendations.push('risk-assessment', 'swot-analysis')
  }

  return [...new Set(recommendations)].slice(0, 3) // Return top 3 unique recommendations
}

export default function TargetBlueprintSelector({
  contextSummary,
  selectedBlueprint,
  generationOptions,
  onUpdate,
  onContinue
}: TargetBlueprintSelectorProps) {
  const [selected, setSelected] = useState(selectedBlueprint)
  const [options, setOptions] = useState(generationOptions)
  const recommendations = getRecommendations(contextSummary)

  const blueprintCategories = {
    'Core Strategy': ['strategic-context', 'vision', 'value-proposition'],
    'Research & Analysis': ['personas', 'customer-journey', 'swot-analysis', 'competitive-analysis'],
    'Planning & Execution': ['okrs', 'business-model', 'go-to-market', 'risk-assessment', 'roadmap'],
    'Measurement': ['kpis', 'financial-projections']
  }

  const handleSelect = (blueprintId: string) => {
    setSelected(blueprintId)
    onUpdate(blueprintId, options)
  }

  const handleOptionsChange = (newOptions: any) => {
    setOptions(newOptions)
    if (selected) {
      onUpdate(selected, newOptions)
    }
  }

  return (
    <div className="flex h-full">
      {/* Main Content - Blueprint Selection */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Target Blueprint
          </h3>
          <p className="text-sm text-gray-600">
            Choose which type of strategy card to generate based on your context
          </p>
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-600" />
              <h4 className="text-sm font-medium text-indigo-900">AI Recommendations</h4>
            </div>
            <p className="text-sm text-indigo-700 mb-3">
              Based on your context, we recommend these blueprints:
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendations.map(blueprintId => {
                const blueprint = blueprintRegistry[blueprintId]
                if (!blueprint) return null
                return (
                  <button
                    key={blueprintId}
                    onClick={() => handleSelect(blueprintId)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selected === blueprintId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-100'
                    }`}
                  >
                    {blueprint.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Blueprint Categories */}
        <div className="space-y-6">
          {Object.entries(blueprintCategories).map(([category, blueprints]) => {
            const Icon = categoryIcons[category] || Layers

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={20} className="text-gray-400" />
                  <h4 className="font-medium text-gray-900">{category}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {blueprints.map(blueprintId => {
                    const blueprint = blueprintRegistry[blueprintId]
                    if (!blueprint) return null

                    const isSelected = selected === blueprintId
                    const isRecommended = recommendations.includes(blueprintId)

                    return (
                      <button
                        key={blueprintId}
                        onClick={() => handleSelect(blueprintId)}
                        className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {isRecommended && (
                          <div className="absolute top-2 right-2">
                            <Sparkles size={14} className="text-indigo-600" />
                          </div>
                        )}

                        <h5 className="font-medium text-gray-900 mb-1">
                          {blueprint.name}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {blueprint.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Generation Options */}
      <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-4">
          Generation Options
        </h4>

        {selected ? (
          <div className="space-y-6">
            {/* Selected Blueprint Info */}
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-1">
                {blueprintRegistry[selected]?.name}
              </h5>
              <p className="text-xs text-gray-600">
                {blueprintRegistry[selected]?.description}
              </p>
            </div>

            {/* Number of Cards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cards
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleOptionsChange({ ...options, count: num })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      options.count === num
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generation Style
              </label>
              <div className="space-y-2">
                {[
                  { value: 'comprehensive', label: 'Comprehensive', desc: 'Detailed and thorough' },
                  { value: 'focused', label: 'Focused', desc: 'Concise and action-oriented' },
                  { value: 'innovative', label: 'Innovative', desc: 'Creative and unconventional' }
                ].map(style => (
                  <label
                    key={style.value}
                    className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      options.style === style.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={options.style === style.value}
                      onChange={() => handleOptionsChange({ ...options, style: style.value as any })}
                      className="sr-only"
                    />
                    <div className="font-medium text-sm">{style.label}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{style.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Expected Output */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="text-sm font-medium text-blue-900 mb-1">
                Expected Output
              </h5>
              <p className="text-xs text-blue-700">
                AI will generate {options.count} {blueprintRegistry[selected]?.name} card{options.count > 1 ? 's' : ''} 
                {' '}with a {options.style} approach based on your strategic context.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Select a blueprint type to configure generation options
          </p>
        )}

        {/* Continue Button */}
        <div className="mt-6">
          <button
            onClick={onContinue}
            disabled={!selected}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Cards
          </button>
        </div>
      </div>
    </div>
  )
}