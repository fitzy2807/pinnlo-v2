import { useState } from 'react'

interface TextProcessingResult {
  success: boolean
  message: string
  cardsCreated: number
  cards: any[]
  tokensUsed: number
  cost: number
  textLength: number
  processingType: string
  isInterview: boolean
  minimumCardsMet: boolean
  targetCards: number
}

interface TextProcessingError {
  error: string
  details?: string
}

export function useTextProcessing() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TextProcessingResult | null>(null)

  const processText = async (text: string, context?: string, type?: string, targetCategory?: string, targetGroups?: string[]): Promise<TextProcessingResult | null> => {
    if (!text.trim()) {
      throw new Error('Text content is required')
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Starting text processing...', {
        textLength: text.length,
        context,
        type,
        targetCategory,
        targetGroups
      })

      const response = await fetch('/api/intelligence-processing/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          context,
          type,
          targetCategory,
          targetGroups
        }),
      })

      if (!response.ok) {
        const errorData: TextProcessingError = await response.json()
        throw new Error(errorData.details || errorData.error || 'Processing failed')
      }

      const processingResult: TextProcessingResult = await response.json()
      
      console.log('✅ Text processing completed:', {
        cardsCreated: processingResult.cardsCreated,
        isInterview: processingResult.isInterview,
        minimumCardsMet: processingResult.minimumCardsMet,
        cost: processingResult.cost
      })

      setResult(processingResult)
      return processingResult

    } catch (err: any) {
      console.error('🚨 Text processing error:', err)
      const errorMessage = err.message || 'Failed to process text'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = () => {
    setError(null)
    setResult(null)
    setIsProcessing(false)
  }

  return {
    processText,
    isProcessing,
    error,
    result,
    reset
  }
}
