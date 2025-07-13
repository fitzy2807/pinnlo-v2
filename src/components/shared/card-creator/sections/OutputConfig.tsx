'use client'

import React from 'react'
import { CardCreatorConfig } from '../types'

interface OutputConfigProps {
  config: CardCreatorConfig
  targetSection: string
  onTargetSectionChange: (section: string) => void
  cardQuantity: number
  onQuantityChange: (quantity: number) => void
  quality: 'fast' | 'balanced' | 'high'
  onQualityChange: (quality: 'fast' | 'balanced' | 'high') => void
  selectedCardsCount: number
  onGenerate: () => void
  isGenerating: boolean
}

export default function OutputConfig({
  config,
  targetSection,
  onTargetSectionChange,
  cardQuantity,
  onQuantityChange,
  quality,
  onQualityChange,
  selectedCardsCount,
  onGenerate,
  isGenerating
}: OutputConfigProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Configure Output
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Section
          </label>
          <select
            value={targetSection}
            onChange={(e) => onTargetSectionChange(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              targetSection ? 'text-black' : 'text-gray-500'
            }`}
          >
            <option value="" className="text-gray-500">Select target section...</option>
            {config.sections.map((section) => (
              <option key={section.id} value={section.id} className="text-black">
                {section.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Cards: {cardQuantity}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={cardQuantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Generation Quality
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['fast', 'balanced', 'high'] as const).map((q) => (
              <button
                key={q}
                onClick={() => onQualityChange(q)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  quality === q
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {targetSection && selectedCardsCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              🎯 Ready to generate {cardQuantity} cards for{' '}
              {config.sections.find(s => s.id === targetSection)?.label}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Using {selectedCardsCount} context cards • Quality: {quality}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}