import { useState } from 'react'

interface UrlAnalysisResult {
  success: boolean
  message: string
  cardsCreated: number
  cards: any[]
  tokensUsed: number
  cost: number
  url: string
  title?: string
  description?: string
  contentLength: number
}

interface UrlAnalysisError {
  error: string
  details?: string
}

export function useUrlAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UrlAnalysisResult | null>(null)

  const analyzeUrl = async (
    url: string, 
    context?: string, 
    targetCategory?: string, 
    targetGroups?: string[]
  ): Promise<UrlAnalysisResult | null> => {
    if (!url.trim()) {
      throw new Error('URL is required')
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch (e) {
      throw new Error('Invalid URL format')
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Starting URL analysis...', {
        url,
        context,
        targetCategory,
        targetGroups
      })

      const response = await fetch('/api/intelligence-processing/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          context,
          targetCategory,
          targetGroups
        }),
      })

      if (!response.ok) {
        const errorData: UrlAnalysisError = await response.json()
        throw new Error(errorData.details || errorData.error || 'Analysis failed')
      }

      const analysisResult: UrlAnalysisResult = await response.json()
      
      console.log('✅ URL analysis completed:', {
        cardsCreated: analysisResult.cardsCreated,
        title: analysisResult.title,
        cost: analysisResult.cost
      })

      setResult(analysisResult)
      return analysisResult

    } catch (err: any) {
      console.error('🚨 URL analysis error:', err)
      const errorMessage = err.message || 'Failed to analyze URL'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reset = () => {
    setError(null)
    setResult(null)
    setIsAnalyzing(false)
  }

  return {
    analyzeUrl,
    isAnalyzing,
    error,
    result,
    reset
  }
}