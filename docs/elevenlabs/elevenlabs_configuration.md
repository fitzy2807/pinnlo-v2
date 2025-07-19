# ElevenLabs Dashboard Configuration Guide

## 🎯 **Overview**
This guide provides comprehensive step-by-step instructions for configuring the ElevenLabs dashboard to connect our conversational AI widget to PINNLO's MCP server, enabling voice commands to create intelligence cards in our database.

## 📋 **Table of Contents**
1. [Prerequisites](#prerequisites)
2. [Agent Security Settings](#step-1-agent-security-settings)
3. [Voice & Conversation Settings](#step-2-voice--conversation-settings)
4. [Agent Prompt Configuration](#step-3-agent-prompt-configuration)
5. [MCP Server Integration Setup](#step-4-mcp-server-integration-setup)
6. [Tool Configuration](#step-5-tool-configuration-4-tools)
7. [Security & Authentication](#step-6-security--authentication)
8. [Testing & Validation](#step-7-testing--validation)
9. [Technical Verification](#technical-verification-steps)
10. [Rollback Plan](#rollback-plan)

---

## **Prerequisites**

### **Required Information**:
- **Agent ID**: `agent_01k0e16hj7eg6tfk5q3hw05ybe`
- **MCP Server URL**: `http://localhost:3001` (development) or your production URL
- **Authentication Token**: `pinnlo-dev-token-2025`
- **Development Domain**: `localhost:3000`
- **Production Domain**: Your production domain

### **Access Requirements**:
- ElevenLabs dashboard access
- PINNLO MCP server running
- Database access for verification

---

## **Step 1: Agent Security Settings**

### **What to do**: 
Navigate to your agent settings (agent_01k0e16hj7eg6tfk5q3hw05ybe) and configure security

### **Why needed**: 
Enable public access for the embedded widget while maintaining security

### **What it enables**: 
Widget will work in browser without user authentication

### **Configuration Steps**:
1. Go to **ElevenLabs Dashboard → Agents → [Your Agent]**
2. Navigate to **Security Settings**
3. Configure the following:
   - ✅ **Authentication**: **DISABLED** (required for public widget)
   - ✅ **Public Agent**: **ENABLED**  
   - ✅ **Allowlist Domains**: 
     - Add `localhost:3000` (development)
     - Add your production domain
   - ✅ **CORS Settings**: Allow widget embedding

### **Verification**: 
Agent should show as "Public" in the dashboard

---

## **Step 2: Voice & Conversation Settings**

### **What to do**: 
Configure voice parameters and conversation handling

### **Why needed**: 
Ensure natural, professional voice interaction

### **What it enables**: 
High-quality voice conversations with proper turn-taking

### **Configuration Steps**:

#### **Voice Selection**:
- Choose professional voice: **Rachel**, **Dave**, or **Fin**

#### **Voice Settings**:
- **Stability**: `0.5-0.7` (balanced natural sound)
- **Similarity Boost**: `0.7-0.8` (natural voice quality)
- **Style**: `0.0-0.3` (conversational tone)

#### **Conversation Settings**:
- **Turn Detection**: ✅ Enable server-side voice activity detection
- **Interruption Handling**: ✅ Enable for natural conversations
- **Language**: **English**

### **Verification**: 
Test voice quality in ElevenLabs preview

---

## **Step 3: Agent Prompt Configuration**

### **What to do**: 
Set the system prompt for the conversational AI

### **Why needed**: 
Define the AI's role and capabilities for strategic planning

### **What it enables**: 
AI will understand context and provide relevant responses

### **System Prompt to Use**:
```
You are a strategic planning assistant for PINNLO, an AI-powered strategy platform.

Your role is to help users:
- Process voice input into actionable strategy cards
- Generate technical requirements from feature descriptions
- Analyze competitive intelligence from URLs
- Create comprehensive strategy documentation

Available tools:
- process_voice_intelligence: Convert voice input to structured intelligence
- generate_strategy_cards: Create strategy cards from conversations
- generate_technical_requirement: Generate technical specs from feature discussions
- analyze_url: Analyze competitive or reference URLs

Always be concise, strategic, and focused on actionable outcomes.
```

### **Configuration Steps**:
1. Navigate to **Agent Settings → Prompt**
2. Replace existing prompt with the above system prompt
3. Save changes

### **Verification**: 
Prompt should appear in agent configuration

---

## **Step 4: MCP Server Integration Setup**

### **What to do**: 
Add PINNLO's MCP server as a custom integration

### **Why needed**: 
Connect ElevenLabs to our database and card creation system

### **What it enables**: 
Voice commands will create actual cards in PINNLO database

### **Configuration Steps**:
1. Navigate to: **ElevenLabs Dashboard → MCP Server Integrations**
2. Click **Add Custom MCP Server**
3. Configure server details:

#### **Server Configuration**:
```
Name: PINNLO Strategy Server
Description: Voice-to-intelligence processing for PINNLO
Server URL: http://localhost:3001
Secret Token: pinnlo-dev-token-2025
```

#### **HTTP Headers**:
```
Authorization: Bearer pinnlo-dev-token-2025
Content-Type: application/json
```

### **Verification**: 
Server should appear in MCP integrations list with "Connected" status

---

## **Step 5: Tool Configuration (4 Tools)**

### **What to do**: 
Configure each of the 4 main tools with proper endpoints

### **Why needed**: 
Each voice command type needs its own processing endpoint

### **What it enables**: 
Specific voice commands will route to appropriate card creation

### **Tool 1: process_voice_intelligence**
- **Type**: Server
- **Webhook URL**: `http://localhost:3001/api/tools/process_intelligence_text`
- **Description**: "Process voice input into intelligence cards for PINNLO strategy planning"
- **Approval Mode**: "Always Ask" (recommended for security)
- **What it enables**: "Intelligence card" voice commands create intelligence cards

### **Tool 2: generate_strategy_cards**
- **Type**: Server
- **Webhook URL**: `http://localhost:3001/api/tools/generate_strategy_cards`
- **Description**: "Generate strategy cards based on voice conversation"
- **Approval Mode**: "Always Ask"
- **What it enables**: "Create strategy card" voice commands generate strategic content

### **Tool 3: generate_technical_requirement**
- **Type**: Server
- **Webhook URL**: `http://localhost:3001/api/tools/generate_technical_requirement`
- **Description**: "Generate technical requirements from voice specifications"
- **Approval Mode**: "Always Ask"
- **What it enables**: "Turn this into a feature card" creates technical requirement cards

### **Tool 4: analyze_url**
- **Type**: Server
- **Webhook URL**: `http://localhost:3001/api/tools/analyze_url`
- **Description**: "Analyze URLs mentioned in voice conversations"
- **Approval Mode**: "Always Ask"
- **What it enables**: "Analyze this URL" processes competitive intelligence

### **Configuration Steps for Each Tool**:
1. Navigate to **Agent Settings → Tools**
2. Click **Add Tool**
3. Select **Server** type
4. Enter webhook URL and description
5. Set approval mode to "Always Ask"
6. Save configuration

### **Verification**: 
All 4 tools should appear in agent tools list

---

## **Step 6: Security & Authentication**

### **What to do**: 
Configure security settings for tool access

### **Why needed**: 
Protect database operations while allowing voice access

### **What it enables**: 
Secure but functional voice-to-database operations

### **Configuration Steps**:
1. **Tool Approval Mode**: Set to "Always Ask" (maximum security)
2. **Domain Allowlist**: Add development and production domains
3. **Token Authentication**: Verify server tokens match MCP server
4. **Request Validation**: Ensure proper headers are configured

### **Security Checklist**:
- ✅ MCP server token matches configuration
- ✅ All domains are allowlisted
- ✅ Tool approval mode is "Always Ask"
- ✅ HTTPS is used for production

### **Verification**: 
Security settings should show "Secure" status

---

## **Step 7: Testing & Validation**

### **What to do**: 
Test each voice command type to ensure proper routing

### **Why needed**: 
Verify complete end-to-end functionality

### **What it enables**: 
Confidence that voice commands create cards in database

### **Test Cases**:

#### **Test 1: Feature Card Creation**
- **Voice Command**: "Turn this into a feature card"
- **Expected Result**: Creates technical requirement card
- **Verification**: Check database for new TRD card
- **Success Criteria**: New row in cards table with type 'technical-requirement'

#### **Test 2: Strategy Card Creation**
- **Voice Command**: "Create a strategy card"
- **Expected Result**: Generates strategic content
- **Verification**: Check for new strategy card
- **Success Criteria**: New strategy card with generated content

#### **Test 3: Intelligence Card Creation**
- **Voice Command**: "Intelligence card"
- **Expected Result**: Creates intelligence card
- **Verification**: Check intelligence_cards table
- **Success Criteria**: New intelligence card with processed content

#### **Test 4: URL Analysis**
- **Voice Command**: "Analyze this URL [URL]"
- **Expected Result**: Processes URL and creates analysis card
- **Verification**: Check for URL analysis results
- **Success Criteria**: New card with URL analysis data

### **Testing Steps**:
1. Open PINNLO homepage
2. Click voice button to open ElevenLabs widget
3. Test each voice command
4. Verify database entries are created
5. Check for proper error handling

---

## **Technical Verification Steps**

### **After Configuration**:

#### **1. Widget Loading**
- ✅ Widget loads in homepage modal
- ✅ ElevenLabs script loads successfully
- ✅ No console errors

#### **2. Voice Recognition**
- ✅ Voice input is recognized
- ✅ Transcription appears correctly
- ✅ Commands are processed

#### **3. Tool Routing**
- ✅ Commands route to correct endpoints
- ✅ MCP server receives requests
- ✅ Database operations execute

#### **4. Database Storage**
- ✅ Cards are created in Supabase
- ✅ Proper card types assigned
- ✅ Data structure is correct

#### **5. Error Handling**
- ✅ Invalid commands show appropriate errors
- ✅ Network errors are handled gracefully
- ✅ User receives feedback

### **Success Metrics**:
- **Response Time**: < 2 seconds for voice processing
- **Database Storage**: 100% of voice commands saved
- **Error Rate**: < 1% for voice recognition
- **Widget Availability**: 99.9% uptime

### **Debugging Steps**:
1. Check browser console for errors
2. Verify MCP server is running on port 3001
3. Check database connectivity
4. Verify ElevenLabs agent configuration
5. Test individual tool endpoints

---

## **What This Configuration Enables**

### **For Users**:
- **Natural Voice Interface**: Professional quality voice interaction
- **Instant Card Creation**: Voice commands immediately create database entries
- **Strategic Context**: AI understands strategic planning context
- **Seamless Integration**: Voice commands work within existing PINNLO workflow

### **For System**:
- **Database Integration**: All existing storage mechanisms preserved
- **Command Detection**: Automatic routing to appropriate card types
- **Error Handling**: Proper error responses and fallback behavior
- **Analytics**: Usage tracking and performance monitoring

---

## **Rollback Plan**

If issues arise during configuration:

### **Immediate Actions**:
1. **Disable ElevenLabs widget**: Comment out widget code in `src/app/page.tsx`
2. **Revert to Web Speech API**: Restore previous voice modal implementation
3. **Database**: All existing data preserved (no data loss)
4. **Functionality**: Core features remain intact

### **Rollback Steps**:
```typescript
// In src/app/page.tsx - comment out ElevenLabs widget
{/* voiceModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <elevenlabs-convai 
      agent-id="agent_01jxwgtpyxer0sva1ndvnqd6pb"
      variant="embedded"
    />
  </div>
) */}
```

### **Timeline**: 
< 30 minutes to rollback to previous state

---

## **Support & Resources**

### **ElevenLabs Support**:
- **Documentation**: https://elevenlabs.io/docs
- **Dashboard**: https://elevenlabs.io/app
- **MCP Integration**: https://elevenlabs.io/docs/conversational-ai/customization/mcp

### **PINNLO System**:
- **MCP Server**: localhost:3001
- **Database**: Supabase
- **Agent ID**: agent_01k0e16hj7eg6tfk5q3hw05ybe

### **Configuration Files**:
- **Widget Integration**: `src/app/page.tsx`
- **Voice Commands**: `src/app/api/voice/process-intelligence/route.ts`
- **MCP Tools**: `supabase-mcp/src/tools/elevenlabs-conversational-ai.ts`

---

## **Completion Checklist**

Before marking configuration complete:

- [ ] Agent security settings configured
- [ ] Voice settings optimized
- [ ] System prompt configured
- [ ] MCP server integration added
- [ ] All 4 tools configured
- [ ] Security settings verified
- [ ] All test cases pass
- [ ] Database integration verified
- [ ] Error handling tested
- [ ] Documentation updated

---

*Document Created: 2025-01-17*  
*Last Updated: 2025-01-17*  
*Status: Ready for Implementation*  
*Next Steps: Begin Step 1 - Agent Security Settings*