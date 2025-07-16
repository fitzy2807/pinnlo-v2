// Debug script to test TRD card detection
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
);

async function debugTRDCards() {
  console.log('🔍 Debugging TRD Cards...\n');
  
  try {
    // Query for all cards with TRD-related card types
    const { data: allCards, error } = await supabase
      .from('cards')
      .select('id, title, card_type, description, created_at')
      .in('card_type', ['trd', 'technical-requirement', 'technical-requirement-structured'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching cards:', error);
      return;
    }

    console.log('📊 TRD Card Summary:');
    console.log('Total cards found:', allCards?.length || 0);
    
    const cardTypeCounts = {};
    allCards?.forEach(card => {
      cardTypeCounts[card.card_type] = (cardTypeCounts[card.card_type] || 0) + 1;
    });

    console.log('\n📈 Card Type Breakdown:');
    Object.entries(cardTypeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} cards`);
    });

    if (allCards?.length > 0) {
      console.log('\n📋 Card Details:');
      allCards.forEach((card, index) => {
        console.log(`${index + 1}. ${card.title}`);
        console.log(`   Type: ${card.card_type}`);
        console.log(`   ID: ${card.id}`);
        console.log(`   Created: ${new Date(card.created_at).toLocaleDateString()}`);
        console.log('');
      });
    }

    // Test the development card types array
    const DEVELOPMENT_CARD_TYPES = [
      'prd',
      'technical-requirement-structured',
      'technical-requirement', 
      'trd',
      'feature',
      'tech-stack',
      'task-list'
    ];

    console.log('✅ Development Card Types Array:');
    DEVELOPMENT_CARD_TYPES.forEach(type => {
      const count = cardTypeCounts[type] || 0;
      console.log(`  - ${type}: ${count} cards ${count > 0 ? '✅' : '⚠️'}`);
    });

    // Check if TRD cards would be properly queried
    const trdCards = allCards?.filter(card => 
      ['trd', 'technical-requirement', 'technical-requirement-structured'].includes(card.card_type)
    );

    console.log('\n🎯 TRD Cards that should appear in modal:');
    trdCards?.forEach(card => {
      console.log(`  - ${card.title} (${card.card_type})`);
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the debug
debugTRDCards();