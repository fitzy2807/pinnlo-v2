/**
 * Automation Rule Editor
 * 
 * Modal for creating/editing automation rules
 */

'use client'

import React, { useState, useEffect } from 'react'
import { X, Info } from 'lucide-react'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'

interface AutomationRuleEditorProps {
  rule?: any
  onSave: (data: any) => void
  onCancel: () => void
}

const INTELLIGENCE_CATEGORIES = [
  { id: 'market', name: 'Market' },
  { id: 'competitor', name: 'Competitor' },
  { id: 'consumer', name: 'Consumer' },
  { id: 'technology', name: 'Technology' },
  { id: 'trends', name: 'Trends' },
  { id: 'stakeholder', name: 'Stakeholder' },
  { id: 'risk', name: 'Risk' },
  { id: 'opportunities', name: 'Opportunities' }
]

const SCHEDULE_OPTIONS = [
  { value: 'hourly', label: 'Every Hour' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' }
]

const OPTIMIZATION_LEVELS = [
  { 
    value: 'maximum_quality', 
    label: 'Maximum Quality',
    description: 'Best results, uses more tokens'
  },
  { 
    value: 'balanced', 
    label: 'Balanced',
    description: 'Good quality with moderate token usage'
  },
  { 
    value: 'maximum_savings', 
    label: 'Maximum Savings',
    description: 'Minimal token usage, basic quality'
  }
]

export default function AutomationRuleEditor({ rule, onSave, onCancel }: AutomationRuleEditorProps) {
  const { groups } = useIntelligenceGroups()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    enabled: true,
    automation_enabled: true,
    schedule_frequency: 'daily',
    intelligence_categories: [] as string[],
    target_groups: [] as string[],
    optimization_level: 'balanced',
    max_cards_per_run: 10
  })

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        system_prompt: rule.system_prompt || '',
        enabled: rule.enabled ?? true,
        automation_enabled: rule.automation_enabled ?? true,
        schedule_frequency: rule.schedule_frequency || 'daily',
        intelligence_categories: rule.intelligence_categories || [],
        target_groups: rule.target_groups || [],
        optimization_level: rule.optimization_level || 'balanced',
        max_cards_per_run: rule.max_cards_per_run || 10
      })
    }
  }, [rule])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a rule name')
      return
    }
    
    if (formData.intelligence_categories.length === 0) {
      alert('Please select at least one intelligence category')
      return
    }
    
    onSave(formData)
  }

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      intelligence_categories: prev.intelligence_categories.includes(categoryId)
        ? prev.intelligence_categories.filter(id => id !== categoryId)
        : [...prev.intelligence_categories, categoryId]
    }))
  }

  const toggleGroup = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      target_groups: prev.target_groups.includes(groupId)
        ? prev.target_groups.filter(id => id !== groupId)
        : [...prev.target_groups, groupId]
    }))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
                </h3>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Rule Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., Daily Market Intelligence"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={2}
                    placeholder="Describe what this rule does..."
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Prompt
                  </label>
                  <div className="mb-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Info className="w-3 h-3" />
                      <span>This prompt will guide the AI when generating intelligence cards</span>
                    </div>
                  </div>
                  <textarea
                    value={formData.system_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono text-sm"
                    rows={4}
                    placeholder="You are a strategic intelligence analyst. Focus on extracting actionable insights about market trends, competitive positioning, and emerging opportunities. Analyze content with a focus on strategic implications for business decision-making..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This system prompt will be used by the AI to understand the context and focus for intelligence generation. Be specific about what kind of insights you want.
                  </p>
                </div>

                {/* Schedule Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Frequency
                  </label>
                  <select
                    value={formData.schedule_frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule_frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    {SCHEDULE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Intelligence Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intelligence Categories
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {INTELLIGENCE_CATEGORIES.map(category => (
                      <label
                        key={category.id}
                        className="relative flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.intelligence_categories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Target Groups */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Groups (Optional)
                  </label>
                  {groups.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No intelligence groups available</p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                      {groups.map(group => (
                        <label
                          key={group.id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.target_groups.includes(group.id)}
                            onChange={() => toggleGroup(group.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{group.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Optimization Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Optimization Level
                  </label>
                  <div className="space-y-2">
                    {OPTIMIZATION_LEVELS.map(level => (
                      <label
                        key={level.value}
                        className={`relative flex items-start space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${
                          formData.optimization_level === level.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="optimization_level"
                          value={level.value}
                          checked={formData.optimization_level === level.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, optimization_level: e.target.value }))}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{level.label}</div>
                          <div className="text-xs text-gray-500">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Cards Per Run */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Cards Per Run
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.max_cards_per_run}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_cards_per_run: parseInt(e.target.value) || 10 }))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                    <span className="text-sm text-gray-500">cards</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Limit the number of cards generated in each automated run
                  </p>
                </div>

                {/* Enable Automation */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    id="automation_enabled"
                    checked={formData.automation_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, automation_enabled: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="automation_enabled" className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900">Enable Automation</div>
                    <div className="text-xs text-gray-500">
                      Automatically run this rule according to the schedule
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {rule ? 'Update Rule' : 'Create Rule'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}