'use client'

import React, { useState, useEffect } from 'react'
import { FileText, RefreshCw, Copy, Edit2, Check, X } from 'lucide-react'

interface ContextSummaryReviewProps {
  sessionId: string
  blueprintCards: any[]
  intelligenceCards: any[]
  intelligenceGroups?: any[]
  strategyName: string
  contextSummary: string | null
  onSummaryGenerated: (summary: string) => void
  onContinue: () => void
}

export default function ContextSummaryReview({
  sessionId,
  blueprintCards,
  intelligenceCards,
  intelligenceGroups = [],
  strategyName,
  contextSummary,
  onSummaryGenerated,
  onContinue
}: ContextSummaryReviewProps) {
  const [summary, setSummary] = useState(contextSummary || '')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!contextSummary && blueprintCards.length > 0) {
      generateSummary()
    }
  }, [])

  const generateSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/strategy-creator/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          blueprintCards,
          intelligenceCards,
          intelligenceGroups,
          strategyName
        })
      })

      if (!response.ok) throw new Error('Failed to generate summary')

      const { contextSummary, metadata } = await response.json()
      setSummary(contextSummary)
      onSummaryGenerated(contextSummary)
    } catch (error) {
      console.error('Error generating summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    setEditedSummary(summary)
    setEditing(true)
  }

  const handleSave = () => {
    setSummary(editedSummary)
    onSummaryGenerated(editedSummary)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditedSummary('')
    setEditing(false)
  }

  const wordCount = summary.split(/\s+/).filter(Boolean).length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm text-gray-600">Analyzing context and generating summary...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Context Summary
        </h3>
        <p className="text-sm text-gray-600">
          Review the AI-generated summary of your strategic context
        </p>
      </div>

      {/* Metadata Bar */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <span>{wordCount} words</span>
          </div>
          <div>
            <span className="font-medium">{blueprintCards.length}</span> blueprint cards
          </div>
          <div>
            <span className="font-medium">{intelligenceCards.length}</span> intelligence cards
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
          </button>
          <button
            onClick={generateSummary}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Regenerate summary"
          >
            <RefreshCw size={16} />
          </button>
          {!editing && (
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Edit summary"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {editing ? (
          <div>
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Edit the context summary..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{summary}</div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-1">How this summary will be used:</h4>
        <p className="text-sm text-blue-700">
          This context summary will guide the AI in generating new strategy cards that are relevant,
          actionable, and aligned with your existing strategic framework. The AI will reference this
          summary to ensure consistency and coherence in the generated content.
        </p>
      </div>

      {/* Continue Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onContinue}
          disabled={!summary}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Blueprint Selection
        </button>
      </div>
    </div>
  )
}