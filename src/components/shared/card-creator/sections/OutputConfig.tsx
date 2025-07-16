'use client'

import React from 'react'
import { CardCreatorConfig } from '../types'

interface OutputConfigProps {
  config: CardCreatorConfig
  targetSection: string
  onTargetSectionChange: (section: string) => void
  selectedCardsCount: number
}

export default function OutputConfig({
  config,
  targetSection,
  onTargetSectionChange,
  selectedCardsCount
}: OutputConfigProps) {
  // Filter sections to only show those relevant to the current bank
  const targetSections = config.sections.filter(s => s.category === config.bankType)
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
            {targetSections.map((section) => (
              <option key={section.id} value={section.id} className="text-black">
                {section.label}
              </option>
            ))}
          </select>
        </div>
        
        {targetSection && selectedCardsCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              🎯 Ready to preview context for{' '}
              {targetSections.find(s => s.id === targetSection)?.label}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Using {selectedCardsCount} context cards
            </p>
          </div>
        )}
      </div>
    </div>
  )
}