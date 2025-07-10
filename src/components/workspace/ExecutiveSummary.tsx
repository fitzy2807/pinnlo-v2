'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, RotateCcw, Copy } from 'lucide-react'

interface ExecutiveSummaryProps {
  strategyId: number
  blueprintId: string
  cards?: any[]
}

interface SummaryData {
  themes: string[]
  implications: string[]
  lastUpdated: string
  cardCount: number
}

export default function ExecutiveSummary({ 
  strategyId, 
  blueprintId, 
  cards = [] 
}: ExecutiveSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(false)

  // Load existing summary on mount
  useEffect(() => {
    loadExistingSummary()
  }, [strategyId, blueprintId])

  const loadExistingSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/executive-summary-load?strategyId=${strategyId}&blueprintId=${blueprintId}`)
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
    try {
      setLoading(true)
      const response = await fetch('/api/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId,
          blueprintId,
          cards,
          regenerate: true
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSummary({
          themes: data.themes || [],
          implications: data.implications || [],
          lastUpdated: new Date().toISOString(),
          cardCount: cards.length
        })
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
Executive Summary - ${blueprintId}

Key Themes:
${summary.themes.map((theme, i) => `${i + 1}. ${theme}`).join('\n')}

Strategic Implications:
${summary.implications.map((implication, i) => `${i + 1}. ${implication}`).join('\n')}
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
          {/* Key Themes */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Key Themes</h4>
              <div className="space-y-3">
                {summary.themes.map((theme, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="bg-white p-2 rounded border text-xs text-gray-700 flex-1">
                      {theme}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Implications */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Strategic Implications</h4>
              <div className="space-y-3">
                {summary.implications.map((implication, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="bg-white p-2 rounded border text-xs text-gray-700 flex-1">
                      {implication}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {isExpanded && !summary && !loading && (
        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-600">No executive summary available.</p>
          <button
            onClick={generateSummary}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Generate Summary
          </button>
        </div>
      )}
    </div>
  )
}