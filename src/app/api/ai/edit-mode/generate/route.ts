import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  console.log('=== Edit Mode Generate API Called ===');
  
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
    const { cardId, blueprintType, cardTitle, strategyId, existingFields } = body;
    
    console.log('Request body:', { cardId, blueprintType, cardTitle, strategyId, hasExistingFields: !!existingFields });
    
    // Validate required fields
    if (!cardId || !blueprintType || !cardTitle) {
      console.error('Missing required fields:', { cardId, blueprintType, cardTitle });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Create a readable stream for real-time progress updates
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        generateFieldsWithProgress(
          {
            cardId,
            blueprintType,
            cardTitle,
            strategyId,
            userId: user.id,
            existingFields
          },
          (progress) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(progress)}\n\n`)
            );
          }
        ).then((result) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', ...result })}\n\n`)
          );
          controller.close();
        }).catch((error) => {
          console.error('Generation error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
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
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateFieldsWithProgress(
  args: any,
  onProgress: (progress: any) => void
) {
  console.log('=== generateFieldsWithProgress START ===');
  console.log('Args:', args);
  
  try {
    // Step 1: Context gathering
    onProgress({
      type: 'progress',
      phase: 'context_gathering',
      message: 'Gathering strategy context...',
      progress: 10
    });
    
    // Step 2: Fetching AI configuration
    onProgress({
      type: 'progress',
      phase: 'configuring',
      message: 'Fetching AI configuration...',
      progress: 30
    });
    
    // Step 3: Call MCP tool
    onProgress({
      type: 'progress',
      phase: 'generating',
      message: 'Generating content with AI...',
      progress: 50
    });
    
    const mcpUrl = `${process.env.MCP_SERVER_URL || 'http://localhost:3001'}/api/tools/generate_edit_mode_content`;
    console.log('Calling MCP URL:', mcpUrl);
    
    const mcpResponse = await fetch(mcpUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025'}`
      },
      body: JSON.stringify(args)
    });
    
    console.log('MCP Response status:', mcpResponse.status);
    console.log('MCP Response ok:', mcpResponse.ok);
    
    if (!mcpResponse.ok) {
      const errorText = await mcpResponse.text();
      console.error('MCP server error response:', errorText);
      throw new Error(`MCP server error: ${mcpResponse.status} - ${errorText}`);
    }
  
  const mcpResult = await mcpResponse.json();
  console.log('MCP Result:', mcpResult);
  
  // Parse the MCP response
  let result;
  try {
    // Check if the MCP result has the expected structure
    if (mcpResult.content && mcpResult.content[0] && mcpResult.content[0].text) {
      result = JSON.parse(mcpResult.content[0].text);
    } else {
      // Handle direct response format
      result = mcpResult;
    }
  } catch (parseError) {
    console.error('Failed to parse MCP response:', parseError);
    console.error('Raw MCP result:', mcpResult);
    throw new Error('Failed to parse MCP response');
  }
  
  if (!result.success) {
    console.error('MCP generation failed:', result.error);
    throw new Error(result.error || 'Generation failed');
  }
  
  // Step 4: Optimizing
  onProgress({
    type: 'progress',
    phase: 'optimizing',
    message: 'Optimizing field coherence...',
    progress: 90
  });
  
  // Small delay to show progress
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return result;
  
  } catch (error) {
    console.error('generateFieldsWithProgress error:', error);
    throw error;
  }
}