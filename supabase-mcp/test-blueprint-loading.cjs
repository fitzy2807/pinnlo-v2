const fs = require('fs');
const path = require('path');

// Blueprint type mapping function (matches the registry mappings)
const blueprintFileMap = {
  'features': 'feature',
  'epics': 'epic',
  'personas': 'persona',
  'valuePropositions': 'valueProposition',
  'workstreams': 'workstream',
  'userJourneys': 'userJourney',
  'experienceSections': 'experienceSection',
  'serviceBlueprints': 'serviceBlueprint',
  'organisationalCapabilities': 'organisationalCapability',
  'gtmPlays': 'gtmPlay',
  'techRequirements': 'technicalRequirement',
  'strategicContext': 'strategicContext',
  'customerExperience': 'customerJourney',
  'swot-analysis': 'swot',
  'competitive-analysis': 'competitiveAnalysis',
  'business-model': 'businessModel',
  'go-to-market': 'goToMarket',
  'risk-assessment': 'riskAssessment',
  'roadmap': 'roadmap',
  'kpis': 'kpi',
  'financial-projections': 'financialProjections',
  'cost-driver': 'costDriver',
  'revenue-driver': 'revenueDriver'
};

async function testBlueprintLoading() {
  const blueprintType = 'features';
  
  console.log('Testing blueprint loading for:', blueprintType);
  console.log('Current working directory:', process.cwd());
  
  // Get the actual config file name
  const configFileName = blueprintFileMap[blueprintType] || blueprintType;
  const blueprintPath = path.join(process.cwd(), '..', 'src', 'components', 'blueprints', 'configs', `${configFileName}Config.ts`);
  
  console.log('Looking for blueprint config at:', blueprintPath);
  console.log('Blueprint file exists:', fs.existsSync(blueprintPath));
  
  if (fs.existsSync(blueprintPath)) {
    const fileContent = fs.readFileSync(blueprintPath, 'utf8');
    console.log('File content length:', fileContent.length);
    console.log('First 500 characters:', fileContent.substring(0, 500));
    
    // Extract field definitions from the file
    const fieldsMatch = fileContent.match(/fields:\s*\[([\s\S]*?)\]/);
    console.log('Fields match found:', !!fieldsMatch);
    
    if (fieldsMatch) {
      const fieldsText = fieldsMatch[1];
      console.log('Fields text length:', fieldsText.length);
      console.log('Fields text preview:', fieldsText.substring(0, 200));
      
      // Extract individual field objects - improved regex to handle nested structures
      const fieldMatches = fieldsText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g) || [];
      console.log('Found field objects:', fieldMatches.length);
      
      fieldMatches.forEach((field, index) => {
        const idMatch = field.match(/id:\s*['\"`]([^'\"`]+)['\"`]/);
        const nameMatch = field.match(/name:\s*['\"`]([^'\"`]+)['\"`]/);
        const typeMatch = field.match(/type:\s*['\"`]([^'\"`]+)['\"`]/);
        console.log(`Field ${index + 1}:`, {
          id: idMatch ? idMatch[1] : 'not found',
          name: nameMatch ? nameMatch[1] : 'not found',
          type: typeMatch ? typeMatch[1] : 'not found'
        });
      });
    }
  }
}

testBlueprintLoading().catch(console.error);