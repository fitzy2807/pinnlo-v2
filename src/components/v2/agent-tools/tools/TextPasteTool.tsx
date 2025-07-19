'use client'

import React, { useState } from 'react'
import { FileText, Clipboard, BarChart3, Hash } from 'lucide-react'
import AgentToolTemplate from '../AgentToolTemplate'
import { AgentToolProps } from '../types/agentTools'

export default function TextPasteTool({ 
  selectedHub, 
  selectedSection, 
  selectedCard, 
  onClose, 
  onComplete 
}: AgentToolProps) {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysis, setAnalysis] = useState<any>(null)

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      setText(clipboardText)
    } catch (err) {
      console.error('Failed to read clipboard:', err)
    }
  }

  const handleAnalyze = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)
    setProgress(0)

    // Simulate analysis progress
    const intervals = [20, 40, 60, 80, 100]
    for (let i = 0; i < intervals.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setProgress(intervals[i])
    }

    // Mock analysis results
    const wordCount = text.split(/\s+/).length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    
    // Mock keyword extraction (in real implementation, this would use NLP)
    const keywords = ["strategy", "business", "innovation", "growth", "market", "customer", "value"]
      .filter(() => Math.random() > 0.5)
      .slice(0, 5)

    // Mock sentiment analysis
    const sentiment = Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative'
    
    setAnalysis({
      statistics: {
        wordCount,
        sentences,
        paragraphs,
        characters: text.length,
        avgWordsPerSentence: Math.round(wordCount / sentences)
      },
      keywords,
      sentiment,
      suggestedCardTypes: [
        selectedSection || 'strategicContext',
        'vision',
        'valuePropositions'
      ].slice(0, 3),
      insights: [
        "Content appears to be strategic in nature",
        "Contains actionable business concepts",
        "Suitable for card generation",
        "High information density"
      ]
    })

    setIsAnalyzing(false)
  }

  const handleCreateCards = () => {
    if (analysis && onComplete) {
      // Split text into logical chunks for multiple cards
      const chunks = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
      
      const cards = chunks.slice(0, 3).map((chunk, index) => ({
        title: `Generated Card ${index + 1}`,
        description: chunk.slice(0, 200) + (chunk.length > 200 ? '...' : ''),
        content: chunk,
        cardType: analysis.suggestedCardTypes[index] || selectedSection || 'strategicContext',
        tags: analysis.keywords
      }))

      onComplete({
        type: 'cards',
        data: cards,
        metadata: {
          source: 'text-paste-analyzer',
          timestamp: new Date().toISOString(),
          context: `${selectedHub}/${selectedSection}`,
          analysis: analysis
        }
      })
    }
    onClose()
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <AgentToolTemplate
      title="Text & Paste Analyzer"
      description="Analyze text content and generate structured insights"
      icon={FileText}
      color="purple"
      isLoading={isAnalyzing}
      progress={progress}
      actions={analysis ? {
        primary: {
          label: "Create Cards from Analysis",
          onClick: handleCreateCards
        },
        secondary: {
          label: "Analyze New Text",
          onClick: () => {
            setAnalysis(null)
            setText('')
            setProgress(0)
          }
        }
      } : undefined}
    >
      {!analysis ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Text Content
              </label>
              <button
                onClick={handlePasteFromClipboard}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Clipboard className="w-3 h-3" />
                <span>Paste from Clipboard</span>
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text content here for analysis..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={isAnalyzing}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {text.length} characters, ~{text.split(/\s+/).filter(w => w.length > 0).length} words
              </span>
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Analyze Text
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Analysis Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Text statistics and readability metrics</li>
              <li>• Keyword and topic extraction</li>
              <li>• Sentiment analysis</li>
              <li>• Suggested card types and structures</li>
              <li>• Automatic content chunking for multiple cards</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Text Statistics</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Words:</span>
                <span className="font-medium ml-2">{analysis.statistics.wordCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Sentences:</span>
                <span className="font-medium ml-2">{analysis.statistics.sentences}</span>
              </div>
              <div>
                <span className="text-gray-600">Paragraphs:</span>
                <span className="font-medium ml-2">{analysis.statistics.paragraphs}</span>
              </div>
              <div>
                <span className="text-gray-600">Avg words/sentence:</span>
                <span className="font-medium ml-2">{analysis.statistics.avgWordsPerSentence}</span>
              </div>
            </div>
          </div>

          {/* Keywords and Sentiment */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>Key Analysis</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Sentiment:</h4>
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${getSentimentColor(analysis.sentiment)}`}>
                  {analysis.sentiment}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Suggested Card Types:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedCardTypes.map((type: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Generated Insights:</h3>
            <ul className="space-y-2">
              {analysis.insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                  <span className="text-purple-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AgentToolTemplate>
  )
}