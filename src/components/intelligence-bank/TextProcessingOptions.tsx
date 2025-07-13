/**
 * Text Processing Options Component
 * 
 * Enhanced interface for text processing with target category and groups
 */

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, Plus, Folder, Zap } from 'lucide-react'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'
import { IntelligenceCardCategory } from '@/types/intelligence-cards'

interface TextProcessingOptionsProps {
  contentType: string
  setContentType: (type: string) => void
  targetCategory: string
  setTargetCategory: (category: string) => void
  targetGroups: string[]
  setTargetGroups: (groups: string[]) => void
  context: string
  setContext: (context: string) => void
  textContent: string
  setTextContent: (content: string) => void
  onProcess: () => void
  isProcessing: boolean
  estimatedCards: number
}

const CONTENT_TYPES = [
  { value: 'general', label: 'General Text' },
  { value: 'interview', label: 'Interview Transcript' },
  { value: 'meeting', label: 'Meeting Notes' },
  { value: 'research', label: 'Research Document' },
  { value: 'feedback', label: 'User Feedback' }
]

const TARGET_CATEGORIES = [
  { value: 'market', label: 'Market' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'trends', label: 'Trends' },
  { value: 'technology', label: 'Technology' },
  { value: 'stakeholder', label: 'Stakeholder' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'risk', label: 'Risk' },
  { value: 'opportunities', label: 'Opportunities' }
]

export default function TextProcessingOptions({
  contentType,
  setContentType,
  targetCategory,
  setTargetCategory,
  targetGroups,
  setTargetGroups,
  context,
  setContext,
  textContent,
  setTextContent,
  onProcess,
  isProcessing,
  estimatedCards
}: TextProcessingOptionsProps) {
  const { groups, isLoading: groupsLoading, createGroup } = useIntelligenceGroups()
  const [showNewGroupInput, setShowNewGroupInput] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    
    try {
      const newGroup = await createGroup({
        name: newGroupName,
        description: `Group created for ${contentType} processing`,
        color: '#3B82F6'
      })
      
      if (newGroup) {
        setTargetGroups([...targetGroups, newGroup.id])
      }
      
      setNewGroupName('')
      setShowNewGroupInput(false)
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const toggleGroup = (groupId: string) => {
    if (targetGroups.includes(groupId)) {
      setTargetGroups(targetGroups.filter(id => id !== groupId))
    } else {
      setTargetGroups([...targetGroups, groupId])
    }
  }

  const isInterview = contentType === 'interview'
  const minimumCards = isInterview ? 10 : 3

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Convert transcripts into intelligence cards
        </h3>
        {isInterview && (
          <div className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-sm font-medium">
            🎬 Interview Detected
          </div>
        )}
      </div>

      {/* Processing Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Content Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Content Type
          </label>
          <div className="relative">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
            >
              {CONTENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Target Category */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Target Category
          </label>
          <div className="relative">
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
            >
              {TARGET_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Target Groups */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Add to Groups (Optional)
          </label>
          <div className="space-y-2">
            {/* Existing Groups */}
            {!groupsLoading && groups.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {groups.map(group => (
                  <label key={group.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={targetGroups.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{group.name}</span>
                  </label>
                ))}
              </div>
            )}

            {/* New Group Creation */}
            {!showNewGroupInput ? (
              <button
                onClick={() => setShowNewGroupInput(true)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Group</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                />
                <button
                  onClick={handleCreateGroup}
                  className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowNewGroupInput(false)
                    setNewGroupName('')
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Context */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Additional Context (Optional)
        </label>
        <input
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g., Robotics for train maintenance, Customer feedback on mobile app..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Content Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Content Input
          </label>
          <div className="text-sm text-gray-500">
            {textContent.split(' ').filter(w => w.length > 0).length} words • {textContent.length} chars
          </div>
        </div>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Paste transcript or text content here..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md resize-none"
        />
      </div>

      {/* Process Button and Estimates */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTextContent('')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
          <div className="text-sm text-green-600">
            Est. {estimatedCards} cards
            {isInterview && (
              <span className="text-gray-500"> (Interview: {minimumCards}+ target)</span>
            )}
          </div>
        </div>

        <button
          onClick={onProcess}
          disabled={!textContent.trim() || isProcessing}
          className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Zap className="h-4 w-4" />
          <span>{isProcessing ? 'Processing...' : 'Process Text'}</span>
        </button>
      </div>

      {/* Selected Groups Display */}
      {targetGroups.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Folder className="h-4 w-4" />
            <span>Will add cards to {targetGroups.length} group(s):</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {targetGroups.map(groupId => {
              const group = groups.find(g => g.id === groupId)
              return group ? (
                <span key={groupId} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  {group.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
