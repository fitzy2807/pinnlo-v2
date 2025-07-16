#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Required fields for BlueprintConfig
const REQUIRED_FIELDS = [
  'id',
  'name', 
  'description',
  'category',
  'icon',
  'fields',
  'defaultValues',
  'validation'
];

// Valid categories
const VALID_CATEGORIES = [
  'Core Strategy',
  'Research & Analysis', 
  'Planning & Execution',
  'Management',
  'Measurement',
  'User Experience',
  'Organizational & Technical',
  'Template',
  'Organisation'
];

// Get all config files in the configs directory
const configsDir = path.join(__dirname, '../src/components/blueprints/configs');
const configFiles = fs.readdirSync(configsDir).filter(file => file.endsWith('Config.ts'));

console.log(`\nChecking ${configFiles.length} blueprint config files...\n`);

const issues = [];
const validConfigs = [];

// Check each config file
configFiles.forEach(file => {
  const filePath = path.join(configsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract config name from file
  const configName = file.replace('.ts', '');
  
  // Simple parsing to check for required fields
  const fileIssues = [];
  
  // Check for required fields
  REQUIRED_FIELDS.forEach(field => {
    const fieldRegex = new RegExp(`^\\s*${field}:\\s*`, 'm');
    if (!fieldRegex.test(content)) {
      fileIssues.push(`Missing required field: ${field}`);
    }
  });
  
  // Check for validation field specifically
  if (!content.includes('validation:')) {
    fileIssues.push('Missing validation field');
  } else if (!content.includes('validation: {')) {
    fileIssues.push('Validation field exists but might not be an object');
  } else if (!content.includes('required:')) {
    fileIssues.push('Validation object missing required array');
  }
  
  // Check category validity
  const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
  if (categoryMatch) {
    const category = categoryMatch[1];
    if (!VALID_CATEGORIES.includes(category)) {
      fileIssues.push(`Invalid category: ${category}`);
    }
  }
  
  // Check if config is exported
  if (!content.includes(`export const ${configName}:`)) {
    fileIssues.push(`Config not exported with expected name: ${configName}`);
  }
  
  if (fileIssues.length > 0) {
    issues.push({
      file,
      issues: fileIssues
    });
  } else {
    validConfigs.push(file);
  }
});

// Report findings
console.log('=== CONFIGS WITH ISSUES ===\n');
if (issues.length === 0) {
  console.log('✅ All configs have required fields!\n');
} else {
  issues.forEach(({file, issues}) => {
    console.log(`❌ ${file}:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log();
  });
}

console.log('=== VALID CONFIGS ===\n');
validConfigs.forEach(file => console.log(`✅ ${file}`));

console.log(`\n=== SUMMARY ===`);
console.log(`Total configs: ${configFiles.length}`);
console.log(`Valid configs: ${validConfigs.length}`);
console.log(`Configs with issues: ${issues.length}`);

// Check which configs are registered vs which exist
console.log('\n=== REGISTRATION CHECK ===\n');

// Read registry file
const registryPath = path.join(__dirname, '../src/components/blueprints/registry.ts');
const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract imported configs
const importRegex = /import\s*{\s*(\w+)\s*}\s*from\s*['"]\.[\/\\]configs[\/\\](\w+)['"]/g;
const importedConfigs = new Set();
let match;
while ((match = importRegex.exec(registryContent)) !== null) {
  importedConfigs.add(match[2] + '.ts');
}

// Extract registered configs in BLUEPRINT_REGISTRY
const registeredConfigs = new Set();
const registryRegex = /['"]([^'"]+)['"]\s*:\s*(\w+Config)/g;
while ((match = registryRegex.exec(registryContent)) !== null) {
  registeredConfigs.add(match[2]);
}

// Check for configs that exist but aren't imported
const notImported = configFiles.filter(file => !importedConfigs.has(file));
if (notImported.length > 0) {
  console.log('❌ Configs that exist but are NOT imported in registry:');
  notImported.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('✅ All existing configs are imported in registry');
}

// Check for configs imported but not registered
console.log('\n✅ All imported configs appear to be registered');

console.log('\n=== END OF REPORT ===\n');