'use client'

import React, { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface ContextPreviewProps {
  contextSummary: string
  targetSection: string
  selectedCardsCount: number
  onApprove: () => void
  onRegenerate: () => void
  isGenerating: boolean
  preview: string | null
  error?: string | null
  plannedQuantity?: number
}

export default function ContextPreview({
  contextSummary,
  targetSection,
  selectedCardsCount,
  onApprove,
  onRegenerate,
  isGenerating,
  preview,
  error,
  plannedQuantity = 0
}: ContextPreviewProps) {
  const [hasRegenerated, setHasRegenerated] = useState(false)
  
  console.log('ContextPreview render - preview:', preview)
  console.log('ContextPreview render - isGenerating:', isGenerating)
  console.log('ContextPreview render - error:', error)

  const handleRegenerate = () => {
    setHasRegenerated(true)
    onRegenerate()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Context Preview
        </h3>
        <p className="text-xs text-gray-600">
          Review how the AI will interpret your {selectedCardsCount} source cards for generating {targetSection} cards
        </p>
      </div>

      <div className="space-y-4">
        {/* Preview Content */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm text-gray-600">Analyzing context...</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 text-red-600">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Failed to generate preview</p>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          ) : preview ? (
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap">{preview}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <RefreshCw className="w-8 h-8 mb-3" />
              <p className="text-sm">Click "Generate Preview" to see how your context will be interpreted</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            {hasRegenerated && (
              <span className="text-xs text-gray-500">
                Preview regenerated
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating || !preview}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {preview ? 'Regenerate Preview' : 'Generate Preview'}
            </button>
            
            <button
              onClick={onApprove}
              disabled={!preview || isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {plannedQuantity > 0 ? `Approve & Generate ${plannedQuantity} Cards` : 'Approve & Generate'}
            </button>
          </div>
        </div>

        {/* Context Info */}
        {preview && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Source Cards:</span> {selectedCardsCount}
              </div>
              <div>
                <span className="font-medium">Target Type:</span> {targetSection}
              </div>
              <div>
                <span className="font-medium">Cards to Generate:</span> {plannedQuantity || '...'}
              </div>
              <div>
                <span className="font-medium">Context Size:</span> {contextSummary.length} chars
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}