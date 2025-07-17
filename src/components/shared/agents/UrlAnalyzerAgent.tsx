'use client'

import React, { useState, useMemo } from 'react'
import { X, Link, AlertCircle, CheckCircle, Clock, Info, ExternalLink } from 'lucide-react'
import { useUrlAnalysis } from '@/hooks/useUrlAnalysis'
import { IntelligenceCardCategory } from '@/types/intelligence-cards'
import GroupsSelector from '@/components/intelligence-bank/GroupsSelector'

interface UrlAnalyzerAgentProps {
  onClose: () => void
  configuration?: {
    hubContext?: 'intelligence' | 'strategy' | 'development' | 'organisation'
    defaultCategory?: IntelligenceCardCategory
    onCardsCreated?: () => void
  }
}

// Helper function to get user-friendly error messages
function getErrorMessage(error: string): { title: string; message: string; suggestion?: string } {
  const lowerError = error.toLowerCase()
  
  if (lowerError.includes('rate limit')) {
    return {
      title: 'Rate Limit Exceeded',
      message: 'You\'ve reached the maximum number of URL analyses allowed per hour.',
      suggestion: 'Please wait before analyzing more URLs, or contact support for higher limits.'
    }
  }
  
  if (lowerError.includes('timeout') || lowerError.includes('took too long')) {
    return {
      title: 'Analysis Timeout',
      message: 'The URL analysis took too long to complete.',
      suggestion: 'Try again with a simpler page, or check if the URL is accessible.'
    }
  }
  
  if (lowerError.includes('failed to fetch') || lowerError.includes('network')) {
    return {
      title: 'Network Error',
      message: 'Unable to access the provided URL.',
      suggestion: 'Check that the URL is correct and publicly accessible.'
    }
  }
  
  if (lowerError.includes('insufficient content')) {
    return {
      title: 'Insufficient Content',
      message: 'The webpage doesn\'t contain enough text content for analysis.',
      suggestion: 'Try a different URL with more substantial content.'
    }
  }
  
  if (lowerError.includes('invalid url') || lowerError.includes('malformed')) {
    return {
      title: 'Invalid URL',
      message: 'The URL format is not valid.',
      suggestion: 'Make sure the URL includes the protocol (http:// or https://).'
    }
  }
  
  if (lowerError.includes('local') || lowerError.includes('private')) {
    return {
      title: 'Access Restricted',
      message: 'Cannot analyze localhost or private network URLs for security reasons.',
      suggestion: 'Use a publicly accessible URL instead.'
    }
  }
  
  return {
    title: 'Analysis Failed',
    message: error,
    suggestion: 'Please try again or contact support if the issue persists.'
  }
}

// Helper function to validate URL format and provide guidance
function validateUrlWithGuidance(url: string): { isValid: boolean; message?: string; suggestion?: string } {
  if (!url.trim()) {
    return { isValid: true } // Empty is okay
  }
  
  // Check if URL has protocol
  if (!url.match(/^https?:\/\//i)) {
    return {
      isValid: false,
      message: 'URL must include protocol',
      suggestion: 'Add https:// or http:// to the beginning'
    }
  }
  
  try {
    const urlObj = new URL(url)
    
    // Check for common issues
    if (urlObj.hostname === 'localhost' || urlObj.hostname.startsWith('127.')) {
      return {
        isValid: false,
        message: 'Localhost URLs are not supported',
        suggestion: 'Use a publicly accessible URL instead'
      }
    }
    
    if (urlObj.hostname.startsWith('192.168.') || urlObj.hostname.startsWith('10.')) {
      return {
        isValid: false,
        message: 'Private network URLs are not supported',
        suggestion: 'Use a publicly accessible URL instead'
      }
    }
    
    return { isValid: true }
  } catch {
    return {
      isValid: false,
      message: 'Invalid URL format',
      suggestion: 'Check the URL format and try again'
    }
  }
}

export default function UrlAnalyzerAgent({ onClose, configuration }: UrlAnalyzerAgentProps) {
  const [urlInput, setUrlInput] = useState('')
  const [category, setCategory] = useState<IntelligenceCardCategory>(
    configuration?.defaultCategory || IntelligenceCardCategory.MARKET
  )
  const [context, setContext] = useState('')
  const [targetGroups, setTargetGroups] = useState<string[]>([])
  const [showSuccessDetails, setShowSuccessDetails] = useState(false)
  
  // Use the URL analysis hook
  const { analyzeUrl, isAnalyzing, error, result, reset } = useUrlAnalysis()

  const handleAnalyze = async () => {
    const validation = validateUrlWithGuidance(urlInput)
    if (!validation.isValid) {
      return // Validation errors are shown in the UI
    }

    try {
      const analysisResult = await analyzeUrl(
        urlInput, 
        context || `Analyzing content for ${category} intelligence`,
        category,
        targetGroups
      )
      
      if (analysisResult && analysisResult.cardsCreated > 0) {
        // Show success details
        setShowSuccessDetails(true)
        
        // Call onCardsCreated callback if provided
        if (configuration?.onCardsCreated) {
          configuration.onCardsCreated()
        }
        
        // Auto-hide success details after 10 seconds
        setTimeout(() => setShowSuccessDetails(false), 10000)
      }
    } catch (err: any) {
      // Error is handled by the hook and displayed in the UI
      console.error('URL analysis failed:', err)
    }
  }

  const handleClear = () => {
    setUrlInput('')
    setContext('')
    setShowSuccessDetails(false)
    reset()
  }

  // Enhanced URL validation with guidance
  const urlValidation = useMemo(() => {
    return validateUrlWithGuidance(urlInput)
  }, [urlInput])

  // Get friendly error message
  const errorDetails = useMemo(() => {
    return error ? getErrorMessage(error) : null
  }, [error])

  // Estimate processing time based on URL
  const estimatedTime = useMemo(() => {
    if (!urlInput) return null
    
    try {
      const url = new URL(urlInput.startsWith('http') ? urlInput : `https://${urlInput}`)
      const domain = url.hostname.toLowerCase()
      
      // Estimate based on common site types
      if (domain.includes('wikipedia') || domain.includes('docs.')) {
        return '15-30 seconds'
      } else if (domain.includes('news') || domain.includes('blog')) {
        return '10-20 seconds'
      } else if (domain.includes('pdf') || urlInput.includes('.pdf')) {
        return '20-40 seconds'
      } else {
        return '5-15 seconds'
      }
    } catch {
      return '5-15 seconds'
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
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              How it works
            </h3>
            <p className="text-xs text-blue-700 mb-2">
              Enter a URL to any web page, article, or online resource. Our AI will analyze the content
              and extract relevant intelligence based on your selected category and context.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>• Supports: Articles, blog posts, documentation, news, research papers</p>
              <p>• Rate limit: 10 analyses per hour</p>
              {estimatedTime && <p>• Estimated processing time: {estimatedTime}</p>}
            </div>
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
                    !urlValidation.isValid ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isAnalyzing}
                />
                {!urlValidation.isValid && urlInput && (
                  <div className="mt-1">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {urlValidation.message}
                    </p>
                    {urlValidation.suggestion && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        💡 {urlValidation.suggestion}
                      </p>
                    )}
                  </div>
                )}
                {urlValidation.isValid && urlInput && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    URL format looks good
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
              disabled={!urlInput.trim() || !urlValidation.isValid || isAnalyzing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Analyze URL
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={isAnalyzing}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Clear
            </button>
          </div>
          
          {/* Processing Status */}
          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                <h4 className="text-sm font-medium text-blue-900">Analyzing URL...</h4>
              </div>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Fetching webpage content</p>
                <p>• Extracting text and metadata</p>
                <p>• Processing with AI for insights</p>
                <p>• Creating intelligence cards</p>
              </div>
              {estimatedTime && (
                <p className="text-xs text-blue-600 mt-2">
                  Estimated time: {estimatedTime}
                </p>
              )}
            </div>
          )}
          
          {/* Enhanced Error Display */}
          {errorDetails && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-900 mb-1">
                    {errorDetails.title}
                  </h4>
                  <p className="text-xs text-red-700 mb-2">
                    {errorDetails.message}
                  </p>
                  {errorDetails.suggestion && (
                    <div className="bg-red-100 rounded p-2">
                      <p className="text-xs text-red-800">
                        💡 <strong>Suggestion:</strong> {errorDetails.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Result Display */}
          {result && (showSuccessDetails || result.cardsCreated > 0) && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-900 mb-2">
                    Analysis Complete! 🎉
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs text-green-700 mb-3">
                    <div>
                      <span className="font-medium">Cards created:</span> {result.cardsCreated}
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span> ${result.cost.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium">Tokens used:</span> {result.tokensUsed.toLocaleString()}
                    </div>
                    {result.contentLength && (
                      <div>
                        <span className="font-medium">Content analyzed:</span> {(result.contentLength / 1000).toFixed(1)}K chars
                      </div>
                    )}
                  </div>
                  {result.title && (
                    <div className="bg-green-100 rounded p-2 mb-2">
                      <p className="text-xs text-green-800">
                        <span className="font-medium">Page title:</span> {result.title}
                      </p>
                    </div>
                  )}
                  {result.cached && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Result from cache (faster processing)
                    </p>
                  )}
                  {targetGroups.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Cards added to {targetGroups.length} selected group{targetGroups.length === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Tips */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Tips for best results:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>Best sources:</strong> Articles, blog posts, research papers, documentation</li>
              <li>• <strong>Categories:</strong> Choose the most relevant category for focused analysis</li>
              <li>• <strong>Context:</strong> Add specific focus areas or questions you want answered</li>
              <li>• <strong>Groups:</strong> Organize results by adding cards to intelligence groups</li>
              <li>• <strong>Rate limits:</strong> 10 analyses per hour to ensure quality processing</li>
            </ul>
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Need to analyze a protected page? Try copying the content to our 
                <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">Text/Paste Agent</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}