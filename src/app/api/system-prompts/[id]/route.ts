import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestBody = await request.json();
    const { 
      system_prompt, 
      context_config, 
      card_creator_preview_prompt, 
      card_creator_generation_prompt, 
      card_creator_config 
    } = requestBody;
    
    if (!system_prompt && !context_config && !card_creator_preview_prompt && !card_creator_generation_prompt && !card_creator_config) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
    }

    // Build update object based on what's provided
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (system_prompt) {
      updateData.system_prompt = system_prompt;
    }
    
    if (context_config !== undefined) {
      updateData.context_config = context_config;
    }
    
    if (card_creator_preview_prompt !== undefined) {
      updateData.card_creator_preview_prompt = card_creator_preview_prompt;
    }
    
    if (card_creator_generation_prompt !== undefined) {
      updateData.card_creator_generation_prompt = card_creator_generation_prompt;
    }
    
    if (card_creator_config !== undefined) {
      updateData.card_creator_config = card_creator_config;
    }

    const { data, error } = await supabase
      .from('ai_system_prompts')
      .update(updateData)
      .eq('id', params.id)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}