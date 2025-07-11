/**
 * Test script for Intelligence Bank interview processing
 */

const testInterviewTranscript = `
Interviewer: Thank you for joining us today. Can you tell us about the main challenges you face with overnight train maintenance schedules?

Technician: Well, the biggest issue is definitely the shortage of qualified technicians. We often have trains waiting simply because there aren't enough people to do the safety checks fast enough. Each train requires a minimum 2-hour inspection, but we only have about 8 hours of downtime between the last service and the first morning departure.

Interviewer: That sounds like a significant bottleneck. How does this impact your operations?

Technician: It's a real problem. Sometimes we have to delay morning services or reduce the number of trains in operation. The safety protocols can't be compromised, so we end up with operational inefficiencies. We've been discussing the possibility of robotic assistance for some of the routine checks.

Interviewer: Robotic assistance? Can you elaborate on that?

Technician: Yes, there are certain inspection tasks that could potentially be automated - visual checks of brake systems, measuring wheel wear, checking for loose bolts. The challenge is that our current infrastructure wasn't designed with automation in mind. We'd need significant upgrades to support robotic systems.

Interviewer: What would those upgrades involve?

Technician: Well, we'd need standardized mounting points for robotic arms, better lighting systems for computer vision, and probably a complete overhaul of our maintenance bay layout. The initial investment would be substantial, but the long-term benefits could be significant - faster turnaround times, more consistent inspections, and reduced dependency on finding skilled technicians.

Interviewer: Are there any concerns about implementing such technology?

Technician: Safety is always the primary concern. We need to ensure that automated systems are fail-safe and that human oversight remains integral to the process. There's also the question of training our existing staff to work alongside robotic systems. But honestly, given our staffing challenges, it's becoming more of a necessity than an option.
`;

// Test the processing
async function testProcessing() {
  try {
    console.log('🧪 Testing Interview Processing...');
    console.log(`📝 Transcript length: ${testInterviewTranscript.length} characters`);
    
    const response = await fetch('http://localhost:3000/api/intelligence-processing/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This would be real auth in production
      },
      body: JSON.stringify({
        text: testInterviewTranscript,
        context: 'Robotics for train maintenance - stakeholder interview',
        type: 'interview'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Processing successful!');
      console.log(`📊 Cards created: ${result.cardsCreated}`);
      console.log(`💰 Cost: $${result.cost}`);
      console.log(`🎬 Interview detected: ${result.isInterview}`);
      console.log(`🎯 Minimum cards met: ${result.minimumCardsMet}`);
      console.log(`🎯 Target cards: ${result.targetCards}`);
      
      if (result.cards && result.cards.length > 0) {
        console.log('\n📋 Sample Card:');
        console.log(`Title: ${result.cards[0].title}`);
        console.log(`Summary: ${result.cards[0].summary}`);
        console.log(`Key Findings: ${result.cards[0].key_findings?.slice(0, 2).join(', ')}...`);
      }
    } else {
      console.log('❌ Processing failed:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

// Run the test
testProcessing();
