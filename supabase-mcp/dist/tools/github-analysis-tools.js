var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
export const githubAnalysisTools = {
    /**
     * Analyze GitHub repository for comprehensive tech stack detection
     */
    analyze_github_repository: {
        description: "Analyze a GitHub repository to detect technology stack and generate tech stack cards",
        inputSchema: {
            type: "object",
            properties: {
                repository_url: {
                    type: "string",
                    description: "GitHub repository URL or owner/repo format"
                },
                github_token: {
                    type: "string",
                    description: "GitHub Personal Access Token"
                },
                analysis_depth: {
                    type: "string",
                    enum: ["basic", "standard", "comprehensive"],
                    default: "standard",
                    description: "Depth of analysis to perform"
                },
                focus_areas: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific areas to focus on (e.g., 'frontend', 'backend', 'database', 'devops')"
                },
                user_id: {
                    type: "string",
                    description: "User ID for tracking and personalization"
                }
            },
            required: ["repository_url", "github_token", "user_id"]
        },
        handler: async ({ repository_url, github_token, analysis_depth = "standard", focus_areas = [], user_id }) => {
            try {
                const env_2 = { stack: [], error: void 0, hasError: false };
                try {
                    // Parse repository URL
                    const repoInfo = parseRepositoryUrl(repository_url);
                    if (!repoInfo) {
                        throw new Error("Invalid repository URL format");
                    }
                    // Initialize GitHub API client
                    const github = {
                        headers: {
                            'Authorization': `Bearer ${github_token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'PINNLO-MCP-Agent'
                        }
                    };
                    // Get repository information
                    const repoResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, {
                        headers: github.headers
                    });
                    if (!repoResponse.ok) {
                        throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
                    }
                    const repository = await repoResponse.json();
                    // Get repository contents
                    const contentsResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${repository.default_branch}?recursive=true`, {
                        headers: github.headers
                    });
                    if (!contentsResponse.ok) {
                        throw new Error(`Failed to fetch repository contents: ${contentsResponse.status}`);
                    }
                    const contents = await contentsResponse.json();
                    console.log('🔄 MCP: Starting repository analysis with', contents.tree?.length || 0, 'files');
                    // Analyze repository structure and detect technologies
                    const analysis = await analyzeRepositoryStructure(repository, contents.tree || [], github, analysis_depth, focus_areas);
                    console.log('🔬 MCP: Repository analysis completed:', {
                        files_analyzed: analysis.files_analyzed,
                        dependencies_count: Object.keys(analysis.dependencies || {}).length,
                        frameworks_count: analysis.frameworks?.length || 0,
                        package_files_count: analysis.package_files?.length || 0
                    });
                    // Generate system prompt for AI-powered tech stack generation
                    const systemPrompt = `You are a technical analyst creating accurate tech stack cards based on real GitHub repository analysis.

CRITICAL REQUIREMENTS:
1. ONLY use technologies that are actually found in the repository analysis
2. Use exact version numbers from package.json when available
3. Format as: "Technology-Version" (e.g., "Next.js-14.2.3", "React-18.3.1")
4. Do not hallucinate or add technologies not present in the analysis
5. Categorize technologies correctly based on their actual usage

OUTPUT FORMAT (JSON):
{
  "card_title": "Repository Name Technology Stack",
  "description": "Brief description of the technology stack",
  "stack_name": "Repository Name",
  "stack_type": "Web Application",
  "architecture_pattern": "Next.js App Router",
  "primary_use_case": "Description of primary use case",
  "last_updated": "2024-01-01",
  "technologies": {
    "frontend": ["Next.js-14.2.3", "React-18.3.1"],
    "backend": ["Node.js", "Next.js-API-Routes"],
    "database": ["PostgreSQL", "Supabase"],
    "infrastructure": ["Vercel", "GitHub-Actions"],
    "platforms": ["Supabase-Platform", "Vercel-Platform"],
    "ai": ["OpenAI-GPT-4", "Claude-3"],
    "development": ["TypeScript-5.5.4", "ESLint-8.57.0"],
    "integrations": ["GitHub-Actions", "Webhooks"]
  },
  "analysis_metadata": {
    "files_analyzed": 220,
    "dependencies_analyzed": 457,
    "method": "AI-powered analysis",
    "confidence": "95%"
  }
}

Repository Context:
- Name: ${repository.name}
- Description: ${repository.description || 'No description provided'}
- Primary Language: ${repository.language || 'Not specified'}
- Size: ${repository.size} KB
- Analysis Depth: ${analysis_depth}
- Focus Areas: ${focus_areas.join(', ') || 'General analysis'}`;
                    #;
                    #;
                    Phase;
                    1;
                    Comprehensive;
                    File;
                    Reading;
                    Strategy;
                    #;
                    #;
                    #;
                    Step;
                    1;
                    Critical;
                    Configuration;
                    Analysis
                        ** Read;
                    these;
                    files;
                    FIRST;
                    and;
                    analyze;
                    carefully:  **
                        1. ** Package;
                    Management;
                    Files **
                        -package.json(get, exact, versions, from, dependencies, AND, devDependencies)
                        - package - lock.json();
                    for (actual; installed; versions)
                        -yarn.lock, pnpm - lock.yaml(alternative, lock, files)
                            - requirements.txt, setup.py, pyproject.toml(Python)
                            - Gemfile, composer.json, go.mod, Cargo.toml(other, languages);
                    2. ** Framework;
                    Configuration;
                    Files **
                        `` `
   - next.config.js (Next.js configuration)
   - nuxt.config.js (Nuxt.js configuration)  
   - vue.config.js (Vue.js configuration)
   - angular.json (Angular configuration)
   - tsconfig.json (TypeScript configuration)
   - tailwind.config.js/ts (Tailwind CSS configuration)
   - vite.config.js (Vite configuration)
   - webpack.config.js (Webpack configuration)
   ` ``;
                    3. ** Environment;
                    and;
                    Service;
                    Configuration **
                        `` `
   - .env, .env.local, .env.production (environment variables)
   - supabase/config.toml (Supabase configuration)
   - firebase.json (Firebase configuration)
   - vercel.json, netlify.toml (deployment configuration)
   ` ``;
                    #;
                    #;
                    #;
                    Step;
                    2;
                    Architecture;
                    Detection;
                    Through;
                    File;
                    Structure;
                    Analysis
                        ** Analyze;
                    these;
                    patterns;
                    to;
                    understand;
                    the;
                    REAL;
                    architecture:  **
                        1. ** Backend;
                    Architecture;
                    Detection;
                    Rules **
                        `` `
   IF src/app/api/ exists = Next.js 13+ App Router API Routes
   IF src/pages/api/ exists = Next.js Pages Router API Routes  
   IF server/ or backend/ with package.json = Separate backend service
   IF express in dependencies + server files = Express.js backend
   IF fastapi imports in Python files = FastAPI backend
   IF requirements.txt with django = Django backend
   IF app.rb or Gemfile with rails = Ruby on Rails
   IF main.go or go.mod = Go backend
   ` ``;
                    2. ** Frontend;
                    Architecture;
                    Detection;
                    Rules **
                        `` `
   IF src/app/ + next.config.js = Next.js 13+ App Router
   IF src/pages/ + next.config.js = Next.js Pages Router
   IF src/components/ + package.json with react = React app
   IF src/ + vue.config.js = Vue.js app
   IF src/ + angular.json = Angular app
   IF svelte.config.js = Svelte app
   ` ``;
                    3. ** Database;
                    Detection;
                    Rules **
                        `` `
   IF supabase/ folder exists = Supabase PostgreSQL
   IF prisma/ folder exists = Prisma ORM
   IF drizzle.config.ts exists = Drizzle ORM
   IF src/lib/*supabase*.ts = Supabase client integration
   IF src/lib/*prisma*.ts = Prisma client integration
   IF mongoose in dependencies = MongoDB with Mongoose
   IF pg in dependencies = PostgreSQL
   ` ``;
                    #;
                    #;
                    #;
                    Step;
                    3;
                    Advanced;
                    Technology;
                    Detection;
                    Patterns;
                    1. ** Authentication;
                    System;
                    Detection **
                        `` `
   IF @supabase/auth in dependencies = Supabase Auth
   IF next-auth in dependencies = NextAuth
   IF @auth0/ packages = Auth0
   IF @clerk/ packages = Clerk
   IF firebase/auth imports = Firebase Auth
   IF middleware.ts with auth patterns = Custom auth middleware
   ` ``;
                    2. ** AI / ML;
                    Integration;
                    Detection **
                        `` `
   Search environment files for:
   - OPENAI_API_KEY = OpenAI integration
   - ANTHROPIC_API_KEY = Anthropic Claude
   - HUGGINGFACE_API_KEY = Hugging Face
   - REPLICATE_API_TOKEN = Replicate
   
   Search for API calls in code:
   - openai.chat.completions = OpenAI GPT usage
   - anthropic.completions = Claude usage
   - MCP_SERVER_URL = Model Context Protocol
   ` ``;
                    3. ** State;
                    Management;
                    Detection **
                        `` `
   IF zustand in dependencies = Zustand state management
   IF @reduxjs/toolkit in dependencies = Redux Toolkit
   IF @tanstack/react-query = React Query/TanStack Query
   IF contexts/ folder with React context = React Context API
   IF valtio in dependencies = Valtio
   ` ``;
                    #;
                    #;
                    Phase;
                    2;
                    Accurate;
                    Version;
                    Extraction;
                    Rules;
                    #;
                    #;
                    #;
                    Version;
                    Detection;
                    Priority `` `
1. FIRST: Check package-lock.json for exact installed versions
2. SECOND: Check package.json for declared versions  
3. THIRD: Remove version prefixes (^, ~, >=) for clean versions
4. NEVER: Guess or assume versions
` ``;
                    #;
                    #;
                    #;
                    Framework - Specific;
                    Version;
                    Rules `` `
React: Extract from "react" in dependencies
Next.js: Extract from "next" in dependencies
TypeScript: Extract from "typescript" in devDependencies
Tailwind: Extract from "tailwindcss" in devDependencies
Node.js: Extract from "engines" field or assume latest LTS if not specified
` ``;
                    #;
                    #;
                    Phase;
                    3;
                    Technology;
                    Categorization;
                    Rules;
                    #;
                    #;
                    #;
                    Frontend;
                    Technologies(Only, include);
                    if ( in dependencies)
                        `` `
Core Frameworks:
- React, Vue, Angular, Svelte, Solid
- Next.js, Nuxt.js, Remix, Gatsby

UI Libraries:
- @headlessui/react, @radix-ui/*, @mui/material, @chakra-ui/react
- react-bootstrap, antd, @mantine/core

Styling:
- tailwindcss, styled-components, @emotion/react, sass

Icons & Graphics: 
- lucide-react, react-icons, heroicons, @tabler/icons

Animation:
- framer-motion, react-spring, @react-spring/web

Forms & Validation:
- react-hook-form, formik, @hookform/resolvers

Notifications:
- react-hot-toast, react-toastify, @radix-ui/react-toast
` ``;
                    #;
                    #;
                    #;
                    Backend;
                    Technologies(Detect, actual, architecture) `` `
IF Next.js API routes detected:
- Backend: ["Next.js-API-Routes", "Node.js-Runtime"]
- NOT: Express.js (unless separate Express server found)

IF Express.js server detected:
- Backend: ["Express.js", "Node.js"]

IF Supabase integration detected:
- Backend: ["Supabase-Auth", "Supabase-Edge-Functions", "Supabase-Realtime"]

IF Separate backend service:
- Check language and framework in backend folder
` ``;
                    #;
                    #;
                    #;
                    Database;
                    Technologies(Based, on, actual, configuration) `` `
IF supabase configuration found:
- Database: ["PostgreSQL", "Supabase", "Row-Level-Security"]

IF prisma configuration found:
- Database: ["PostgreSQL/MySQL/SQLite", "Prisma-ORM"]

IF drizzle configuration found:
- Database: ["PostgreSQL/MySQL/SQLite", "Drizzle-ORM"]

IF mongodb connection found:
- Database: ["MongoDB", "Mongoose"] (if mongoose used)
` ``;
                    #;
                    #;
                    #;
                    AI / ML;
                    Technologies(Verify, through, actual, usage) `` `
IF OpenAI API key + API calls found:
- AI: ["OpenAI-GPT-4", "OpenAI-GPT-3.5-Turbo"] (specify model if found)

IF Anthropic API key + API calls found:
- AI: ["Anthropic-Claude"]

IF MCP references found:
- AI: ["Model-Context-Protocol", "MCP-Server"]

IF Langchain imports found:
- AI: ["LangChain"]
` ``;
                    #;
                    #;
                    Phase;
                    4;
                    Critical;
                    Accuracy;
                    Validation;
                    #;
                    #;
                    #;
                    Architecture;
                    Validation;
                    Rules `` `
1. NEVER include Express.js if only Next.js API routes exist
2. NEVER include Prisma if only Supabase client is used
3. NEVER include Redis unless connection code is found
4. NEVER include Docker unless Dockerfile exists
5. ALWAYS verify backend claims by checking actual file structure
` ``;
                    #;
                    #;
                    #;
                    Version;
                    Accuracy;
                    Rules `` `
1. Extract versions from package.json, removing ^ and ~ prefixes
2. Cross-reference with package-lock.json when available
3. Use "latest" only when version cannot be determined
4. Include major version number at minimum (e.g., "React-18" not just "React")
` ``;
                    #;
                    #;
                    #;
                    Exclusion;
                    Rules `` `
Exclude technologies that are:
- Only mentioned in comments or documentation
- In devDependencies but not actually used
- Legacy dependencies that aren't actively used
- Placeholder or example configurations
` ``;
                    #;
                    #;
                    Analysis;
                    Data;
                    Available: The;
                    repository;
                    analysis;
                    contains: -files_analyzed;
                    Number;
                    of;
                    files;
                    processed
                        - package_files;
                    Array;
                    of;
                    dependency;
                    files(package.json, requirements.txt, etc.)
                        - dependencies;
                    Object;
                    with (dependency)
                        name - version;
                    pairs
                        - frameworks;
                    Array;
                    of;
                    detected;
                    frameworks
                        - tools;
                    Array;
                    of;
                    detected;
                    development;
                    tools
                        - architecture_patterns;
                    Array;
                    of;
                    detected;
                    patterns
                        - languages;
                    Object;
                    with (language)
                        usage;
                    statistics;
                    #;
                    #;
                    Tech;
                    Stack;
                    Card;
                    Fields;
                    to;
                    Complete: #;
                    #;
                    #;
                    1. ** Card;
                    Title **
                        Generate;
                    a;
                    descriptive;
                    title in format;
                    "[Project Name] Technology Stack";
                    or;
                    "[Repository Name] Tech Stack";
                    #;
                    #;
                    #;
                    2. ** Description **
                        Write;
                    a;
                    1 - 2;
                    sentence;
                    description;
                    of;
                    what;
                    this;
                    technology;
                    stack;
                    powers, based;
                    on;
                    README;
                    or;
                    project;
                    purpose.
                    ;
                    #;
                    #;
                    #;
                    3. ** Stack;
                    Name **
                        Use;
                    the;
                    repository;
                    name;
                    or;
                    project;
                    name;
                    found in package.json, README, or;
                    similar;
                    files.
                    ;
                    #;
                    #;
                    #;
                    4. ** Stack;
                    Type **
                        Choose;
                    from: Web;
                    Application | Mobile;
                    Application | API;
                    Service | Microservice | Library | CLI;
                    Tool | Full - Stack;
                    Application | Frontend;
                    Only | Backend;
                    Only | Data;
                    Pipeline | Infrastructure;
                    #;
                    #;
                    #;
                    5. ** Architecture;
                    Pattern **
                        Identify;
                    from: Monolithic | Microservices | Serverless | JAMstack | MVC | MVVM | Event - Driven | RESTful | GraphQL | Hexagonal | Clean;
                    Architecture | Domain - Driven;
                    Design;
                    #;
                    #;
                    #;
                    6. ** Primary;
                    Use;
                    Case **
                        Describe;
                    the;
                    business;
                    purpose in one;
                    sentence;
                    based;
                    on;
                    README, descriptions, or;
                    code;
                    analysis.
                    ;
                    #;
                    #;
                    #;
                    7. ** Last;
                    Updated **
                        Use;
                    the;
                    most;
                    recent;
                    commit;
                    date;
                    from;
                    the;
                    repository.
                    ;
                    #;
                    #;
                    #;
                    8. ** Frontend **
                        Extract;
                    frontend;
                    technologies;
                    from;
                    the;
                    dependencies;
                    object;
                    and;
                    frameworks;
                    array.Return;
                    of;
                    strings: -React, Vue, Angular, Next.js, Nuxt.js;
                    from;
                    dependencies
                        - CSS;
                    frameworks;
                    like;
                    Tailwind, Bootstrap;
                    from;
                    dependencies
                        - Build;
                    tools;
                    like;
                    Webpack, Vite;
                    from;
                    dependencies;
                    Format: ["Framework-Version", "Library-Version"];
                    const exact = __addDisposableResource(env_2, void 0, false), versions = __addDisposableResource(env_2, void 0, false), from = __addDisposableResource(env_2, void 0, false), dependencies = __addDisposableResource(env_2, void 0, false), object = __addDisposableResource(env_2, void 0, false);
                    #;
                    #;
                    #;
                    9. ** Backend **
                        Extract;
                    backend;
                    technologies;
                    from;
                    dependencies;
                    and;
                    frameworks;
                    arrays.Return;
                    of;
                    strings: -Server;
                    frameworks: Express, Fastify, NestJS, Django, Flask
                        - Runtime;
                    environments;
                    inferred;
                    from;
                    dependencies
                        - API;
                    frameworks;
                    and;
                    tools;
                    Format: ["Framework-Version", "Runtime-Version"];
                    const actual = __addDisposableResource(env_2, void 0, false), dependency = __addDisposableResource(env_2, void 0, false), versions = __addDisposableResource(env_2, void 0, false);
                    #;
                    #;
                    #;
                    10. ** Database **
                        Extract;
                    database;
                    technologies;
                    from;
                    dependencies;
                    object.Return;
                    of;
                    strings: -Database;
                    clients: mysql2, pg, mongodb, redis
                        - ORMs;
                    prisma, sequelize, mongoose, drizzle
                        - Connection;
                    pools;
                    and;
                    adapters
                        - Docker;
                    compose;
                    files
                        - Connection;
                    configs;
                    Format: Database - Version, ORM - Library(e.g., PostgreSQL - 15, Prisma - 5.0, .0, Redis - 7.0);
                    #;
                    #;
                    #;
                    11. ** Infrastructure **
                        Look;
                    for (deployment; and; hosting)
                        indicators: -Dockerfile, docker - compose.yml
                            - CI / CD;
                    config;
                    files
                        - Cloud;
                    provider;
                    configs
                        - Deployment;
                    scripts;
                    Format: Platform, Tool - Version(e.g., Vercel, Docker, GitHub - Actions, AWS - Lambda);
                    #;
                    #;
                    #;
                    12. ** Platforms **
                        Identify;
                    enterprise / SaaS;
                    platforms;
                    from: -API;
                    integrations
                        - SDK;
                    imports
                        - Config;
                    files;
                    Format: Platform - Name(e.g., Salesforce, Stripe, Auth0, Twilio);
                    #;
                    #;
                    #;
                    13. ** AI **
                        Search;
                    for (AI / ML; related; dependencies)
                        : -OpenAI, Anthropic, Hugging;
                    Face;
                    libraries
                        - LangChain, vector;
                    databases
                        - ML;
                    frameworks;
                    Format: Service - Version, Library - Version(e.g., OpenAI - 4.0, .0, LangChain - 0.1, .0, Pinecone - Client);
                    #;
                    #;
                    #;
                    14. ** Development **
                        List;
                    development;
                    tools;
                    from: -devDependencies in package.json
                        - Linter;
                    configs
                        - Test;
                    frameworks
                        - Build;
                    tools;
                    Format: Tool - Version(e.g., TypeScript - 5.0, .0, Jest - 29.0, .0, ESLint - 8.0, .0, Webpack - 5.0, .0);
                    #;
                    #;
                    #;
                    15. ** Integrations **
                        External;
                    services;
                    and;
                    APIs;
                    found in ;
                    -Environment;
                    variable;
                    examples
                        - API;
                    client;
                    libraries
                        - Service;
                    configurations;
                    Format: Service - Purpose(e.g., Stripe - Payments, SendGrid - Email, Datadog - Monitoring);
                    #;
                    #;
                    #;
                    16. ** Key;
                    Decisions **
                        Infer;
                    2 - 3;
                    major;
                    technology;
                    choices;
                    based;
                    on: -Uncommon;
                    technology;
                    selections
                        - Multiple;
                    options;
                    available;
                    but;
                    specific;
                    choice;
                    made
                        - Architecture;
                    patterns;
                    Format: "Chose [Technology] over [Alternative] for [Reason]";
                    #;
                    #;
                    #;
                    17. ** Migration;
                    Notes **
                        Look;
                    for (; ; )
                        : -TODO;
                    comments;
                    about;
                    upgrades
                        - Deprecated;
                    dependency;
                    warnings
                        - Version;
                    compatibility;
                    notes
                        - Upgrade;
                    guides in docs;
                    Format: "Plan to migrate from [Current] to [Target] for [Reason]";
                    #;
                    #;
                    Analysis;
                    Instructions: 1. ** Version;
                    Specificity ** ;
                    Always;
                    include;
                    version;
                    numbers;
                    when;
                    available;
                    from;
                    lock;
                    files;
                    or;
                    configs;
                    2. ** Evidence - Based ** ;
                    Only;
                    include;
                    technologies;
                    you;
                    can;
                    verify;
                    from;
                    files;
                    3. ** Hyphenated;
                    Format ** ;
                    Use;
                    Technology - Version;
                    format;
                    with (hyphens, not)
                        spaces;
                    4. ** Comma;
                    Separation ** ;
                    Separate;
                    multiple;
                    items;
                    with (commas)
                        5. ** Business;
                    Context ** ;
                    Infer;
                    use;
                }
                catch (e_2) {
                    env_2.error = e_2;
                    env_2.hasError = true;
                }
                finally {
                    __disposeResources(env_2);
                }
            }
            finally { }
        }, case: from, README, package, : .json, description, or, code, purpose,
        6.:  ** Current, State
    } ** , Focus, on, what, 's currently in use, not planned features: #, #: Example, Analysis, Pattern: When, you, find, a, package, : .json, with: React, analyze, like, this: Frontend, React
} - 18.2;
.0, Next.js - 14.0;
.0, TypeScript - 5.2;
.0, Tailwind - CSS - 3.3;
.0, Zustand - 4.4;
.0;
When;
you;
find;
infrastructure;
files: Infrastructure: Vercel, Docker, GitHub - Actions, CloudFlare - CDN, Sentry - Error - Tracking;
#;
#;
Priority;
Analysis;
Order: 1.;
package.json / requirements.txt / Gemfile(dependencies);
2.;
Lock;
files(exact, versions);
3.;
Configuration;
files(tools, and, services);
4.;
README.md(business, context);
5.;
Docker / CI;
files(infrastructure);
6.;
Source;
code;
imports(verify, usage);
Remember: Be;
specific, use;
exact;
versions, and;
maintain;
the;
hyphenated;
format;
throughout.
;
Repository;
Context: -Name;
$;
{
    repository.name;
}
-Description;
$;
{
    repository.description || 'No description provided';
}
-Primary;
Language: $;
{
    repository.language || 'Not specified';
}
-Size;
$;
{
    repository.size;
}
KB
    - Analysis;
Depth: $;
{
    analysis_depth;
}
-Focus;
Areas: $;
{
    focus_areas.join(', ') || 'General analysis';
}
`;

        const userPrompt = `;
STRICT;
INSTRUCTION: Generate;
a;
JSON;
response;
/**
 * Parse package file to extract dependencies
 */
function parsePackageFile(filePath, content) {
    try {
        if (filePath.endsWith('package.json')) {
            const pkg = JSON.parse(content);
            return {
                ...pkg.dependencies || {},
                ...pkg.devDependencies || {},
                ...pkg.peerDependencies || {}
            };
        }
        else if (filePath.endsWith('requirements.txt')) {
            return content.split('\n')
                .filter(line => line.trim() && !line.startsWith('#'))
                .reduce((deps, line) => {
                const [name] = line.split(/[>=<]/);
                deps[name.trim()] = line.trim();
                return deps;
            }, {});
        }
        // Add more package file parsers as needed
        return {};
    }
    catch (error) {
        return {};
    }
}
/**
 * Detect frameworks from dependencies and files
 */
function detectFrameworks(dependencies, files) {
    const frameworks = [];
    // Frontend frameworks
    if (dependencies['react'])
        frameworks.push('React');
    if (dependencies['vue'])
        frameworks.push('Vue.js');
    if (dependencies['@angular/core'])
        frameworks.push('Angular');
    if (dependencies['svelte'])
        frameworks.push('Svelte');
    if (dependencies['next'])
        frameworks.push('Next.js');
    if (dependencies['nuxt'])
        frameworks.push('Nuxt.js');
    if (dependencies['gatsby'])
        frameworks.push('Gatsby');
    // Backend frameworks
    if (dependencies['express'])
        frameworks.push('Express.js');
    if (dependencies['fastify'])
        frameworks.push('Fastify');
    if (dependencies['@nestjs/core'])
        frameworks.push('NestJS');
    if (dependencies['koa'])
        frameworks.push('Koa');
    if (dependencies['django'])
        frameworks.push('Django');
    if (dependencies['flask'])
        frameworks.push('Flask');
    if (dependencies['rails'])
        frameworks.push('Ruby on Rails');
    // Mobile frameworks
    if (dependencies['react-native'])
        frameworks.push('React Native');
    if (dependencies['@ionic/react'])
        frameworks.push('Ionic');
    if (dependencies['flutter'])
        frameworks.push('Flutter');
    // CSS frameworks
    if (dependencies['tailwindcss'])
        frameworks.push('Tailwind CSS');
    if (dependencies['bootstrap'])
        frameworks.push('Bootstrap');
    if (dependencies['@mui/material'])
        frameworks.push('Material-UI');
    return [...new Set(frameworks)];
}
/**
 * Detect tools from dependencies and files
 */
function detectTools(dependencies, files) {
    const tools = [];
    // Build tools
    if (dependencies['webpack'])
        tools.push('Webpack');
    if (dependencies['vite'])
        tools.push('Vite');
    if (dependencies['rollup'])
        tools.push('Rollup');
    if (dependencies['parcel'])
        tools.push('Parcel');
    // Testing tools
    if (dependencies['jest'])
        tools.push('Jest');
    if (dependencies['vitest'])
        tools.push('Vitest');
    if (dependencies['cypress'])
        tools.push('Cypress');
    if (dependencies['playwright'])
        tools.push('Playwright');
    // Linting/Formatting
    if (dependencies['eslint'])
        tools.push('ESLint');
    if (dependencies['prettier'])
        tools.push('Prettier');
    if (dependencies['typescript'])
        tools.push('TypeScript');
    // Deployment/Infrastructure
    if (files.some(f => f.path.toLowerCase().includes('dockerfile')))
        tools.push('Docker');
    if (files.some(f => f.path.toLowerCase().includes('docker-compose')))
        tools.push('Docker Compose');
    if (files.some(f => f.path.toLowerCase().includes('.github/workflows')))
        tools.push('GitHub Actions');
    if (files.some(f => f.path.toLowerCase().includes('vercel.json')))
        tools.push('Vercel');
    if (files.some(f => f.path.toLowerCase().includes('netlify.toml')))
        tools.push('Netlify');
    return [...new Set(tools)];
}
/**
 * Detect architecture patterns from file structure
 */
function detectArchitecturePatterns(files) {
    const patterns = [];
    // MVC pattern
    if (files.some(f => f.path.includes('/models/')) &&
        files.some(f => f.path.includes('/views/')) &&
        files.some(f => f.path.includes('/controllers/'))) {
        patterns.push('MVC (Model-View-Controller)');
    }
    // Component-based architecture
    if (files.some(f => f.path.includes('/components/'))) {
        patterns.push('Component-Based Architecture');
    }
    // Microservices
    if (files.some(f => f.path.includes('/services/')) &&
        files.some(f => f.path.toLowerCase().includes('docker'))) {
        patterns.push('Microservices');
    }
    // API-first
    if (files.some(f => f.path.includes('/api/')) ||
        files.some(f => f.path.includes('/routes/'))) {
        patterns.push('API-First Architecture');
    }
    // Monorepo
    if (files.some(f => f.path.includes('packages/')) ||
        files.some(f => f.path.includes('apps/'))) {
        patterns.push('Monorepo');
    }
    return patterns;
}
/**
 * Count programming languages based on file extensions
 */
function countLanguages(files) {
    const languages = {};
    for (const file of files) {
        const ext = file.path.split('.').pop()?.toLowerCase();
        if (!ext)
            continue;
        const language = getLanguageFromExtension(ext);
        if (language) {
            languages[language] = (languages[language] || 0) + 1;
        }
    }
    return languages;
}
/**
 * Map file extension to programming language
 */
function getLanguageFromExtension(ext) {
    const extensionMap = {
        'js': 'JavaScript',
        'jsx': 'JavaScript',
        'ts': 'TypeScript',
        'tsx': 'TypeScript',
        'py': 'Python',
        'rb': 'Ruby',
        'php': 'PHP',
        'java': 'Java',
        'kt': 'Kotlin',
        'scala': 'Scala',
        'go': 'Go',
        'rs': 'Rust',
        'cpp': 'C++',
        'c': 'C',
        'cs': 'C#',
        'fs': 'F#',
        'swift': 'Swift',
        'dart': 'Dart',
        'elm': 'Elm',
        'clj': 'Clojure',
        'cljs': 'ClojureScript',
        'vue': 'Vue',
        'svelte': 'Svelte'
    };
    return extensionMap[ext] || null;
}
var ONLY, the, dependencies, listed, below, Do, NOT, use, any, assumed, or, template, data, ACTUAL, DEPENDENCIES, FROM, REPOSITORY, JSON, stringify, filesystem, or, filesystem, data;
export let handleAnalyzeGitHubRepository, handleGenerateTechStackCardsFromGitHub;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    (Object.keys(analysis.dependencies || {}).slice(0, 50));
    ACTUAL;
    FRAMEWORKS;
    DETECTED: $;
    {
        JSON.stringify(analysis.frameworks || []);
    }
    REPOSITORY;
    INFORMATION: -Name;
    $;
    {
        repository.name;
    }
    -Updated;
    $;
    {
        repository.updated_at;
    }
    -Language;
    $;
    {
        repository.language;
    }
    STEP - BY - STEP;
    ANALYSIS: 1.;
    Frontend: Look;
    for ("next", "react", "tailwindcss" in dependencies)
        2.;
    Backend: Check;
    if ("express")
        exists, otherwise;
    use;
    "Next.js-API-Routes";
    3.;
    Database: Look;
    for ("@supabase/supabase-js", "prisma", "pg", "mongodb"; 4.; Infrastructure)
        : Check;
    for ("vercel", "docker", deployment; files; 5.)
        AI: Look;
    for ("openai", "@anthropic", "langchain"; GENERATE; JSON)
        RESPONSE: {
            "card_title";
            "${repository.name} Technology Stack",
                "description";
            "${repository.description || 'Technology stack analysis'}",
                "stack_name";
            "${repository.name}",
                "stack_type";
            "Web Application",
                "architecture_pattern";
            "Next.js App Router",
                "primary_use_case";
            "${repository.description || 'Web application'}",
                "last_updated";
            "${repository.updated_at}",
                "technologies";
            {
                "frontend";
                ["Next.js-14", "React-18", "TypeScript", "Tailwind-CSS"],
                    "backend";
                ["Next.js-API-Routes", "Supabase-Auth"],
                    "database";
                ["PostgreSQL", "Supabase"],
                    "infrastructure";
                ["Vercel", "GitHub-Actions"],
                    "platforms";
                ["Supabase-Platform"],
                    "ai";
                ["OpenAI-API", "MCP-Protocol"],
                    "development";
                ["TypeScript", "ESLint", "Jest"];
            }
        }
    Use;
    ONLY;
    technologies;
    that;
    exist in the;
    dependencies;
    list;
    above.Replace;
    with (actual)
        versions;
    if (found.
    )
        #;
    #;
    Phase;
    5;
    Output;
    Format;
    with (Verification `` `json
{
  "card_title": "[Repository Name] Technology Stack",
  "description": "Brief description based on README or code analysis",
  "stack_name": "repository-name",
  "stack_type": "Web-Application | Mobile-App | API-Service | etc.",
  "architecture_pattern": "Component-Based | Microservices | Monolithic | etc.",
  "primary_use_case": "Business purpose from README or code analysis",
  "last_updated": "YYYY-MM-DD",
  "technologies": {
    "frontend": ["React-18.0.0", "Next.js-14.2.30", "TypeScript-5.0.0"],
    "backend": ["Next.js-API-Routes", "Supabase-Auth"],
    "database": ["PostgreSQL", "Supabase", "Row-Level-Security"],
    "infrastructure": ["Vercel", "GitHub-Actions"],
    "platforms": ["GitHub", "Vercel-Platform", "Supabase-Platform"],
    "ai": ["OpenAI-GPT-4", "Model-Context-Protocol"],
    "development": ["Jest-30.0.0", "ESLint-8.0.0", "TypeScript-5.0.0"]
  },
  "key_decisions": [
    "Technology choice explanations based on actual usage patterns"
  ],
  "migration_notes": [
    "Upgrade plans or recent changes identified in code"
  ],
  "analysis_metadata": {
    "files_analyzed": 150,
    "confidence_level": "95%",
    "verification_methods": [
      "Package.json version extraction",
      "File structure analysis", 
      "Environment variable detection",
      "API endpoint analysis"
    ],
    "excluded_technologies": [
      "Express.js - Only Next.js API routes detected",
      "Prisma - Supabase client used instead"
    ]
  }
}
` ``)
        #;
    #;
    Implementation;
    Success;
    Criteria;
    #;
    #;
    #;
    Accuracy;
    Indicators
        - ;
    All;
    versions;
    extracted;
    from;
    actual;
    package;
    files
        - ;
    Backend;
    architecture;
    matches;
    file;
    structure;
    analysis
        - ;
    Database;
    technologies;
    confirmed;
    through;
    configuration;
    files
        - ;
    AI;
    integrations;
    verified;
    through;
    environment;
    variables;
    and;
    API;
    calls
        - ;
    No;
    phantom;
    technologies(e.g., Express, when, using, Next.js, API)
        - ;
    Authentication;
    system;
    correctly;
    identified
        - ;
    Deployment;
    platform;
    detected;
    through;
    configuration;
    #;
    #;
    #;
    Quality;
    Validation
        - ;
    Cross - reference;
    multiple;
    sources;
    for (technology; detection
        - ; )
        ;
    Validate;
    claimed;
    technologies;
    through;
    actual;
    code;
    usage
        - ;
    Document;
    excluded;
    technologies;
    with (reasons
        - )
        ;
    Provide;
    confidence;
    level;
    based;
    on;
    analysis;
    depth
        - ;
    Include;
    verification;
    methods;
    used;
    Remember: Your;
    goal;
    is;
    COMPLETE;
    ACCURACY;
    based;
    on;
    actual;
    code;
    analysis, not;
    assumptions;
    or;
    common;
    patterns.Every;
    technology;
    listed;
    must;
    be;
    verified;
    through;
    actual;
    file;
    analysis.
    ;
    #;
    #;
    Phase;
    4;
    Quality;
    Assurance;
    #;
    #;
    #;
    Verification;
    Steps: -Completeness;
    Check: Ensure;
    all;
    major;
    directories;
    were;
    explored
        - Version;
    Accuracy: Cross - reference;
    versions;
    from;
    multiple;
    sources
        - Pattern;
    Validation: Confirm;
    architectural;
    patterns;
    match;
    code;
    structure
        - Dependency;
    Verification: Ensure;
    all;
    major;
    dependencies;
    are;
    captured;
    #;
    #;
    #;
    Error;
    Handling: -If;
    files;
    cannot;
    be;
    read, document in analysis_metadata
        - If;
    versions;
    are;
    unclear, indicate;
    with ("latest")
        or;
    "unknown"
        - If;
    architecture;
    patterns;
    are;
    ambiguous, list;
    multiple;
    possibilities;
    #;
    #;
    Implementation;
    Instructions
        - Always;
    start;
    with (filesystem)
        : list_allowed_directories;
    to;
    understand;
    available;
    paths
        - Use;
    filesystem: directory_tree;
    to;
    get;
    complete;
    repository;
    structure
        - Read;
    files;
    systematically;
    filesystem = __addDisposableResource(env_1, void 0, false), or = __addDisposableResource(env_1, void 0, false), filesystem = __addDisposableResource(env_1, void 0, false);
    -For;
    large;
    repositories, prioritize;
    critical;
    files;
    but;
    aim;
    for (comprehensive; coverage
        - Document; your)
        analysis;
    process in the;
    response;
    for (transparency; #; #)
        Success;
    Criteria;
    All;
    major;
    directories;
    explored;
    and;
    documented;
    All;
    critical;
    configuration;
    files;
    read;
    and;
    analyzed;
    Dependencies;
    extracted;
    with (specific)
        versions;
    Architecture;
    patterns;
    identified;
    from;
    actual;
    code;
    structure;
    Tech;
    stack;
    card;
    generated;
    with (accurate, specific)
        information;
    Analysis;
    metadata;
    shows;
    comprehensive;
    file;
    coverage;
    Remember: The;
    goal;
    is;
    COMPLETE;
    repository;
    understanding, not;
    just;
    surface - level;
    analysis.Every;
    file;
    potentially;
    contains;
    crucial;
    information;
    about;
    the;
    technology;
    stack.
    ;
    Critical;
    Requirements: 1.;
    Use;
    hyphenated;
    format;
    for (all; technologies; )
        : Technology - Version(not, spaces);
    2.;
    Separate;
    multiple;
    items;
    with (commas)
        3.;
    Include;
    specific;
    version;
    numbers;
    when;
    available;
    from;
    lock;
    files;
    4.;
    Use;
    "Not found";
    only;
    if (no)
        evidence;
    exists;
    5.;
    Be;
    specific;
    and;
    evidence - based - only;
    include;
    what;
    you;
    can;
    verify;
    from;
    the;
    repository;
    files;
    6.;
    Follow;
    the;
    exact;
    format;
    shown;
    above `;

        // Return the prompts for AI processing
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              prompts: {
                system: systemPrompt,
                user: userPrompt
              },
              repository_info: {
                name: repository.name,
                full_name: repository.full_name,
                description: repository.description,
                url: repository.html_url,
                default_branch: repository.default_branch,
                size: repository.size,
                language: repository.language,
                created_at: repository.created_at,
                updated_at: repository.updated_at
              },
              analysis_metadata: {
                analysis_depth,
                focus_areas,
                files_analyzed: analysis.files_analyzed,
                timestamp: new Date().toISOString()
              }
            })
          }]
        };

      } catch (error) {
        console.error('GitHub analysis error:', error);
        throw new Error(`;
    Failed;
    to;
    analyze;
    repository: $;
    {
        error.message;
    }
    `);
      }
    }
  },

  /**
   * Generate tech stack cards from repository analysis
   */
  generate_tech_stack_cards_from_github: {
    description: "Generate tech stack cards based on GitHub repository analysis results",
    inputSchema: {
      type: "object",
      properties: {
        analysis_results: {
          type: "object",
          description: "Results from GitHub repository analysis"
        },
        target_strategy_id: {
          type: "string",
          description: "Strategy ID to associate cards with"
        },
        user_id: {
          type: "string",
          description: "User ID for card creation"
        }
      },
      required: ["analysis_results", "user_id"]
    },
    handler: async ({ analysis_results, target_strategy_id, user_id }) => {
      try {
        const systemPrompt = `;
    You;
    are;
    an;
    expert;
    at;
    converting;
    technical;
    analysis;
    into;
    structured;
    tech;
    stack;
    cards;
    for (strategic; planning.Create; comprehensive, actionable)
        tech;
    stack;
    cards;
    based;
    on;
    the;
    provided;
    GitHub;
    analysis.
    ;
    Focus;
    on: 1.;
    Strategic;
    value;
    of;
    each;
    technology;
    2.;
    Implementation;
    status;
    and;
    maturity;
    3.;
    Integration;
    capabilities;
    4.;
    Future;
    scalability;
    considerations;
    5.;
    Security;
    and;
    performance;
    implications `;

        const userPrompt = `;
    Convert;
    this;
    GitHub;
    analysis;
    into;
    structured;
    tech;
    stack;
    cards: $;
    {
        JSON.stringify(analysis_results, null, 2);
    }
    Generate;
    JSON;
    with (this)
        exact;
    structure: {
        "cards";
        [
            {
                "card_type": "tech_stack",
                "title": "Technology Name",
                "description": "Strategic description of the technology's role",
                "category": "Technology category",
                "data": {
                    "technology_name": "Technology name",
                    "category": "Frontend|Backend|Database|Infrastructure|DevOps|Analytics|Security|Integration|Mobile|Testing",
                    "version": "Version if detected",
                    "implementation_status": "Active|Planned|Legacy|Deprecated",
                    "strategic_value": "High|Medium|Low",
                    "integration_complexity": "Low|Medium|High",
                    "learning_curve": "Easy|Moderate|Steep",
                    "community_support": "Excellent|Good|Fair|Limited",
                    "documentation_quality": "Excellent|Good|Fair|Poor",
                    "performance_characteristics": "Performance notes",
                    "security_considerations": "Security aspects",
                    "scalability_notes": "Scalability information",
                    "maintenance_effort": "Low|Medium|High",
                    "cost_implications": "Cost considerations",
                    "alternatives": ["Alternative technologies"],
                    "dependencies": ["Key dependencies"],
                    "confidence_score": 0.0 - 1.0,
                    "detected_from": ["Evidence sources"],
                    "github_repository": "Repository URL",
                    "last_analyzed": "ISO timestamp"
                },
                "priority": "High|Medium|Low",
                "tags": ["relevant", "tags"]
            }
        ];
    }
    Only;
    include;
    technologies;
    with (confidence_score > 0.7)
        and;
    focus;
    on;
    strategic;
    value. `;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              prompts: {
                system: systemPrompt,
                user: userPrompt
              }
            })
          }]
        };

      } catch (error) {
        console.error('Tech stack card generation error:', error);
        throw new Error(`;
    Failed;
    to;
    generate;
    tech;
    stack;
    cards: $;
    {
        error.message;
    }
    `);
      }
    }
  }
};

/**
 * Parse repository URL to extract owner and repo name
 */
function parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
  // Handle different URL formats
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/,
    /^([^\/]+)\/([^\/]+)$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2]
      };
    }
  }

  return null;
}

/**
 * Analyze repository structure and detect technologies
 */
async function analyzeRepositoryStructure(
  repository: any,
  files: any[],
  github: any,
  depth: string,
  focusAreas: string[]
): Promise<any> {
  const analysis = {
    files_analyzed: 0,
    package_files: [],
    config_files: [],
    source_files: [],
    dependencies: {},
    languages: {},
    frameworks: [],
    tools: [],
    architecture_patterns: []
  };

  // Key files to analyze based on depth
  const keyFiles = getKeyFilesToAnalyze(files, depth);
  analysis.files_analyzed = keyFiles.length;

  // Categorize files
  for (const file of keyFiles) {
    const filePath = file.path.toLowerCase();
    
    if (isPackageFile(filePath)) {
      analysis.package_files.push(file.path);
    } else if (isConfigFile(filePath)) {
      analysis.config_files.push(file.path);
    } else if (isSourceFile(filePath)) {
      analysis.source_files.push(file.path);
    }
  }

  // Analyze package files for dependencies
  for (const packageFile of analysis.package_files) {
    try {
      const content = await fetchFileContent(repository, packageFile, github);
      if (content) {
        const deps = parsePackageFile(packageFile, content);
        analysis.dependencies = { ...analysis.dependencies, ...deps };
      }
    } catch (error) {
      console.warn(`;
    Failed;
    to;
    analyze;
    package;
    file;
    $;
    {
        packageFile;
    }
    `, error.message);
    }
  }

  // Detect frameworks and tools from dependencies and file patterns
  analysis.frameworks = detectFrameworks(analysis.dependencies, files);
  analysis.tools = detectTools(analysis.dependencies, files);
  analysis.architecture_patterns = detectArchitecturePatterns(files);

  // Count languages based on file extensions
  analysis.languages = countLanguages(files);

  return analysis;
}

/**
 * Get key files to analyze based on depth setting
 */
function getKeyFilesToAnalyze(files: any[], depth: string): any[] {
  const packageFiles = files.filter(f => isPackageFile(f.path.toLowerCase()));
  const configFiles = files.filter(f => isConfigFile(f.path.toLowerCase()));
  
  switch (depth) {
    case 'basic':
      return [...packageFiles, ...configFiles.slice(0, 10)];
    case 'comprehensive':
      return files.filter(f => f.type === 'blob');
    default: // standard
      return [...packageFiles, ...configFiles.slice(0, 20), ...files.filter(f => isSourceFile(f.path.toLowerCase())).slice(0, 50)];
  }
}

/**
 * Check if file is a package/dependency file
 */
function isPackageFile(path: string): boolean {
  const packageFiles = [
    'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'requirements.txt', 'pipfile', 'poetry.lock', 'setup.py',
    'gemfile', 'gemfile.lock',
    'composer.json', 'composer.lock',
    'go.mod', 'go.sum',
    'cargo.toml', 'cargo.lock',
    'build.gradle', 'pom.xml',
    'project.clj'
  ];
  
  return packageFiles.some(file => path.endsWith(file));
}

/**
 * Check if file is a configuration file
 */
function isConfigFile(path: string): boolean {
  const configFiles = [
    'dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    '.env', '.env.example', '.env.local',
    'webpack.config.js', 'vite.config.js', 'rollup.config.js',
    'babel.config.js', '.babelrc', 'tsconfig.json',
    'eslint.config.js', '.eslintrc', 'prettier.config.js',
    'jest.config.js', 'vitest.config.js',
    'next.config.js', 'nuxt.config.js', 'vue.config.js',
    'angular.json', 'ionic.config.json',
    'serverless.yml', 'vercel.json', 'netlify.toml'
  ];
  
  return configFiles.some(file => path.endsWith(file)) || path.includes('.config.');
}

/**
 * Check if file is a source code file
 */
function isSourceFile(path: string): boolean {
  const sourceExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
    '.py', '.rb', '.php', '.java', '.kt', '.scala',
    '.go', '.rs', '.cpp', '.c', '.cs', '.fs',
    '.swift', '.dart', '.elm', '.clj', '.cljs'
  ];
  
  return sourceExtensions.some(ext => path.endsWith(ext));
}

/**
 * Fetch file content from GitHub
 */
async function fetchFileContent(repository: any, filePath: string, github: any): Promise<string | null> {
  try {
    const response = await fetch(`;
    https: //api.github.com/repos/${repository.full_name}/contents/${filePath}`, {
     headers: github.headers;
    ;
    if (!response.ok)
        return null;
    data = await response.json();
    if (data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
    try { }
    catch (error) {
        return null;
    }
    // Export handlers for HTTP server integration
    handleAnalyzeGitHubRepository = githubAnalysisTools.analyze_github_repository.handler;
    handleGenerateTechStackCardsFromGitHub = githubAnalysisTools.generate_tech_stack_cards_from_github.handler;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
//# sourceMappingURL=github-analysis-tools.js.map