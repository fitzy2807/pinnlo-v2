import { useState, useCallback, useEffect, useRef } from 'react'
import { debounce } from '../utils/debounce'

export interface AISuggestion {
  id: string
  text: string
  type: 'template' | 'completion' | 'enhancement' | 'correction'
  confidence: number
  context?: string
  metadata?: Record<string, any>
}

interface UseAISuggestionsOptions {
  fieldType: string
  cardType?: string
  context?: string
  debounceMs?: number
  maxSuggestions?: number
  minConfidence?: number
  enableLearning?: boolean
}

interface SuggestionRequest {
  input: string
  fieldType: string
  cardType?: string
  context?: string
  cursorPosition?: number
  userHistory?: string[]
}

export function useAISuggestions(options: UseAISuggestionsOptions) {
  const {
    fieldType,
    cardType,
    context,
    debounceMs = 300,
    maxSuggestions = 5,
    minConfidence = 0.3,
    enableLearning = true
  } = options

  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const userHistoryRef = useRef<string[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const suggestionCacheRef = useRef<Map<string, AISuggestion[]>>(new Map())

  // Learn from user selections to improve future suggestions
  const learnFromSelection = useCallback((selectedSuggestion: AISuggestion, input: string) => {
    if (!enableLearning) return

    // Store user pattern for future learning
    const pattern = {
      input: input.toLowerCase().trim(),
      selection: selectedSuggestion.text,
      fieldType,
      cardType,
      timestamp: Date.now()
    }

    // Update user history (keep last 50 patterns)
    userHistoryRef.current = [pattern.input, ...userHistoryRef.current].slice(0, 50)

    // Store in localStorage for persistence
    try {
      const existingPatterns = JSON.parse(
        localStorage.getItem('ai-suggestions-patterns') || '[]'
      )
      const updatedPatterns = [pattern, ...existingPatterns].slice(0, 200)
      localStorage.setItem('ai-suggestions-patterns', JSON.stringify(updatedPatterns))
    } catch (error) {
      console.warn('Failed to store AI learning pattern:', error)
    }
  }, [fieldType, cardType, enableLearning])

  // Load user patterns on mount
  useEffect(() => {
    if (!enableLearning) return

    try {
      const patterns = JSON.parse(
        localStorage.getItem('ai-suggestions-patterns') || '[]'
      )
      userHistoryRef.current = patterns
        .filter((p: any) => p.fieldType === fieldType && p.cardType === cardType)
        .map((p: any) => p.input)
        .slice(0, 50)
    } catch (error) {
      console.warn('Failed to load AI learning patterns:', error)
    }
  }, [fieldType, cardType, enableLearning])

  // Generate local suggestions based on patterns and templates
  const generateLocalSuggestions = useCallback((input: string): AISuggestion[] => {
    const suggestions: AISuggestion[] = []
    const inputLower = input.toLowerCase().trim()

    // Template suggestions for common field types
    const templates = getFieldTemplates(fieldType, cardType)
    templates.forEach((template, index) => {
      if (template.toLowerCase().includes(inputLower) || inputLower.length < 3) {
        suggestions.push({
          id: `template-${index}`,
          text: template,
          type: 'template',
          confidence: 0.8,
          context: 'Common template'
        })
      }
    })

    // Pattern-based suggestions from user history
    const historicalMatches = userHistoryRef.current
      .filter(pattern => 
        pattern.includes(inputLower) || 
        levenshteinDistance(pattern, inputLower) <= 2
      )
      .slice(0, 3)

    historicalMatches.forEach((pattern, index) => {
      suggestions.push({
        id: `history-${index}`,
        text: pattern,
        type: 'completion',
        confidence: 0.7,
        context: 'Based on your history'
      })
    })

    // Auto-completion suggestions
    if (inputLower.length >= 2) {
      const completions = generateCompletions(inputLower, fieldType)
      completions.forEach((completion, index) => {
        suggestions.push({
          id: `completion-${index}`,
          text: completion,
          type: 'completion',
          confidence: 0.6,
          context: 'Auto-completion'
        })
      })
    }

    return suggestions
      .filter(s => s.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxSuggestions)
  }, [fieldType, cardType, minConfidence, maxSuggestions])

  // Fetch AI-powered suggestions from API
  const fetchAISuggestions = useCallback(async (request: SuggestionRequest): Promise<AISuggestion[]> => {
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortControllerRef.current?.signal
      })

      if (!response.ok) {
        throw new Error(`AI suggestions failed: ${response.status}`)
      }

      const data = await response.json()
      return data.suggestions || []
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return []
      }
      console.warn('AI suggestions API failed:', error)
      return []
    }
  }, [])

  // Main suggestion generation function
  const getSuggestions = useCallback(async (
    input: string, 
    cursorPosition?: number
  ): Promise<AISuggestion[]> => {
    if (!input.trim()) {
      setSuggestions([])
      return []
    }

    // Check cache first
    const cacheKey = `${input}-${fieldType}-${cardType}`
    const cached = suggestionCacheRef.current.get(cacheKey)
    if (cached) {
      setSuggestions(cached)
      return cached
    }

    setIsLoading(true)
    setError(null)

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      // Generate local suggestions immediately
      const localSuggestions = generateLocalSuggestions(input)
      setSuggestions(localSuggestions)

      // Fetch AI suggestions in background
      const aiSuggestions = await fetchAISuggestions({
        input,
        fieldType,
        cardType,
        context,
        cursorPosition,
        userHistory: userHistoryRef.current
      })

      // Merge and deduplicate suggestions
      const allSuggestions = [...localSuggestions, ...aiSuggestions]
      const uniqueSuggestions = deduplicateSuggestions(allSuggestions)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxSuggestions)

      // Cache results
      suggestionCacheRef.current.set(cacheKey, uniqueSuggestions)
      setSuggestions(uniqueSuggestions)

      return uniqueSuggestions
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setError('Failed to get suggestions')
        console.error('Suggestion error:', error)
      }
      return []
    } finally {
      setIsLoading(false)
    }
  }, [fieldType, cardType, context, maxSuggestions, generateLocalSuggestions, fetchAISuggestions])

  // Debounced version for real-time suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(getSuggestions, debounceMs),
    [getSuggestions, debounceMs]
  )

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setError(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions: debouncedGetSuggestions,
    clearSuggestions,
    learnFromSelection
  }
}

// Helper functions

function getFieldTemplates(fieldType: string, cardType?: string): string[] {
  const templates: Record<string, string[]> = {
    title: [
      'Feature Implementation',
      'Bug Fix',
      'Performance Optimization',
      'Security Enhancement',
      'User Experience Improvement'
    ],
    description: [
      'This feature will enable users to...',
      'The goal is to improve...',
      'Implementation involves...',
      'Expected outcome is...',
      'Success criteria include...'
    ],
    requirements: [
      'Functional Requirements:\n- \n\nNon-functional Requirements:\n- ',
      'User Story: As a [user], I want [goal] so that [benefit]',
      'Acceptance Criteria:\n- Given [context]\n- When [action]\n- Then [outcome]'
    ],
    implementation: [
      '1. Design Phase\n2. Development Phase\n3. Testing Phase\n4. Deployment Phase',
      'Frontend: \nBackend: \nDatabase: \nIntegrations: ',
      'Architecture:\nComponents:\nAPI Endpoints:\nData Models:'
    ],
    testing: [
      'Unit Tests:\nIntegration Tests:\nE2E Tests:\nPerformance Tests:',
      'Test Scenarios:\n1. Happy path\n2. Edge cases\n3. Error conditions',
      'QA Checklist:\n- Functionality\n- Usability\n- Performance\n- Security'
    ]
  }

  return templates[fieldType] || templates['description'] || []
}

function generateCompletions(input: string, fieldType: string): string[] {
  const completions: string[] = []
  
  // Common programming/business completions
  const commonWords = [
    'implement', 'integrate', 'optimize', 'enhance', 'refactor',
    'develop', 'design', 'test', 'deploy', 'monitor',
    'user', 'system', 'performance', 'security', 'functionality'
  ]

  commonWords.forEach(word => {
    if (word.startsWith(input.toLowerCase()) && word !== input.toLowerCase()) {
      completions.push(word.charAt(0).toUpperCase() + word.slice(1))
    }
  })

  return completions.slice(0, 3)
}

function deduplicateSuggestions(suggestions: AISuggestion[]): AISuggestion[] {
  const seen = new Set<string>()
  return suggestions.filter(suggestion => {
    const key = suggestion.text.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}