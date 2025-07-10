'use client'

import { useState } from 'react'
import { blueprintRegistry } from '@/components/blueprints/registry'
import { ArrowLeft } from 'lucide-react'

interface CardTypeSelectorProps {
  selectedTypes: string[]
  onSubmit: (types: string[]) => void
  onBack: () => void
  loading: boolean
}

export default function CardTypeSelector({ selectedTypes, onSubmit, onBack, loading }: CardTypeSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedTypes))

  const categories = {
    'Core Strategy': ['strategic-context', 'vision', 'value-proposition'],
    'Research & Analysis': ['personas', 'customer-journey', 'swot-analysis', 'competitive-analysis'],
    'Planning & Execution': ['okrs', 'business-model', 'go-to-market', 'risk-assessment', 'roadmap'],
    'Measurement': ['kpis', 'financial-projections']
  }

  const toggleType = (type: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelected(newSelected)
  }

  const toggleCategory = (types: string[]) => {
    const newSelected = new Set(selected)
    const allSelected = types.every(type => newSelected.has(type))
    
    if (allSelected) {
      types.forEach(type => newSelected.delete(type))
    } else {
      types.forEach(type => newSelected.add(type))
    }
    
    setSelected(newSelected)
  }

  const handleSubmit = () => {
    if (selected.size === 0) {
      alert('Please select at least one card type')
      return
    }
    onSubmit(Array.from(selected))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full"
          disabled={loading}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="text-lg font-semibold">Select Card Types</h3>
          <p className="text-sm text-gray-500">Choose which types of strategy cards to generate</p>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(categories).map(([category, types]) => {
          const allSelected = types.every(type => selected.has(type))
          const someSelected = types.some(type => selected.has(type))

          return (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{category}</h4>
                <button
                  onClick={() => toggleCategory(types)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    allSelected 
                      ? 'bg-indigo-600 text-white' 
                      : someSelected 
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {types.map(type => {
                  const blueprint = blueprintRegistry[type]
                  if (!blueprint) return null

                  return (
                    <label
                      key={type}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selected.has(type)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(type)}
                        onChange={() => toggleType(type)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{blueprint.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{blueprint.description}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{selected.size}</span> card types selected
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || selected.size === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Generate Strategy Cards'}
        </button>
      </div>
    </div>
  )
}