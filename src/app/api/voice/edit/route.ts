import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  console.log('=== Voice Edit API Called ===');
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    // Auth check
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check:', { user: user?.id, authError: authError?.message });
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message || 'No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { cardId, blueprintType, cardTitle, transcript, existingFields } = body;
    
    console.log('Request body:', { 
      cardId, 
      blueprintType, 
      cardTitle, 
      transcriptLength: transcript?.length || 0,
      hasExistingFields: !!existingFields 
    });
    
    // Validate required fields
    if (!cardId || !blueprintType || !cardTitle || !transcript) {
      console.error('Missing required fields:', { cardId, blueprintType, cardTitle, hasTranscript: !!transcript });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Create a readable stream for real-time progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        processVoiceEditWithProgress(
          {
            cardId,
            blueprintType,
            cardTitle,
            transcript,
            userId: user.id,
            existingFields
          },
          (progress) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(progress)}\\n\\n`)
            );
          }
        ).then((result) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', ...result })}\\n\\n`)
          );
          controller.close();
        }).catch((error) => {
          console.error('Voice edit processing error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\\n\\n`)
          );
          controller.close();
        });
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    console.error('Voice edit API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processVoiceEditWithProgress(
  args: any,
  onProgress: (progress: any) => void
) {
  console.log('=== processVoiceEditWithProgress START ===');
  console.log('Args:', { ...args, transcript: args.transcript?.substring(0, 100) + '...' });
  
  try {
    // Step 1: Preparing transcript analysis
    onProgress({
      type: 'progress',
      phase: 'analyzing',
      message: 'Analyzing voice transcript...',
      progress: 20
    });
    
    // Step 2: Processing with AI
    onProgress({
      type: 'progress',
      phase: 'processing',
      message: 'Processing with AI to update fields...',
      progress: 50
    });
    
    const mcpUrl = `${process.env.MCP_SERVER_URL || 'http://localhost:3001'}/api/tools/process_voice_edit_content`;
    console.log('=== CALLING MCP SERVER ===');
    console.log('MCP URL:', mcpUrl);
    console.log('MCP Args:', { ...args, transcript: args.transcript?.substring(0, 100) + '...' });
    
    const mcpResponse = await fetch(mcpUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'}`
      },
      body: JSON.stringify(args)
    });
    
    console.log('=== MCP RESPONSE ===');
    console.log('MCP Response status:', mcpResponse.status);
    console.log('MCP Response ok:', mcpResponse.ok);
    console.log('MCP Response headers:', Object.fromEntries(mcpResponse.headers.entries()));
    
    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text();
      console.error('MCP server error response:', errorText);
      throw new Error(`MCP server error: ${mcpResponse.status} - ${errorText}`);
    }
  
    const mcpResult = await mcpResponse.json();
    console.log('=== MCP RESULT DETAILS ===');
    console.log('MCP Result type:', typeof mcpResult);
    console.log('MCP Result keys:', Object.keys(mcpResult || {}));
    console.log('MCP Result preview:', JSON.stringify(mcpResult, null, 2).substring(0, 500) + '...');
    
    // Parse the MCP response
    let result;
    try {
      // Check if the MCP result has the expected structure
      if (mcpResult.content && mcpResult.content[0] && mcpResult.content[0].text) {
        console.log('=== PARSING MCP CONTENT FORMAT ===');
        console.log('Content array length:', mcpResult.content.length);
        console.log('First content text preview:', mcpResult.content[0].text.substring(0, 200) + '...');
        result = JSON.parse(mcpResult.content[0].text);
      } else {
        console.log('=== USING DIRECT MCP FORMAT ===');
        // Handle direct response format
        result = mcpResult;
      }
      
      console.log('=== PARSED RESULT ===');
      console.log('Result success:', result.success);
      console.log('Result fields keys:', Object.keys(result.fields || {}));
      console.log('Result metadata:', result.metadata);
      
    } catch (parseError) {
      console.error('Failed to parse MCP response:', parseError);
      console.error('Raw MCP result:', mcpResult);
      throw new Error('Failed to parse MCP response');
    }
    
    if (!result.success) {
      console.error('Voice edit processing failed:', result.error);
      throw new Error(result.error || 'Voice edit processing failed');
    }
    
    // Step 3: Finalizing updates
    onProgress({
      type: 'progress',
      phase: 'finalizing',
      message: 'Finalizing field updates...',
      progress: 90
    });
    
    // Small delay to show progress
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return result;
    
  } catch (error) {
    console.error('processVoiceEditWithProgress error:', error);
    throw error;
  }
}