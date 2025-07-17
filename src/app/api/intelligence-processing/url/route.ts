import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

// Simple in-memory cache for URL analysis results
const urlAnalysisCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// Rate limiting
const userRequestTracker = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_REQUESTS = 10 // 10 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

/**
 * Generate cache key for URL analysis
 */
function generateCacheKey(url: string, context: string, targetCategory: string): string {
  // Normalize URL and create deterministic cache key
  try {
    const normalizedUrl = new URL(url).toString().toLowerCase()
    const contextHash = (context || '').toLowerCase().replace(/\s+/g, ' ').trim()
    const categoryHash = (targetCategory || '').toLowerCase()
    return `${normalizedUrl}:${contextHash}:${categoryHash}`
  } catch {
    return `${url}:${context || ''}:${targetCategory || ''}`
  }
}

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userRecord = userRequestTracker.get(userId)
  
  if (!userRecord || now > userRecord.resetTime) {
    // Reset or create new tracking record
    userRequestTracker.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (userRecord.count >= RATE_LIMIT_REQUESTS) {
    return false // Rate limit exceeded
  }
  
  userRecord.count++
  return true
}

/**
 * Get cached analysis result
 */
function getCachedResult(cacheKey: string): any | null {
  const cached = urlAnalysisCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  // Remove expired cache entry
  if (cached) {
    urlAnalysisCache.delete(cacheKey)
  }
  
  return null
}

/**
 * Cache analysis result
 */
function setCachedResult(cacheKey: string, data: any): void {
  urlAnalysisCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
  
  // Cleanup old cache entries if cache gets too large
  if (urlAnalysisCache.size > 100) {
    const entries = Array.from(urlAnalysisCache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest 20 entries
    for (let i = 0; i < 20; i++) {
      urlAnalysisCache.delete(entries[i][0])
    }
  }
}

/**
 * Process URL into intelligence cards using AI
 * POST /api/intelligence-processing/url
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = createClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: `Maximum ${RATE_LIMIT_REQUESTS} URL analyses per hour allowed` 
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { url, context, targetCategory, targetGroups } = body

    if (!url || !url.trim()) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Enhanced URL validation
    let normalizedUrl: string
    try {
      // Add protocol if missing
      let testUrl = url
      if (!testUrl.match(/^https?:\/\//i)) {
        testUrl = 'https://' + testUrl
      }
      
      const urlObj = new URL(testUrl)
      
      // Security checks
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are allowed')
      }
      
      // Block localhost and private IPs
      const hostname = urlObj.hostname.toLowerCase()
      if (hostname === 'localhost' || 
          hostname.startsWith('127.') || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
        throw new Error('Access to local/private networks is not allowed')
      }
      
      normalizedUrl = urlObj.toString()
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Invalid URL format', details: e.message },
        { status: 400 }
      )
    }

    console.log(`🔍 URL analysis request from user ${user.id}`)
    console.log(`🌐 URL: ${normalizedUrl}`)
    console.log(`🎯 Context: ${context || 'None'}`)
    console.log(`📋 Target Category: ${targetCategory || 'General'}`)

    // Check cache first
    const cacheKey = generateCacheKey(normalizedUrl, context || '', targetCategory || '')
    const cachedResult = getCachedResult(cacheKey)
    
    if (cachedResult) {
      console.log('📋 Returning cached result for URL analysis')
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        message: cachedResult.message + ' (cached result)'
      })
    }

    // Call MCP server with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
    
    let mcpResponse: Response
    try {
      mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/api/tools/analyze_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN}`
        },
        body: JSON.stringify({
          url: normalizedUrl,
          context,
          targetCategory,
          targetGroups,
          userId: user.id
        }),
        signal: controller.signal
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout', message: 'URL analysis took too long to complete' },
          { status: 408 }
        )
      }
      throw fetchError
    } finally {
      clearTimeout(timeoutId)
    }

    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text()
      console.error('MCP server error:', errorText)
      return NextResponse.json(
        { 
          error: 'Analysis service error',
          message: 'Failed to analyze URL. Please try again or contact support.',
          details: process.env.NODE_ENV === 'development' ? errorText : undefined
        },
        { status: mcpResponse.status === 429 ? 429 : 500 }
      )
    }

    const mcpResult = await mcpResponse.json()
    console.log('📡 MCP Response received')

    // Parse MCP response
    let parsedResult: any
    try {
      parsedResult = JSON.parse(mcpResult.content[0].text)
    } catch (parseError) {
      console.error('Failed to parse MCP response:', mcpResult)
      return NextResponse.json(
        { 
          error: 'Invalid response format',
          message: 'Received invalid response from analysis service' 
        },
        { status: 500 }
      )
    }

    // Check for errors in the parsed result
    if (!parsedResult.success) {
      return NextResponse.json(
        { 
          error: 'Analysis failed',
          message: parsedResult.error || 'URL analysis failed',
          details: parsedResult.details
        },
        { status: 400 }
      )
    }

    // Cache successful results (only if cards were created)
    if (parsedResult.cardsCreated > 0) {
      setCachedResult(cacheKey, parsedResult)
    }

    // Add performance metadata
    const result = {
      ...parsedResult,
      cached: false,
      processingTime: Date.now()
    }

    console.log(`✅ URL analysis completed: ${result.cardsCreated} cards created`)
    
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('URL analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze URL',
        message: 'An unexpected error occurred during URL analysis',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}