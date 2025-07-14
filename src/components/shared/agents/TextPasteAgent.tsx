'use client'

import React, { useState, useMemo } from 'react'
import { X, FileText, AlertCircle, TestTube } from 'lucide-react'
import { useTextProcessing } from '@/hooks/useTextProcessing'
import { IntelligenceCardCategory } from '@/types/intelligence-cards'
import GroupsSelector from '@/components/intelligence-bank/GroupsSelector'

interface TextPasteAgentProps {
  onClose: () => void
  configuration?: {
    hubContext?: 'intelligence' | 'strategy' | 'development' | 'organisation'
    defaultCategory?: IntelligenceCardCategory
    defaultContentType?: string
  }
}

const CONTENT_TYPES = [
  { value: 'general', label: 'General Text' },
  { value: 'interview', label: 'Interview Transcript' },
  { value: 'meeting', label: 'Meeting Notes' },
  { value: 'research', label: 'Research Document' },
  { value: 'feedback', label: 'User Feedback' }
]

export default function TextPasteAgent({ onClose, configuration }: TextPasteAgentProps) {
  const [textContent, setTextContent] = useState('')
  const [category, setCategory] = useState<IntelligenceCardCategory>(
    configuration?.defaultCategory || IntelligenceCardCategory.MARKET
  )
  const [contentType, setContentType] = useState(
    configuration?.defaultContentType || 'general'
  )
  const [context, setContext] = useState('')
  const [targetGroups, setTargetGroups] = useState<string[]>([])
  
  // Use the text processing hook
  const { processText, isProcessing, error, result, reset } = useTextProcessing()

  // Detect if content looks like an interview
  const isLikelyInterview = useMemo(() => {
    return contentType === 'interview' || 
           textContent.toLowerCase().includes('interviewer') ||
           textContent.toLowerCase().includes('interviewee') ||
           /\b(q:|a:|question:|answer:)/i.test(textContent) ||
           textContent.length > 2000
  }, [textContent, contentType])

  const handleProcess = async () => {
    if (!textContent.trim()) {
      alert('Please enter some text to process')
      return
    }

    try {
      const result = await processText(
        textContent, 
        context || `Processing ${contentType} content for ${category} intelligence`,
        contentType,
        category,
        targetGroups
      )
      
      if (result) {
        // Success feedback with detailed information
        const message = result.isInterview 
          ? `Successfully extracted ${result.cardsCreated} insights from interview transcript!\n${result.minimumCardsMet ? '✅' : '⚠️'} Target: ${result.targetCards} cards\n\nCost: $${result.cost.toFixed(4)}\nTokens used: ${result.tokensUsed}`
          : `Successfully created ${result.cardsCreated} intelligence cards from text!\n\nCost: $${result.cost.toFixed(4)}\nTokens used: ${result.tokensUsed}`
        
        alert(message)
        
        // Clear form after successful processing
        setTextContent('')
        setContext('')
      }
    } catch (err: any) {
      alert(`Processing failed: ${err.message}`)
    }
  }

  const handleClear = () => {
    setTextContent('')
    setContext('')
    reset()
  }

  const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length
  const charCount = textContent.length
  const estimatedCards = isLikelyInterview ? Math.max(10, Math.floor(wordCount / 200)) : Math.max(3, Math.floor(wordCount / 300))

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Agent Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Text & Paste Agent</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Convert text content and transcripts into intelligence cards
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">How it works</h3>
            <p className="text-xs text-blue-700">
              Paste any text content, interview transcripts, meeting notes, or documents. Our AI will analyze 
              the content and extract strategic intelligence based on your selected category.
              {isLikelyInterview && (
                <span className="block mt-1 font-medium">
                  🎬 Interview detected: Will extract 10+ insights for comprehensive analysis.
                </span>
              )}
            </p>
          </div>
          
          {/* Content Type & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IntelligenceCardCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                {Object.values(IntelligenceCardCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Context Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Context (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., Robotics for train maintenance, Customer feedback analysis..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
          </div>
          
          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Content Input
              </label>
              <div className="text-xs text-gray-500">
                {wordCount} words • {charCount} chars
                {estimatedCards > 0 && (
                  <span className="text-green-600 ml-2">
                    • Est. {estimatedCards} cards
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your text content, transcript, or document here..."
              className="w-full h-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
              disabled={isProcessing}
            />
          </div>
          
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add to Groups (Optional)
            </label>
            <GroupsSelector
              selectedGroups={targetGroups}
              onChange={setTargetGroups}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleProcess}
              disabled={!textContent.trim() || isProcessing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <TestTube className="w-4 h-4" />
              {isProcessing ? 'Processing...' : `Process ${isLikelyInterview ? 'Interview' : 'Text'}`}
            </button>
            <button
              onClick={handleClear}
              disabled={isProcessing || !textContent}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
          
          {/* Result Display */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Processing Complete!</h4>
              <div className="space-y-1 text-xs text-green-700">
                <p>Cards created: {result.cardsCreated}</p>
                {result.isInterview && (
                  <p>
                    Interview target: {result.targetCards} cards 
                    {result.minimumCardsMet ? ' ✅ Met' : ' ⚠️ Below target'}
                  </p>
                )}
                <p>Processing type: {result.processingType}</p>
                <p>Tokens used: {result.tokensUsed}</p>
                <p>Cost: ${result.cost.toFixed(4)}</p>
              </div>
            </div>
          )}
          
          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Interview transcripts automatically extract 10+ insights</li>
              <li>• Add context to focus the AI on specific areas of interest</li>
              <li>• Longer, detailed content yields more comprehensive intelligence</li>
              <li>• Use groups to organize related intelligence cards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}