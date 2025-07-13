/**
 * AI Service for generating cards using OpenAI API
 * This service takes the prompts from MCP and executes the actual AI generation
 */

interface AIGenerationOptions {
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export class AIService {
  async generateCards(systemPrompt: string, userPrompt: string): Promise<any[]> {
    try {
      // Use our API route which has access to server-side env vars
      const response = await fetch('/api/card-creator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `API error: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Generation failed')
      }

      return result.cards || []
    } catch (error) {
      console.error('AI generation failed:', error)
      throw error
    }
  }

  /**
   * Generate cards using the MCP prompt structure
   */
  async generateFromMCPPrompts(mcpResult: any): Promise<any[]> {
    if (!mcpResult.prompts) {
      throw new Error('Invalid MCP result - no prompts found')
    }

    const { system, user } = mcpResult.prompts
    return this.generateCards(system, user)
  }
}