#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Unified MCP Server
 * Tests all endpoints for backward compatibility
 */

const BASE_URL = 'http://localhost:3001';
const AUTH_TOKEN = process.env.MCP_SERVER_TOKEN || 'pinnlo-dev-token-2025';

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make authenticated requests
async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Test case runner
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Testing: ${testName}`);
  
  try {
    const result = await testFunction();
    if (result.success) {
      testResults.passed++;
      console.log(`✅ PASSED: ${testName}`);
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    } else {
      testResults.failed++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${result.error}`);
      testResults.errors.push({ test: testName, error: result.error });
    }
  } catch (error) {
    testResults.failed++;
    console.log(`❌ ERROR: ${testName}`);
    console.log(`   Exception: ${error.message}`);
    testResults.errors.push({ test: testName, error: error.message });
  }
}

// Test cases
async function testHealthEndpoint() {
  const result = await makeRequest('/health');
  
  if (result.status === 200 && result.data.status === 'healthy') {
    return { success: true, details: `Status: ${result.data.status}, Timestamp: ${result.data.timestamp}` };
  }
  
  return { success: false, error: `Expected healthy status, got: ${JSON.stringify(result)}` };
}

async function testToolsListing() {
  const result = await makeRequest('/api/tools');
  
  if (result.status === 200 && result.data.tools && Array.isArray(result.data.tools)) {
    return { success: true, details: `Found ${result.data.tools.length} tools` };
  }
  
  return { success: false, error: `Expected tools array, got: ${JSON.stringify(result)}` };
}

async function testAuthenticationRequired() {
  const response = await fetch(`${BASE_URL}/api/tools/generate_technical_requirement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  
  if (response.status === 401) {
    return { success: true, details: 'Correctly rejected unauthenticated request' };
  }
  
  return { success: false, error: `Expected 401, got: ${response.status}` };
}

async function testTechnicalRequirementGeneration() {
  const result = await makeRequest('/api/tools/generate_technical_requirement', 'POST', {
    features: [
      { name: 'Test Feature', description: 'A test feature for validation' }
    ]
  });
  
  if (result.status === 200 && result.data.success && result.data.requirement) {
    return { success: true, details: `Generated requirement: ${result.data.requirement.name}` };
  }
  
  return { success: false, error: `Expected successful generation, got: ${JSON.stringify(result)}` };
}

async function testEditModeContentGeneration() {
  const result = await makeRequest('/api/tools/generate_edit_mode_content', 'POST', {
    blueprintType: 'vision',
    cardTitle: 'Test Vision Card',
    strategyId: 'test-strategy-id',
    userId: 'test-user-id'
  });
  
  if (result.status === 200 && result.data.success && result.data.fields) {
    return { success: true, details: `Generated fields: ${Object.keys(result.data.fields).join(', ')}` };
  }
  
  return { success: false, error: `Expected successful generation, got: ${JSON.stringify(result)}` };
}

async function testContextSummaryGeneration() {
  const result = await makeRequest('/api/tools/generate_context_summary', 'POST', {
    blueprintCards: [
      { title: 'Test Blueprint', description: 'Test blueprint description' }
    ],
    intelligenceCards: [
      { title: 'Test Intelligence', description: 'Test intelligence description' }
    ],
    strategyName: 'Test Strategy'
  });
  
  if (result.status === 200 && result.data.success && result.data.summary) {
    return { success: true, details: `Generated summary length: ${result.data.summary.length} chars` };
  }
  
  return { success: false, error: `Expected successful generation, got: ${JSON.stringify(result)}` };
}

async function testMcpInvokeEndpoint() {
  const result = await makeRequest('/api/mcp/invoke', 'POST', {
    tool: 'test_tool',
    arguments: { test: 'value' }
  });
  
  if (result.status === 200 && result.data.success) {
    return { success: true, details: 'MCP invoke endpoint responding' };
  }
  
  return { success: false, error: `Expected successful invoke, got: ${JSON.stringify(result)}` };
}

async function testSupabaseConnectionEndpoint() {
  const result = await makeRequest('/api/supabase/connect', 'POST', {
    url: 'https://test.supabase.co',
    serviceKey: 'test-key'
  });
  
  if (result.status === 200 && result.data.success) {
    return { success: true, details: 'Supabase connection endpoint working' };
  }
  
  return { success: false, error: `Expected successful connection, got: ${JSON.stringify(result)}` };
}

async function testPlaceholderEndpoints() {
  const endpoints = [
    '/api/tools/generate_strategy_cards',
    '/api/tools/commit_trd_to_task_list',
    '/api/tools/commit_trd_to_task_list_batched',
    '/api/tools/generate_universal_executive_summary',
    '/api/tools/analyze_url',
    '/api/tools/process_intelligence_text',
    '/api/tools/generate_automation_intelligence',
    '/api/tools/execute_command',
    '/api/tools/read_file_content',
    '/api/tools/get_project_status'
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint, 'POST', {});
    if (result.status === 200 && result.data.success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  if (failureCount === 0) {
    return { success: true, details: `All ${endpoints.length} placeholder endpoints working` };
  }
  
  return { success: false, error: `${failureCount} out of ${endpoints.length} placeholder endpoints failed` };
}

async function testResponseFormats() {
  const result = await makeRequest('/api/tools/generate_technical_requirement', 'POST', {
    features: [{ name: 'Format Test', description: 'Test response format' }]
  });
  
  if (result.status === 200 && result.data.success && result.data.metadata && result.data.model_used) {
    return { success: true, details: 'Response format matches expected structure' };
  }
  
  return { success: false, error: `Response format mismatch: ${JSON.stringify(result)}` };
}

async function testFallbackBehavior() {
  // Test with invalid OpenAI key to trigger fallback
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'invalid-key';
  
  const result = await makeRequest('/api/tools/generate_technical_requirement', 'POST', {
    features: [{ name: 'Fallback Test', description: 'Test fallback behavior' }]
  });
  
  // Restore original key
  process.env.OPENAI_API_KEY = originalKey;
  
  if (result.status === 200 && result.data.success && result.data.model_used === 'fallback') {
    return { success: true, details: 'Fallback behavior working correctly' };
  }
  
  return { success: false, error: `Fallback not triggered: ${JSON.stringify(result)}` };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Unified MCP Server Test Suite');
  console.log('=' .repeat(60));
  
  // Basic functionality tests
  await runTest('Health Check Endpoint', testHealthEndpoint);
  await runTest('Tools Listing Endpoint', testToolsListing);
  await runTest('Authentication Required', testAuthenticationRequired);
  
  // Core endpoint tests
  await runTest('Technical Requirement Generation', testTechnicalRequirementGeneration);
  await runTest('Edit Mode Content Generation', testEditModeContentGeneration);
  await runTest('Context Summary Generation', testContextSummaryGeneration);
  await runTest('MCP Invoke Endpoint', testMcpInvokeEndpoint);
  await runTest('Supabase Connection Endpoint', testSupabaseConnectionEndpoint);
  
  // Comprehensive endpoint tests
  await runTest('Placeholder Endpoints', testPlaceholderEndpoints);
  await runTest('Response Format Compatibility', testResponseFormats);
  
  // Edge case tests
  await runTest('Fallback Behavior', testFallbackBehavior);
  
  // Test summary
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Test Suite Complete');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\n🎯 Backward Compatibility Assessment:');
  if (testResults.failed === 0) {
    console.log('✅ PERFECT: All tests passed - 100% backward compatibility maintained');
  } else if (testResults.passed / testResults.total > 0.9) {
    console.log('✅ EXCELLENT: >90% compatibility - minor issues to address');
  } else if (testResults.passed / testResults.total > 0.7) {
    console.log('⚠️  GOOD: >70% compatibility - some issues need attention');
  } else {
    console.log('❌ NEEDS WORK: <70% compatibility - significant issues to resolve');
  }
  
  return testResults;
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (response.ok) {
      console.log('✅ Server is running and accessible');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not accessible:', error.message);
    return false;
  }
}

// Run tests
async function main() {
  console.log('🔍 Checking server availability...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Cannot run tests - server is not running');
    console.log('💡 Please start the server with: npm run unified');
    process.exit(1);
  }
  
  await runAllTests();
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runAllTests, testResults };