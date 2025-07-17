import { SupabaseClient } from '@supabase/supabase-js';

interface ElevenLabsWebhookRequest {
  conversation_id: string;
  tool_call_id: string;
  tool_name: string;
  parameters: any;
  user_id?: string;
  agent_id?: string;
}

interface ElevenLabsWebhookResponse {
  result: string;
  error?: string;
}

/**
 * Handle ElevenLabs webhook calls to PINNLO MCP tools
 * These are called when ElevenLabs agents invoke server-side tools
 */
export class ElevenLabsWebhookHandler {
  constructor(private supabase: SupabaseClient) {}

  async handleProcessVoiceIntelligence(params: any): Promise<ElevenLabsWebhookResponse> {
    try {
      const { text, context, user_id } = params;
      
      console.log('🎙️ Processing voice intelligence:', { text, context, user_id });
      
      // Process the voice input into structured intelligence
      const processedIntelligence = await this.processTextToIntelligence(text, context);
      
      // Store in Supabase if user_id provided
      if (user_id) {
        await this.supabase
          .from('intelligence_cards')
          .insert({
            user_id,
            title: processedIntelligence.title,
            description: processedIntelligence.description,
            content: processedIntelligence.content,
            source: 'voice_elevenlabs',
            card_type: processedIntelligence.card_type,
            metadata: {
              original_text: text,
              context,
              processing_method: 'voice_intelligence'
            }
          });
      }
      
      return {
        result: JSON.stringify({
          success: true,
          message: 'Voice intelligence processed successfully',
          intelligence_card: processedIntelligence,
          saved_to_pinnlo: !!user_id
        })
      };
      
    } catch (error) {
      console.error('❌ Error processing voice intelligence:', error);
      return {
        result: JSON.stringify({ success: false, error: 'Failed to process voice intelligence' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async handleGenerateStrategyCards(params: any): Promise<ElevenLabsWebhookResponse> {
    try {
      const { prompt, context, user_id, strategy_id } = params;
      
      console.log('📋 Generating strategy cards:', { prompt, context, user_id, strategy_id });
      
      // Generate strategy cards using existing logic
      const strategyCards = await this.generateStrategyCardsFromPrompt(prompt, context);
      
      // Store in Supabase if user_id provided
      if (user_id) {
        for (const card of strategyCards) {
          await this.supabase
            .from('strategy_cards')
            .insert({
              user_id,
              strategy_id,
              title: card.title,
              description: card.description,
              content: card.content,
              card_type: card.card_type,
              source: 'voice_elevenlabs',
              metadata: {
                original_prompt: prompt,
                context,
                generation_method: 'voice_strategy_generation'
              }
            });
        }
      }
      
      return {
        result: JSON.stringify({
          success: true,
          message: `Generated ${strategyCards.length} strategy cards`,
          strategy_cards: strategyCards,
          saved_to_pinnlo: !!user_id
        })
      };
      
    } catch (error) {
      console.error('❌ Error generating strategy cards:', error);
      return {
        result: JSON.stringify({ success: false, error: 'Failed to generate strategy cards' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async handleGenerateTechnicalRequirement(params: any): Promise<ElevenLabsWebhookResponse> {
    try {
      const { features, strategyContext, user_id } = params;
      
      console.log('⚙️ Generating technical requirements:', { features, strategyContext, user_id });
      
      // Generate technical requirements using existing logic
      const technicalRequirement = await this.generateTechnicalRequirementFromFeatures(features, strategyContext);
      
      // Store in Supabase if user_id provided
      if (user_id) {
        await this.supabase
          .from('development_cards')
          .insert({
            user_id,
            title: technicalRequirement.title,
            description: technicalRequirement.description,
            content: technicalRequirement.content,
            card_type: 'technical_requirement',
            source: 'voice_elevenlabs',
            metadata: {
              features,
              strategy_context: strategyContext,
              generation_method: 'voice_technical_generation'
            }
          });
      }
      
      return {
        result: JSON.stringify({
          success: true,
          message: 'Technical requirements generated successfully',
          technical_requirement: technicalRequirement,
          saved_to_pinnlo: !!user_id
        })
      };
      
    } catch (error) {
      console.error('❌ Error generating technical requirements:', error);
      return {
        result: JSON.stringify({ success: false, error: 'Failed to generate technical requirements' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async handleAnalyzeUrl(params: any): Promise<ElevenLabsWebhookResponse> {
    try {
      const { url, analysis_type, user_id } = params;
      
      console.log('🔍 Analyzing URL:', { url, analysis_type, user_id });
      
      // Analyze URL using existing logic
      const urlAnalysis = await this.analyzeUrlContent(url, analysis_type);
      
      // Store in Supabase if user_id provided
      if (user_id) {
        await this.supabase
          .from('intelligence_cards')
          .insert({
            user_id,
            title: `URL Analysis: ${urlAnalysis.title}`,
            description: urlAnalysis.description,
            content: urlAnalysis.content,
            card_type: 'url_analysis',
            source: 'voice_elevenlabs',
            metadata: {
              original_url: url,
              analysis_type,
              analysis_method: 'voice_url_analysis'
            }
          });
      }
      
      return {
        result: JSON.stringify({
          success: true,
          message: 'URL analyzed successfully',
          url_analysis: urlAnalysis,
          saved_to_pinnlo: !!user_id
        })
      };
      
    } catch (error) {
      console.error('❌ Error analyzing URL:', error);
      return {
        result: JSON.stringify({ success: false, error: 'Failed to analyze URL' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper methods (simplified implementations)
  private async processTextToIntelligence(text: string, context?: string) {
    // Implement your existing text processing logic here
    return {
      title: `Voice Intelligence: ${text.substring(0, 50)}...`,
      description: `Processed intelligence from voice input`,
      content: text,
      card_type: 'voice_intelligence'
    };
  }

  private async generateStrategyCardsFromPrompt(prompt: string, context?: string) {
    // Implement your existing strategy card generation logic here
    return [
      {
        title: `Strategy Card: ${prompt.substring(0, 40)}...`,
        description: 'Generated from voice conversation',
        content: prompt,
        card_type: 'strategy'
      }
    ];
  }

  private async generateTechnicalRequirementFromFeatures(features: any[], strategyContext?: any) {
    // Implement your existing technical requirement generation logic here
    return {
      title: `Technical Requirements: ${features.length} features`,
      description: 'Generated from voice feature discussion',
      content: `Requirements for: ${features.map(f => f.name || f).join(', ')}`,
      card_type: 'technical_requirement'
    };
  }

  private async analyzeUrlContent(url: string, analysisType?: string) {
    // Implement your existing URL analysis logic here
    return {
      title: `Analysis of ${url}`,
      description: `${analysisType || 'General'} analysis of the provided URL`,
      content: `URL: ${url}\nAnalysis: Competitive intelligence and insights extracted from the URL content.`
    };
  }
}

// Express route handlers for ElevenLabs webhooks
export function setupElevenLabsWebhookRoutes(app: any, supabase: SupabaseClient) {
  const handler = new ElevenLabsWebhookHandler(supabase);

  // Webhook endpoint for voice intelligence processing
  app.post('/api/tools/process_voice_intelligence', async (req: any, res: any) => {
    try {
      const result = await handler.handleProcessVoiceIntelligence(req.body);
      res.json(result);
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ 
        result: JSON.stringify({ success: false, error: 'Internal server error' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Webhook endpoint for strategy card generation
  app.post('/api/tools/generate_strategy_cards', async (req: any, res: any) => {
    try {
      const result = await handler.handleGenerateStrategyCards(req.body);
      res.json(result);
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ 
        result: JSON.stringify({ success: false, error: 'Internal server error' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Webhook endpoint for technical requirement generation
  app.post('/api/tools/generate_technical_requirement', async (req: any, res: any) => {
    try {
      const result = await handler.handleGenerateTechnicalRequirement(req.body);
      res.json(result);
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ 
        result: JSON.stringify({ success: false, error: 'Internal server error' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Webhook endpoint for URL analysis
  app.post('/api/tools/analyze_url', async (req: any, res: any) => {
    try {
      const result = await handler.handleAnalyzeUrl(req.body);
      res.json(result);
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ 
        result: JSON.stringify({ success: false, error: 'Internal server error' }),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ ElevenLabs webhook routes configured');
}