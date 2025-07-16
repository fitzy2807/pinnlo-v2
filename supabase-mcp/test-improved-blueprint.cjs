const fs = require('fs');
const path = require('path');

// Improved blueprint loading function
async function getBlueprintFields(blueprintType) {
  try {
    // Map blueprint types to their actual config file names
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
    
    // Get the actual config file name
    const configFileName = blueprintFileMap[blueprintType] || blueprintType;
    const blueprintPath = path.join(process.cwd(), '..', 'src', 'components', 'blueprints', 'configs', `${configFileName}Config.ts`);
    
    console.log('Looking for blueprint config at:', blueprintPath);
    console.log('Blueprint file exists:', fs.existsSync(blueprintPath));
    
    if (fs.existsSync(blueprintPath)) {
      const fileContent = fs.readFileSync(blueprintPath, 'utf8');
      
      // Extract field definitions from the file - use greedy match to capture all fields
      const fieldsMatch = fileContent.match(/fields:\s*\[([\s\S]*)\],?\s*defaultValues/);
      console.log('Fields match found:', !!fieldsMatch);
      if (fieldsMatch) {
        // Parse the fields and format them for the prompt
        const fieldsText = fieldsMatch[1];
        console.log('Fields text length:', fieldsText.length);
        
        // Use a more robust approach to parse the field definitions
        // Find all field boundaries by looking for 'id:' patterns
        const fieldSeparatorRegex = /\s*\{\s*id:\s*['"`]([^'"`]+)['"`]/g;
        const fieldBoundaries = [];
        let match;
        
        while ((match = fieldSeparatorRegex.exec(fieldsText)) !== null) {
          fieldBoundaries.push({
            id: match[1],
            startIndex: match.index,
            matchLength: match[0].length
          });
        }
        
        console.log('Found field boundaries:', fieldBoundaries.length);
        
        const fieldDescriptions = [];
        
        for (let i = 0; i < fieldBoundaries.length; i++) {
          const currentField = fieldBoundaries[i];
          const nextField = fieldBoundaries[i + 1];
          
          const fieldStartIndex = currentField.startIndex;
          const fieldEndIndex = nextField ? nextField.startIndex : fieldsText.length;
          const fieldText = fieldsText.substring(fieldStartIndex, fieldEndIndex);
          
          // Extract field properties
          const nameMatch = fieldText.match(/name:\s*['"`]([^'"`]+)['"`]/);
          const typeMatch = fieldText.match(/type:\s*['"`]([^'"`]+)['"`]/);
          const requiredMatch = fieldText.match(/required:\s*(true|false)/);
          const descriptionMatch = fieldText.match(/description:\s*['"`]([^'"`]+)['"`]/);
          const placeholderMatch = fieldText.match(/placeholder:\s*['"`]([^'"`]+)['"`]/);
          
          if (nameMatch && typeMatch) {
            const fieldType = typeMatch[1];
            const isRequired = requiredMatch ? requiredMatch[1] === 'true' : false;
            const description = descriptionMatch ? descriptionMatch[1] : '';
            const placeholder = placeholderMatch ? placeholderMatch[1] : '';
            
            // Map field types to expected JSON formats
            let jsonType = 'string';
            let example = '""';
            
            switch (fieldType) {
              case 'array':
                jsonType = 'array of strings';
                example = '["item1", "item2"]';
                break;
              case 'enum':
                jsonType = 'string (enum)';
                example = '"option1"';
                break;
              case 'textarea':
                jsonType = 'string (multiline)';
                example = '"Multi-line text content"';
                break;
              case 'number':
                jsonType = 'number';
                example = '0';
                break;
              case 'boolean':
                jsonType = 'boolean';
                example = 'true';
                break;
              default:
                jsonType = 'string';
                example = '""';
            }
            
            const fieldDesc = `- ${currentField.id}: ${nameMatch[1]} (${jsonType}) ${isRequired ? '[REQUIRED]' : '[OPTIONAL]'} - ${description || placeholder || 'No description'} - Example: ${example}`;
            fieldDescriptions.push(fieldDesc);
            
            console.log(`Parsed field: ${currentField.id} - ${nameMatch[1]} (${fieldType})`);
          }
        }
        
        console.log('Parsed field descriptions:', fieldDescriptions.length);
        
        if (fieldDescriptions.length > 0) {
          return fieldDescriptions.join('\n');
        }
      }
    }
    
    // Fallback: Return basic field structure
    return `- title: Title (string) [REQUIRED] - Card title
- description: Description (string) [REQUIRED] - Card description
- tags: Tags (array of strings) [OPTIONAL] - Relevant tags
- strategicAlignment: Strategic Alignment (string) [OPTIONAL] - How this aligns with strategy`;
    
  } catch (error) {
    console.error('Error reading blueprint fields:', error);
    return `- title: Title (string) [REQUIRED] - Card title
- description: Description (string) [REQUIRED] - Card description
- tags: Tags (array of strings) [OPTIONAL] - Relevant tags`;
  }
}

async function testImprovedBlueprint() {
  console.log('Testing improved blueprint loading...');
  
  const result = await getBlueprintFields('features');
  console.log('\n=== FINAL RESULT ===');
  console.log(result);
}

testImprovedBlueprint().catch(console.error);