'use client'

import React, { useState } from 'react'
import { Link, ExternalLink, FileText, Clock } from 'lucide-react'
import AgentToolTemplate from '../AgentToolTemplate'
import { AgentToolProps } from '../types/agentTools'

export default function URLAnalyzerTool({ 
  selectedHub, 
  selectedSection, 
  selectedCard, 
  onClose, 
  onComplete 
}: AgentToolProps) {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!url.trim()) return

    setIsAnalyzing(true)
    setProgress(0)

    // Simulate analysis progress
    const intervals = [10, 30, 60, 80, 100]
    for (let i = 0; i < intervals.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setProgress(intervals[i])
    }

    // Mock results
    setResults({
      title: "Sample Article Title from URL",
      description: "This is a sample description extracted from the analyzed URL. It would contain the main content summary.",
      wordCount: 1250,
      readingTime: "5 min read",
      keyTopics: ["Strategy", "Innovation", "Technology", "Business Growth"],
      extractedContent: "This is the main content extracted from the URL. In a real implementation, this would be the actual content from the webpage that could be used to generate cards or insights.",
      metadata: {
        domain: new URL(url).hostname,
        analyzedAt: new Date().toISOString(),
        contentType: "article"
      }
    })

    setIsAnalyzing(false)
  }

  const handleCreateCard = () => {
    if (results && onComplete) {
      onComplete({
        type: 'cards',
        data: [{
          title: results.title,
          description: results.description,
          content: results.extractedContent,
          cardType: selectedSection || 'strategic-context',
          source: url,
          tags: results.keyTopics
        }],
        metadata: {
          source: 'url-analyzer',
          timestamp: new Date().toISOString(),
          context: `${selectedHub}/${selectedSection}`
        }
      })
    }
    onClose()
  }

  return (
    <AgentToolTemplate
      title="URL Analyzer"
      description="Analyze web content and extract insights for card creation"
      icon={Link}
      color="green"
      isLoading={isAnalyzing}
      progress={progress}
      actions={results ? {
        primary: {
          label: "Create Card from Content",
          onClick: handleCreateCard
        },
        secondary: {
          label: "Analyze Another URL",
          onClick: () => {
            setResults(null)
            setUrl('')
            setProgress(0)
          }
        }
      } : undefined}
    >
      {!results ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAnalyzing}
              />
              <button
                onClick={handleAnalyze}
                disabled={!url.trim() || isAnalyzing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Analyze
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What this tool does:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Extracts title, content, and key information from web pages</li>
              <li>• Identifies main topics and themes</li>
              <li>• Generates structured data for card creation</li>
              <li>• Provides content summaries and insights</li>
            </ul>
          </div>

          {selectedCard && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Current Context:</h3>
              <p className="text-sm text-gray-600">
                Hub: <span className="font-medium">{selectedHub}</span> • 
                Section: <span className="font-medium">{selectedSection}</span>
              </p>
              {selectedCard && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected Card: <span className="font-medium">{selectedCard.title}</span>
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analysis Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{results.title}</h3>
              <ExternalLink 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={() => window.open(url, '_blank')}
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">{results.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>{results.wordCount} words</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{results.readingTime}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Key Topics:</h4>
              <div className="flex flex-wrap gap-2">
                {results.keyTopics.map((topic: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Extracted Content:</h4>
              <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 max-h-40 overflow-y-auto">
                {results.extractedContent}
              </div>
            </div>
          </div>
        </div>
      )}
    </AgentToolTemplate>
  )
}