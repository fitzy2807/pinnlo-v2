import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const strategyId = searchParams.get('strategyId');
    const blueprintType = searchParams.get('blueprintType');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Get context configuration for the blueprint type
    const { data: contextConfig, error: contextError } = await supabase
      .rpc('get_ai_context_config', { p_blueprint_type: blueprintType });

    // Get available cards for context
    const contextData = [];
    
    if (contextConfig && contextConfig.length > 0) {
      for (const config of contextConfig) {
        const { context_blueprint, max_cards, inclusion_strategy } = config;
        
        let query = supabase
          .from('cards')
          .select('id, title, description, card_type, card_data, strategy_id, created_at')
          .eq('user_id', userId)
          .eq('card_type', context_blueprint);

        if (strategyId) {
          query = query.eq('strategy_id', strategyId);
        }

        if (max_cards) {
          query = query.limit(max_cards);
        }

        const { data: cards, error } = await query;

        contextData.push({
          blueprint: context_blueprint,
          config: config,
          cards: cards || [],
          error: error?.message || null,
          query: {
            user_id: userId,
            card_type: context_blueprint,
            strategy_id: strategyId || 'any',
            max_cards: max_cards || 'unlimited'
          }
        });
      }
    }

    // Get all user's strategies for reference
    const { data: strategies } = await supabase
      .from('strategies')
      .select('id, title, description, created_at')
      .eq('userId', userId)
      .order('created_at', { ascending: false });

    // Get all user's cards for reference
    const { data: allCards } = await supabase
      .from('cards')
      .select('id, title, card_type, strategy_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        strategyId,
        blueprintType,
        contextConfig: contextConfig || [],
        contextData,
        strategies: strategies || [],
        allCards: allCards || []
      }
    });

  } catch (error) {
    console.error('Debug context error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}