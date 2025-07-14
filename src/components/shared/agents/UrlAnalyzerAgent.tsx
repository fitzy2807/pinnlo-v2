'use client'

import React, { useState, useMemo } from 'react'
import { X, Link, AlertCircle } from 'lucide-react'
import { useUrlAnalysis } from '@/hooks/useUrlAnalysis'
import { IntelligenceCardCategory } from '@/types/intelligence-cards'
import GroupsSelector from '@/components/intelligence-bank/GroupsSelector'

interface UrlAnalyzerAgentProps {
  onClose: () => void
  configuration?: {
    hubContext?: 'intelligence' | 'strategy' | 'development' | 'organisation'
    defaultCategory?: IntelligenceCardCategory
  }
}

export default function UrlAnalyzerAgent({ onClose, configuration }: UrlAnalyzerAgentProps) {
  const [urlInput, setUrlInput] = useState('')
  const [category, setCategory] = useState<IntelligenceCardCategory>(
    configuration?.defaultCategory || IntelligenceCardCategory.MARKET
  )
  const [context, setContext] = useState('')
  const [targetGroups, setTargetGroups] = useState<string[]>([])
  
  // Use the URL analysis hook
  const { analyzeUrl, isAnalyzing, error, result, reset } = useUrlAnalysis()

  const handleAnalyze = async () => {
    if (!urlInput.trim()) {
      alert('Please enter a URL to analyze')
      return
    }

    try {
      const result = await analyzeUrl(
        urlInput, 
        context || `Analyzing content for ${category} intelligence`,
        category,
        targetGroups
      )
      
      if (result) {
        // Success feedback
        alert(`Successfully created ${result.cardsCreated} intelligence cards from URL!\n\nTitle: ${result.title || 'N/A'}\nCost: $${result.cost.toFixed(4)}\nTokens used: ${result.tokensUsed}`)
        
        // Clear form after successful processing
        setUrlInput('')
        setContext('')
      }
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`)
    }
  }

  const handleClear = () => {
    setUrlInput('')
    setContext('')
    reset()
  }

  // Basic URL validation
  const isValidUrl = useMemo(() => {
    if (!urlInput) return true // Don't show error for empty input
    try {
      new URL(urlInput)
      return true
    } catch {
      return false
    }
  }, [urlInput])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Agent Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-lg font-medium text-gray-900">URL Analyzer Agent</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Extract intelligence from web pages and online content
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
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">How it works</h3>
            <p className="text-xs text-blue-700">
              Enter a URL to any web page, article, or online resource. Our AI will analyze the content
              and extract relevant intelligence based on your selected category and context.
            </p>
          </div>
          
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL to Analyze
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  className={`w-full px-3 py-2 text-sm text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !isValidUrl ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isAnalyzing}
                />
                {!isValidUrl && urlInput && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Please enter a valid URL
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IntelligenceCardCategory)}
              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAnalyzing}
            >
              {Object.values(IntelligenceCardCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Context Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Context (Optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any specific focus areas or context for the analysis..."
              className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isAnalyzing}
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
              onClick={handleAnalyze}
              disabled={!urlInput.trim() || !isValidUrl || isAnalyzing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Link className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze URL'}
            </button>
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {/* Result Display */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">Analysis Complete!</h4>
              <div className="space-y-1 text-xs text-green-700">
                <p>Cards created: {result.cardsCreated}</p>
                <p>Tokens used: {result.tokensUsed}</p>
                <p>Cost: ${result.cost.toFixed(4)}</p>
                {result.title && <p>Page title: {result.title}</p>}
              </div>
            </div>
          )}
          
          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Tips:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Works best with articles, blog posts, and documentation</li>
              <li>• The AI will extract key insights based on your selected category</li>
              <li>• Add context to focus the analysis on specific aspects</li>
              <li>• Group assignment helps organize your intelligence cards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}