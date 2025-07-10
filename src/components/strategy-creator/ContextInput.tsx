'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { StrategyCreatorContext } from '@/types/strategy-creator'

interface ContextInputProps {
  context: StrategyCreatorContext
  onSubmit: (context: StrategyCreatorContext) => void
}

export default function ContextInput({ context, onSubmit }: ContextInputProps) {
  const [formData, setFormData] = useState<StrategyCreatorContext>(context)
  const [newGoal, setNewGoal] = useState('')
  const [newChallenge, setNewChallenge] = useState('')
  const [newConstraint, setNewConstraint] = useState('')

  const handleAddItem = (type: 'goals' | 'challenges' | 'constraints', value: string) => {
    if (!value.trim()) return
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }))

    // Clear the input
    if (type === 'goals') setNewGoal('')
    if (type === 'challenges') setNewChallenge('')
    if (type === 'constraints') setNewConstraint('')
  }

  const handleRemoveItem = (type: 'goals' | 'challenges' | 'constraints', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.businessContext.trim()) {
      alert('Please provide a business context')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Context */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Context
        </label>
        <textarea
          value={formData.businessContext}
          onChange={(e) => setFormData(prev => ({ ...prev, businessContext: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          rows={4}
          placeholder="Describe your business, market, and strategic situation..."
          required
        />
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Strategic Goals
        </label>
        <div className="space-y-2">
          {formData.goals.map((goal, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="flex-1 text-sm">{goal}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem('goals', index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('goals', newGoal))}
              placeholder="Add a strategic goal..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleAddItem('goals', newGoal)}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Key Challenges
        </label>
        <div className="space-y-2">
          {formData.challenges.map((challenge, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="flex-1 text-sm">{challenge}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem('challenges', index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newChallenge}
              onChange={(e) => setNewChallenge(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('challenges', newChallenge))}
              placeholder="Add a key challenge..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleAddItem('challenges', newChallenge)}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Constraints */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Constraints & Limitations
        </label>
        <div className="space-y-2">
          {formData.constraints.map((constraint, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="flex-1 text-sm">{constraint}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem('constraints', index)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem('constraints', newConstraint))}
              placeholder="Add a constraint or limitation..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => handleAddItem('constraints', newConstraint)}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
        >
          Continue to Card Selection
        </button>
      </div>
    </form>
  )
}