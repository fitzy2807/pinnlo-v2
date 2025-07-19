'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, RotateCcw, Copy } from 'lucide-react'

interface ExecutiveSummaryProps {
  strategyId: number
  blueprintType: string
  cards?: any[]
}

interface SummaryData {
  themes: string[]
  implications: string[]
  nextSteps: string[]
  summary: string
  detected_blueprint?: string
  lastUpdated: string
  cardCount: number
}

export default function ExecutiveSummary({ 
  strategyId, 
  blueprintType, 
  cards = [] 
}: ExecutiveSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(false)

  // Load existing summary on mount
  useEffect(() => {
    loadExistingSummary()
  }, [strategyId, blueprintType])

  const loadExistingSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/executive-summary-load?strategyId=${strategyId}&blueprintType=${blueprintType}`)
      if (response.ok) {
        const data = await response.json()
        if (data.summary) {
          setSummary(data.summary)
        }
      }
    } catch (error) {
      console.error('Failed to load summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSummary = async () => {
    if (cards.length === 0) {
      console.warn('No cards available for summary generation')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId,
          blueprintType,
          cards,
          regenerate: true
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSummary({
            themes: data.themes || [],
            implications: data.implications || [],
            nextSteps: data.nextSteps || [],
            summary: data.summary || '',
            detected_blueprint: data.detected_blueprint,
            lastUpdated: new Date().toISOString(),
            cardCount: cards.length
          })
        } else {
          console.error('Failed to generate summary:', data.error)
        }
      } else {
        console.error('API request failed:', response.status)
      }
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const copySummary = async () => {
    if (!summary) return
    
    const text = `
Executive Summary - ${summary.detected_blueprint || blueprintType}

Key Themes:
${summary.themes.map((theme, i) => `${i + 1}. ${theme}`).join('\n')}

Strategic Implications:
${summary.implications.map((implication, i) => `${i + 1}. ${implication}`).join('\n')}

${summary.nextSteps.length > 0 ? `Next Steps:\n${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` : ''}${summary.summary ? `Overall Summary:\n${summary.summary}` : ''}
    `.trim()
    
    try {
      await navigator.clipboard.writeText(text)
      console.log('Summary copied to clipboard')
    } catch (error) {
      console.error('Failed to copy summary:', error)
    }
  }

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded)
  }

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    generateSummary()
  }

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    copySummary()
  }

  return (
    <div className="mt-8">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-gray-900">Executive Summary</span>
            <span className="text-gray-500">({cards.length} cards)</span>
            {summary && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                AI
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefreshClick}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh Summary"
          >
            <RotateCcw className={`w-3 h-3 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleCopyClick}
            disabled={!summary}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy Summary"
          >
            <Copy className="w-3 h-3 text-gray-600" />
          </button>
          
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && summary && (
        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="space-y-4">
            {/* Detected Blueprint Info */}
            {summary.detected_blueprint && summary.detected_blueprint !== blueprintType && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                AI detected blueprint type: {summary.detected_blueprint}
              </div>
            )}

            {/* Key Themes */}
            {summary.themes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Key Themes</h4>
                <div className="space-y-3">
                  {summary.themes.map((theme, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="bg-white p-3 rounded border text-sm text-gray-700 flex-1">
                        {theme}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Implications */}
            {summary.implications.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Strategic Implications</h4>
                <div className="space-y-3">
                  {summary.implications.map((implication, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="bg-white p-3 rounded border text-sm text-gray-700 flex-1">
                        {implication}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {summary.nextSteps.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recommended Next Steps</h4>
                <div className="space-y-3">
                  {summary.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="bg-white p-3 rounded border text-sm text-gray-700 flex-1">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Summary */}
            {summary.summary && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Strategic Narrative</h4>
                <div className="bg-white p-3 rounded border text-sm text-gray-700">
                  {summary.summary}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isExpanded && !summary && !loading && (
        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          {cards.length === 0 ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">No cards available for summary generation.</p>
              <p className="text-xs text-gray-500">Add some cards to this blueprint to generate an executive summary.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">No executive summary available.</p>
              <button
                onClick={generateSummary}
                disabled={loading}
                className="px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : `Generate Summary (${cards.length} cards)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isExpanded && loading && (
        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2">
            <RotateCcw className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-sm text-gray-600">Generating executive summary...</span>
          </div>
        </div>
      )}
    </div>
  )
}