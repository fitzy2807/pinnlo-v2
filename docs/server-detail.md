# Pinnlo V2 - New Engineer Onboarding Guide

## 🏗️ **System Architecture Overview**

Pinnlo V2 is an AI-powered strategic planning platform with a **two-service architecture**:

### **Frontend & API (Vercel)**
- **Purpose**: Main web application, user interface, and most API routes
- **Technology**: Next.js 14 with TypeScript, Tailwind CSS
- **Deployment**: Vercel (automatic from GitHub)
- **Repository**: `fitzy2807/pinnlo-v2` (main codebase)

### **AI Backend (Railway)**  
- **Purpose**: AI content generation, MCP (Model Context Protocol) server
- **Technology**: Node.js Express server with OpenAI integration
- **Deployment**: Railway (automatic from GitHub)
- **Repository**: Same repo, but deploys from `/supabase-mcp` subfolder

## 🎯 **Why This Split Architecture?**

### **Vercel Handles:**
- ✅ Frontend React/Next.js application
- ✅ Most API routes (`/api/*`)
- ✅ Static site generation and user interface
- ✅ Authentication via Supabase
- ✅ Database operations
- ✅ Fast global CDN delivery

### **Railway Handles:**
- ✅ Long-running AI generation processes (no timeout limits)
- ✅ OpenAI API integration and prompt management
- ✅ Complex AI workflows that take 30-120 seconds
- ✅ MCP (Model Context Protocol) server
- ✅ AI content generation for strategy cards

**Why not everything on Vercel?** Vercel serverless functions have timeout limits (10-60 seconds) which are too short for complex AI generation processes.

## 🚀 **Railway Setup Process**

### **Step 1: Initial Railway Configuration**
1. **Signed up** at railway.app
2. **Connected GitHub account** 
3. **Selected repository**: `fitzy2807/pinnlo-v2`
4. **Set root directory**: `supabase-mcp` (crucial - this subfolder becomes the project root)

### **Step 2: GitHub Integration**
- **Repository**: `fitzy2807/pinnlo-v2`
- **Branch**: `development` 
- **Auto-deploy**: Enabled (deploys automatically on push to development branch)
- **Build source**: Only files in `/supabase-mcp/` directory

### **Step 3: Build Configuration**
```
Source Repo: fitzy2807/pinnlo-v2
Root Directory: supabase-mcp
Branch: development
Builder: Nixpacks (Default)
Build Command: npm install
Start Command: node server-simple.js
```

### **Step 4: Environment Variables Setup**
```bash
# Added to Railway dashboard
OPENAI_API_KEY=sk-proj-02HtpP-Z5gLKZjgBLLjOF5AiVAMW281s-c...
DATABASE_URL=postgresql://postgres:27yvGsqVXFKfqoMYadqqj...
PORT=3001
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### **Step 5: Networking Configuration**
- **Generated domain**: `pinnlo-v2-production.up.railway.app`
- **Public networking**: Enabled
- **Health check endpoint**: `/health`

## 📁 **File Structure & What Gets Deployed**

### **Repository Structure:**
```
pinnlo-v2/                          ← Main repository
├── src/                             ← Vercel frontend (Next.js app)
├── supabase-mcp/                    ← Railway backend (AI server)
│   ├── server-simple.js            ← 🚀 RAILWAY DEPLOYS THIS
│   ├── server.js                    ← Alternative server
│   ├── package.json                ← Railway dependencies
│   ├── src/                         ← Advanced MCP system (TypeScript)
│   │   ├── tools/
│   │   │   └── edit-mode-generator.ts
│   │   ├── http-server.ts
│   │   └── index.ts
│   └── dist/                        ← Compiled TypeScript
└── package.json                     ← Vercel dependencies
```

### **What Railway Actually Deploys:**
- **Entry point**: `supabase-mcp/server-simple.js`
- **Dependencies**: `supabase-mcp/package.json`
- **Environment**: Node.js runtime
- **Port**: 3001 (configurable via PORT env var)

## 🔗 **Service Integration**

### **How Vercel Connects to Railway:**
1. **Environment Variable** in Vercel:
   ```
   MCP_SERVER_URL=https://pinnlo-v2-production.up.railway.app
   ```

2. **API Call Flow:**
   ```
   User clicks "AI Generate" 
   → Vercel API route (/api/ai/edit-mode/generate)
   → HTTP request to Railway (/api/tools/generate_edit_mode_content)
   → Railway calls OpenAI
   → Response flows back to user
   ```

3. **Authentication:**
   ```javascript
   headers: {
     'Authorization': 'Bearer pinnlo-dev-token-2025'
   }
   ```

## 🛠️ **Development Workflow**

### **Local Development:**
```bash
# Frontend (Vercel simulation)
npm run dev                          # Runs on localhost:3000

# AI Backend (Railway simulation)  
cd supabase-mcp
npm run dev                          # Runs on localhost:3001
```

### **Deployment Process:**
```bash
# Any changes to main app
git push origin development          # Auto-deploys to Vercel

# Any changes to AI backend
git add supabase-mcp/
git commit -m "Update AI backend"
git push origin development          # Auto-deploys to Railway
```

### **Monitoring:**
- **Vercel**: vercel.com dashboard → pinnlo-v2 project
- **Railway**: railway.app dashboard → pinnlo-v2 project
- **Logs**: Both platforms provide real-time deployment and runtime logs

## 🔧 **Railway Server Details**

### **Current Endpoints:**
```javascript
GET  /health                                    ✅ Health check
POST /api/tools/generate_technical_requirement  ✅ Technical requirements
POST /api/tools/generate_edit_mode_content      ✅ General AI generation
```

### **Server Capabilities:**
- **OpenAI Integration**: GPT-3.5-turbo for content generation  
- **CORS**: Enabled for cross-origin requests
- **Authentication**: Bearer token middleware
- **Error Handling**: Graceful fallbacks when OpenAI fails
- **Logging**: Comprehensive request/response logging

### **Key Files:**
- **`server-simple.js`**: Main server file (what Railway runs)
- **`package.json`**: Dependencies and scripts
- **`.env` variables**: Set through Railway dashboard, not files

## 🎯 **AI Generation Features**

### **Supported Blueprint Types:**
- **Vision**: Inspiring vision statements
- **SWOT**: Balanced strategic analysis  
- **Epic**: User-centered epic descriptions
- **Technical Requirements**: System specifications
- **Business Model**: Business strategy components
- **OKR**: Measurable objectives and key results

### **Generation Process:**
1. **User Request**: Click "AI Generate" in strategy card
2. **Context Analysis**: Extract card title and type
3. **Prompt Selection**: Choose blueprint-specific AI prompt
4. **OpenAI Call**: Generate content via GPT-3.5-turbo
5. **Response Processing**: Format and validate output
6. **Field Population**: Update card fields automatically

## 🚨 **Common Issues & Solutions**

### **Railway Deployment Issues:**
- **Problem**: Build failures with TypeScript errors
- **Solution**: Railway runs `server-simple.js` (JavaScript), not TypeScript
- **Check**: Ensure start command is `node server-simple.js`

### **Connection Issues:**
- **Problem**: Frontend can't reach Railway
- **Solution**: Verify `MCP_SERVER_URL` environment variable in Vercel
- **Test**: `https://pinnlo-v2-production.up.railway.app/health`

### **AI Generation Failures:**
- **Problem**: OpenAI API errors
- **Solution**: Check `OPENAI_API_KEY` in Railway environment variables
- **Fallback**: Server provides template content when OpenAI fails

## 📋 **New Engineer Checklist**

### **Access Required:**
- [ ] GitHub repository access (`fitzy2807/pinnlo-v2`)
- [ ] Vercel team access (pinnlo organization)
- [ ] Railway project access
- [ ] OpenAI API key access (for local development)
- [ ] Supabase project access

### **Local Setup:**
- [ ] Clone repository: `git clone https://github.com/fitzy2807/pinnlo-v2`
- [ ] Install dependencies: `npm install` (root) and `cd supabase-mcp && npm install`
- [ ] Copy environment variables for local development
- [ ] Test frontend: `npm run dev` (localhost:3000)
- [ ] Test AI backend: `cd supabase-mcp && npm run dev` (localhost:3001)

### **Verification:**
- [ ] Can access live app: `https://pinnlo-v2-c9z6hf8zr-pinnlo.vercel.app`
- [ ] Can access Railway health: `https://pinnlo-v2-production.up.railway.app/health`
- [ ] Can test AI Generate button in live app
- [ ] Can view deployment logs in both Vercel and Railway dashboards

## 🎓 **Key Concepts**

### **MCP (Model Context Protocol):**
- Framework for AI model interactions
- Handles context gathering and prompt management
- Enables sophisticated AI workflows

### **Blueprint Types:**
- Strategy card templates (vision, SWOT, epic, etc.)
- Each has specific AI prompts and field structures
- Determines what content gets generated

### **Auto-Save System:**
- Real-time saving of strategy card edits
- Prevents data loss during AI generation
- Integrates with existing card management system

This architecture provides a scalable, reliable foundation for AI-powered strategic planning with clear separation of concerns between frontend/API (Vercel) and AI processing (Railway).
