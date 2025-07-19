import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3001';
const MCP_SERVER_TOKEN = process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025';

// Voice command detection patterns
const VOICE_COMMANDS = {
  FEATURE: /(?:turn\s+(?:this\s+)?into\s+(?:a\s+)?feature|create\s+(?:a\s+)?feature|generate\s+(?:a\s+)?feature|feature\s+card|technical\s+requirement)/i,
  STRATEGY: /(?:turn\s+(?:this\s+)?into\s+(?:a\s+)?strategy|create\s+(?:a\s+)?strategy|generate\s+(?:a\s+)?strategy|strategy\s+card)/i,
  URL_ANALYSIS: /(?:analyze\s+(?:this\s+)?url|url\s+analysis|competitor\s+analysis|check\s+(?:this\s+)?(?:website|link|url))/i,
  INTELLIGENCE: /(?:intelligence\s+card|market\s+intelligence|create\s+intelligence|turn\s+(?:this\s+)?into\s+intelligence)/i
};

// Detect voice command type from transcript
function detectVoiceCommand(transcript: string): { type: string; endpoint: string; cleanedText: string } {
  const text = transcript.toLowerCase();
  
  // Check for URL analysis commands
  if (VOICE_COMMANDS.URL_ANALYSIS.test(text)) {
    // Extract URL from text if present
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    return {
      type: 'url_analysis',
      endpoint: '/api/tools/analyze_url',
      cleanedText: urlMatch ? urlMatch[0] : transcript
    };
  }
  
  // Check for feature/technical requirement commands
  if (VOICE_COMMANDS.FEATURE.test(text)) {
    // Clean the command words from the text
    const cleanedText = transcript.replace(/(?:turn\s+(?:this\s+)?into\s+(?:a\s+)?feature|create\s+(?:a\s+)?feature|generate\s+(?:a\s+)?feature|feature\s+card|technical\s+requirement)/gi, '').trim();
    return {
      type: 'feature',
      endpoint: '/api/tools/generate_technical_requirement',
      cleanedText: cleanedText || transcript
    };
  }
  
  // Check for strategy card commands
  if (VOICE_COMMANDS.STRATEGY.test(text)) {
    // Clean the command words from the text
    const cleanedText = transcript.replace(/(?:turn\s+(?:this\s+)?into\s+(?:a\s+)?strategy|create\s+(?:a\s+)?strategy|generate\s+(?:a\s+)?strategy|strategy\s+card)/gi, '').trim();
    return {
      type: 'strategy',
      endpoint: '/api/tools/generate_strategy_cards',
      cleanedText: cleanedText || transcript
    };
  }
  
  // Default to intelligence processing
  return {
    type: 'intelligence',
    endpoint: '/api/tools/process_intelligence_text',
    cleanedText: transcript
  };
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, sessionId, metadata } = await request.json();

    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Detect voice command type
    const voiceCommand = detectVoiceCommand(transcript);
    
    console.log('🎙️ Processing voice intelligence:', {
      sessionId,
      transcriptLength: transcript.length,
      commandType: voiceCommand.type,
      endpoint: voiceCommand.endpoint,
      metadata
    });

    // Prepare request body based on command type
    let requestBody;
    switch (voiceCommand.type) {
      case 'feature':
        requestBody = {
          features: [voiceCommand.cleanedText],
          strategyContext: {
            source: 'voice_input',
            sessionId,
            originalText: transcript
          },
          userId: 'voice-user-' + sessionId,
          metadata: {
            ...metadata,
            source: 'homepage_voice_capture',
            processingMethod: 'realtime',
            commandType: 'feature'
          }
        };
        break;
        
      case 'strategy':
        requestBody = {
          prompt: voiceCommand.cleanedText,
          context: 'voice_homepage_capture',
          userId: 'voice-user-' + sessionId,
          metadata: {
            ...metadata,
            source: 'homepage_voice_capture',
            processingMethod: 'realtime',
            commandType: 'strategy'
          }
        };
        break;
        
      case 'url_analysis':
        requestBody = {
          url: voiceCommand.cleanedText,
          context: 'voice_homepage_capture',
          userId: 'voice-user-' + sessionId,
          metadata: {
            ...metadata,
            source: 'homepage_voice_capture',
            processingMethod: 'realtime',
            commandType: 'url_analysis'
          }
        };
        break;
        
      default: // intelligence
        requestBody = {
          text: voiceCommand.cleanedText,
          context: 'voice_homepage_capture',
          type: 'voice_intelligence',
          targetCategory: 'general',
          targetGroups: [],
          userId: 'voice-user-' + sessionId,
          metadata: {
            ...metadata,
            source: 'homepage_voice_capture',
            processingMethod: 'realtime',
            commandType: 'intelligence'
          }
        };
    }

    // Call the appropriate MCP server endpoint
    const mcpResponse = await fetch(`${MCP_SERVER_URL}${voiceCommand.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!mcpResponse.ok) {
      console.error('MCP server error:', mcpResponse.status, mcpResponse.statusText);
      throw new Error(`MCP server error: ${mcpResponse.status}`);
    }

    const mcpResult = await mcpResponse.json();
    
    // Parse the MCP result - it comes wrapped in a content array
    let parsedResult = mcpResult;
    if (mcpResult.content && Array.isArray(mcpResult.content) && mcpResult.content[0]) {
      parsedResult = JSON.parse(mcpResult.content[0].text);
    }
    
    console.log('✅ MCP processing complete:', {
      sessionId,
      success: parsedResult.success,
      cardsGenerated: parsedResult.cardsCreated || parsedResult.cards?.length || 0,
      commandType: voiceCommand.type
    });

    // Transform MCP result into our expected format based on command type
    const cards = [];
    
    if (voiceCommand.type === 'feature') {
      // Handle technical requirement response
      if (parsedResult.technical_requirements || parsedResult.cards) {
        const reqs = parsedResult.technical_requirements || parsedResult.cards || [];
        reqs.forEach((req: any) => {
          cards.push({
            title: req.title || req.feature || 'Technical Requirement',
            description: req.description || 'Generated from voice feature request',
            category: 'development',
            content: req.details || req.content || req.requirement || voiceCommand.cleanedText,
            confidence: req.confidence || 0.9,
            type: 'feature',
            metadata: {
              originalCommand: transcript,
              commandType: 'feature'
            }
          });
        });
      }
    } else if (voiceCommand.type === 'strategy') {
      // Handle strategy card response
      if (parsedResult.strategy_cards || parsedResult.cards) {
        const strategies = parsedResult.strategy_cards || parsedResult.cards || [];
        strategies.forEach((strategy: any) => {
          cards.push({
            title: strategy.title || 'Strategy Card',
            description: strategy.description || 'Generated from voice strategy input',
            category: 'strategy',
            content: strategy.content || strategy.details || voiceCommand.cleanedText,
            confidence: strategy.confidence || 0.9,
            type: 'strategy',
            metadata: {
              originalCommand: transcript,
              commandType: 'strategy'
            }
          });
        });
      }
    } else if (voiceCommand.type === 'url_analysis') {
      // Handle URL analysis response
      if (parsedResult.cards) {
        parsedResult.cards.forEach((card: any) => {
          cards.push({
            title: card.title || 'URL Analysis',
            description: card.description || 'Generated from voice URL analysis',
            category: card.category || 'competitive',
            content: card.content || voiceCommand.cleanedText,
            confidence: card.confidence || 0.8,
            type: 'url_analysis',
            metadata: {
              originalCommand: transcript,
              commandType: 'url_analysis',
              url: voiceCommand.cleanedText
            }
          });
        });
      }
    } else {
      // Handle standard intelligence response
      if (parsedResult.cards && Array.isArray(parsedResult.cards)) {
        parsedResult.cards.forEach((card: any) => {
          cards.push({
            title: card.title || 'Voice Intelligence',
            description: card.description || 'Generated from voice input',
            category: card.category || detectCategory(transcript),
            content: card.content || transcript,
            confidence: card.confidence || 0.8,
            type: 'intelligence',
            metadata: {
              originalCommand: transcript,
              commandType: 'intelligence'
            }
          });
        });
      }
    }

    // If no structured cards were generated, create a basic one
    if (cards.length === 0) {
      cards.push({
        title: `Voice ${voiceCommand.type.charAt(0).toUpperCase() + voiceCommand.type.slice(1)} Capture`,
        description: `Generated from voice ${voiceCommand.type} input`,
        category: voiceCommand.type === 'feature' ? 'development' : 
                  voiceCommand.type === 'strategy' ? 'strategy' : 
                  detectCategory(transcript),
        content: voiceCommand.cleanedText,
        confidence: 0.7,
        type: voiceCommand.type,
        metadata: {
          originalCommand: transcript,
          commandType: voiceCommand.type
        }
      });
    }

    return NextResponse.json({
      success: true,
      cards,
      model: 'gpt-4o-mini',
      processingTime: Date.now(),
      metadata: {
        sessionId,
        originalTranscript: transcript,
        mcpProcessed: parsedResult.success || false,
        tokensUsed: parsedResult.tokensUsed || 0,
        cost: parsedResult.cost || 0,
        processingType: parsedResult.processingType || 'voice_intelligence',
        commandType: voiceCommand.type,
        cleanedText: voiceCommand.cleanedText,
        mcpEndpoint: voiceCommand.endpoint
      }
    });

  } catch (error) {
    console.error('❌ Voice processing error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process voice input',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to detect intelligence category from transcript
function detectCategory(transcript: string): 'market' | 'customer' | 'competitive' | 'research' | 'general' {
  const text = transcript.toLowerCase();
  
  // Market intelligence keywords
  if (text.includes('market') || text.includes('industry') || text.includes('trends') || text.includes('growth')) {
    return 'market';
  }
  
  // Customer intelligence keywords
  if (text.includes('customer') || text.includes('user') || text.includes('client') || text.includes('feedback')) {
    return 'customer';
  }
  
  // Competitive intelligence keywords
  if (text.includes('competitor') || text.includes('competition') || text.includes('rival') || text.includes('versus')) {
    return 'competitive';
  }
  
  // Research keywords
  if (text.includes('research') || text.includes('study') || text.includes('analysis') || text.includes('data')) {
    return 'research';
  }
  
  return 'general';
}