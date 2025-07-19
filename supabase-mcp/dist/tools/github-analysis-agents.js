/**
 * Three-Agent GitHub Analysis System
 * Agent 1: Repository Explorer - Comprehensive file scanning and data collection
 * Agent 2: Technology Analyzer - Structured categorization and processing
 * Agent 3: Gap Analysis Engine - Strategic recommendations and gap identification
 */
/**
 * AGENT 1: Repository Explorer
 * Scans repository comprehensively and collects raw file data
 */
export class RepositoryExplorer {
    github;
    owner;
    repo;
    constructor(githubToken, owner, repo) {
        this.github = {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'PINNLO-MCP-Agent'
            }
        };
        this.owner = owner;
        this.repo = repo;
    }
    /**
     * Main exploration method - scans entire repository
     */
    async explore() {
        console.log(`🔍 Agent 1: Starting comprehensive repository exploration for ${this.owner}/${this.repo}`);
        try {
            // Get repository information
            const repositoryInfo = await this.getRepositoryInfo();
            // Get comprehensive file list
            const allFiles = await this.getAllFiles();
            // Prioritize and fetch important files
            const filesToAnalyze = this.prioritizeFiles(allFiles);
            const fileContents = await this.fetchFileContents(filesToAnalyze);
            // Build directory structure
            const directoryStructure = this.buildDirectoryStructure(allFiles);
            const result = {
                repository_info: repositoryInfo,
                files: fileContents,
                directory_structure: directoryStructure,
                total_files_scanned: allFiles.length,
                analysis_timestamp: new Date().toISOString()
            };
            console.log(`✅ Agent 1: Exploration complete. Scanned ${allFiles.length} files, analyzed ${fileContents.length} key files`);
            return result;
        }
        catch (error) {
            console.error('❌ Agent 1: Repository exploration failed:', error);
            throw error;
        }
    }
    /**
     * Get repository basic information
     */
    async getRepositoryInfo() {
        console.log('📋 Agent 1: Fetching repository information...');
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}`, {
            headers: this.github.headers
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch repository info: ${response.status}`);
        }
        const repo = await response.json();
        return {
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            language: repo.language,
            size: repo.size,
            updated_at: repo.updated_at,
            default_branch: repo.default_branch
        };
    }
    /**
     * Get all files in the repository using recursive tree API
     */
    async getAllFiles() {
        console.log('📁 Agent 1: Scanning all repository files...');
        const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${await this.getDefaultBranch()}?recursive=1`, {
            headers: this.github.headers
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch file tree: ${response.status}`);
        }
        const data = await response.json();
        return data.tree
            .filter((item) => item.type === 'blob') // Only files, not directories
            .map((item) => ({
            path: item.path,
            type: item.type,
            size: item.size
        }));
    }
    /**
     * Prioritize files for analysis based on importance
     */
    prioritizeFiles(allFiles) {
        console.log('🎯 Agent 1: Prioritizing files for analysis...');
        const criticalFiles = [
            // Package management
            'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
            'requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile',
            'composer.json', 'Gemfile', 'go.mod', 'Cargo.toml',
            // Configuration files
            'next.config.js', 'next.config.mjs', 'nuxt.config.js', 'vue.config.js',
            'angular.json', 'svelte.config.js', 'vite.config.js', 'webpack.config.js',
            'tailwind.config.js', 'postcss.config.js', 'tsconfig.json', 'jsconfig.json',
            'babel.config.js', '.eslintrc.js', '.eslintrc.json', 'prettier.config.js',
            // Infrastructure
            'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
            'vercel.json', 'netlify.toml', '.env.example', '.env.local.example',
            // Database
            'prisma/schema.prisma', 'supabase/config.toml',
            // Documentation
            'README.md', 'CHANGELOG.md', 'LICENSE',
            // CI/CD
            '.github/workflows/deploy.yml', '.github/workflows/ci.yml',
            '.github/workflows/test.yml'
        ];
        const importantPatterns = [
            /^src\/.*\.(ts|tsx|js|jsx)$/,
            /^app\/.*\.(ts|tsx|js|jsx)$/,
            /^pages\/.*\.(ts|tsx|js|jsx)$/,
            /^components\/.*\.(ts|tsx|js|jsx)$/,
            /^lib\/.*\.(ts|tsx|js|jsx)$/,
            /^utils\/.*\.(ts|tsx|js|jsx)$/,
            /^hooks\/.*\.(ts|tsx|js|jsx)$/,
            /^api\/.*\.(ts|tsx|js|jsx)$/,
            /^server\/.*\.(ts|tsx|js|jsx)$/,
            /supabase\/migrations\/.*\.sql$/,
            /.*\.config\.(js|ts|mjs)$/,
            /.*\.env\.example$/
        ];
        const prioritizedFiles = new Set();
        // Add critical files that exist
        criticalFiles.forEach(file => {
            if (allFiles.some(f => f.path === file)) {
                prioritizedFiles.add(file);
            }
        });
        // Add files matching important patterns (limit to avoid API rate limits)
        allFiles.forEach(file => {
            if (prioritizedFiles.size >= 50)
                return; // Limit to avoid GitHub API rate limits
            if (importantPatterns.some(pattern => pattern.test(file.path))) {
                prioritizedFiles.add(file.path);
            }
        });
        console.log(`📊 Agent 1: Selected ${prioritizedFiles.size} priority files for analysis`);
        return Array.from(prioritizedFiles);
    }
    /**
     * Fetch contents of prioritized files
     */
    async fetchFileContents(filePaths) {
        console.log(`📄 Agent 1: Fetching contents of ${filePaths.length} files...`);
        const fileContents = [];
        for (const filePath of filePaths) {
            try {
                const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}`, {
                    headers: this.github.headers
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.content && data.encoding === 'base64') {
                        const content = Buffer.from(data.content, 'base64').toString('utf-8');
                        fileContents.push({
                            path: filePath,
                            content: content,
                            size: data.size,
                            type: this.getFileType(filePath)
                        });
                    }
                }
            }
            catch (error) {
                console.warn(`⚠️ Agent 1: Failed to fetch ${filePath}:`, error);
            }
        }
        console.log(`✅ Agent 1: Successfully fetched ${fileContents.length} file contents`);
        return fileContents;
    }
    /**
     * Build directory structure for overview
     */
    buildDirectoryStructure(allFiles) {
        const directories = new Set();
        allFiles.forEach(file => {
            const pathParts = file.path.split('/');
            let currentPath = '';
            pathParts.forEach((part, index) => {
                if (index < pathParts.length - 1) { // Not the filename
                    currentPath += (currentPath ? '/' : '') + part;
                    directories.add(currentPath);
                }
            });
        });
        return Array.from(directories).sort();
    }
    /**
     * Get file type based on extension
     */
    getFileType(filePath) {
        const extension = filePath.split('.').pop()?.toLowerCase();
        const typeMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'json': 'json',
            'md': 'markdown',
            'yml': 'yaml',
            'yaml': 'yaml',
            'toml': 'toml',
            'sql': 'sql',
            'py': 'python',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'php': 'php',
            'java': 'java',
            'css': 'css',
            'scss': 'scss',
            'html': 'html'
        };
        return typeMap[extension || ''] || 'text';
    }
    /**
     * Get default branch name
     */
    async getDefaultBranch() {
        // For now, assume 'main' but could be made dynamic
        return 'main';
    }
}
// Export the tool for MCP integration
export const repositoryExplorerTool = {
    name: 'explore_github_repository',
    description: 'Agent 1: Comprehensively scan and collect data from a GitHub repository',
    inputSchema: {
        type: "object",
        properties: {
            repository_url: { type: "string", description: "GitHub repository URL" },
            github_token: { type: "string", description: "GitHub Personal Access Token" },
            user_id: { type: "string", description: "User ID for tracking" }
        },
        required: ["repository_url", "github_token", "user_id"]
    },
    handler: async ({ repository_url, github_token, user_id }) => {
        try {
            // Parse repository URL
            const repoInfo = parseRepositoryUrl(repository_url);
            if (!repoInfo) {
                throw new Error("Invalid repository URL format");
            }
            // Create and run explorer
            const explorer = new RepositoryExplorer(github_token, repoInfo.owner, repoInfo.repo);
            const result = await explorer.explore();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error('❌ Repository Explorer failed:', error);
            throw error;
        }
    }
};
/**
 * AGENT 2: Technology Analyzer
 * Processes raw repository data and categorizes technologies
 */
export class TechnologyAnalyzer {
    explorerData;
    constructor(explorerData) {
        this.explorerData = explorerData;
    }
    /**
     * Main analysis method - processes explorer data into structured tech stack
     */
    async analyze() {
        console.log(`🔬 Agent 2: Starting technology analysis for ${this.explorerData.repository_info.name}`);
        try {
            // Extract dependencies from package files
            const dependencies = this.extractDependencies();
            // Analyze configuration files
            const configurations = this.analyzeConfigurations();
            // Detect frameworks and tools
            const frameworks = this.detectFrameworks(dependencies, configurations);
            // Categorize technologies
            const technologies = this.categorizeTechnologies(dependencies, configurations, frameworks);
            // Extract infrastructure info
            const infrastructure = this.analyzeInfrastructure();
            // Analyze database setup
            const database = this.analyzeDatabase(dependencies);
            // Detect AI/ML integrations
            const aiIntegrations = this.detectAIIntegrations(dependencies);
            const result = {
                repository_info: this.explorerData.repository_info,
                technologies,
                frameworks,
                languages: this.detectLanguages(),
                package_managers: this.detectPackageManagers(),
                development_tools: this.detectDevelopmentTools(dependencies),
                dependencies,
                configurations,
                infrastructure,
                database,
                ai_integrations: aiIntegrations,
                analysis_metadata: {
                    files_analyzed: this.explorerData.files.length,
                    total_files_scanned: this.explorerData.total_files_scanned,
                    dependencies_count: Object.keys(dependencies).length,
                    analysis_timestamp: new Date().toISOString(),
                    method: 'Agent-based analysis'
                }
            };
            console.log(`✅ Agent 2: Analysis complete. Categorized ${Object.keys(dependencies).length} dependencies into structured tech stack`);
            return result;
        }
        catch (error) {
            console.error('❌ Agent 2: Technology analysis failed:', error);
            throw error;
        }
    }
    /**
     * Extract dependencies from package.json and other dependency files
     */
    extractDependencies() {
        console.log('📦 Agent 2: Extracting dependencies...');
        const dependencies = {};
        // Process package.json
        const packageJson = this.explorerData.files.find(f => f.path === 'package.json');
        if (packageJson) {
            try {
                const parsed = JSON.parse(packageJson.content);
                Object.assign(dependencies, parsed.dependencies || {});
                Object.assign(dependencies, parsed.devDependencies || {});
            }
            catch (error) {
                console.warn('⚠️ Agent 2: Failed to parse package.json');
            }
        }
        // Process other dependency files
        const dependencyFiles = [
            { path: 'requirements.txt', parser: this.parseRequirementsTxt },
            { path: 'Gemfile', parser: this.parseGemfile },
            { path: 'composer.json', parser: this.parseComposerJson },
            { path: 'go.mod', parser: this.parseGoMod },
            { path: 'Cargo.toml', parser: this.parseCargoToml }
        ];
        dependencyFiles.forEach(({ path, parser }) => {
            const file = this.explorerData.files.find(f => f.path === path);
            if (file) {
                try {
                    const deps = parser.call(this, file.content);
                    Object.assign(dependencies, deps);
                }
                catch (error) {
                    console.warn(`⚠️ Agent 2: Failed to parse ${path}`);
                }
            }
        });
        return dependencies;
    }
    /**
     * Analyze configuration files to detect tools and frameworks
     */
    analyzeConfigurations() {
        console.log('⚙️ Agent 2: Analyzing configuration files...');
        const configurations = {};
        const configFiles = [
            'next.config.js', 'next.config.mjs', 'nuxt.config.js', 'vue.config.js',
            'angular.json', 'svelte.config.js', 'vite.config.js', 'webpack.config.js',
            'tailwind.config.js', 'postcss.config.js', 'tsconfig.json', 'jsconfig.json',
            'babel.config.js', '.eslintrc.js', '.eslintrc.json', 'prettier.config.js',
            'jest.config.js', 'vitest.config.js', 'cypress.config.js'
        ];
        configFiles.forEach(configFile => {
            const file = this.explorerData.files.find(f => f.path === configFile);
            if (file) {
                configurations[configFile] = {
                    exists: true,
                    size: file.size,
                    content_preview: file.content.substring(0, 200)
                };
            }
        });
        return configurations;
    }
    /**
     * Detect frameworks and tools from dependencies and configurations
     */
    detectFrameworks(dependencies, configurations) {
        console.log('🛠️ Agent 2: Detecting frameworks...');
        const frameworks = [];
        // Frontend frameworks
        if (dependencies['next'])
            frameworks.push('Next.js');
        if (dependencies['react'])
            frameworks.push('React');
        if (dependencies['vue'])
            frameworks.push('Vue.js');
        if (dependencies['angular'])
            frameworks.push('Angular');
        if (dependencies['svelte'])
            frameworks.push('Svelte');
        // Backend frameworks
        if (dependencies['express'])
            frameworks.push('Express');
        if (dependencies['fastify'])
            frameworks.push('Fastify');
        if (dependencies['@nestjs/core'])
            frameworks.push('NestJS');
        if (dependencies['koa'])
            frameworks.push('Koa');
        // CSS frameworks
        if (dependencies['tailwindcss'])
            frameworks.push('Tailwind CSS');
        if (dependencies['bootstrap'])
            frameworks.push('Bootstrap');
        if (dependencies['@mui/material'])
            frameworks.push('Material-UI');
        // Testing frameworks
        if (dependencies['jest'])
            frameworks.push('Jest');
        if (dependencies['vitest'])
            frameworks.push('Vitest');
        if (dependencies['cypress'])
            frameworks.push('Cypress');
        if (dependencies['playwright'])
            frameworks.push('Playwright');
        // Build tools
        if (dependencies['webpack'])
            frameworks.push('Webpack');
        if (dependencies['vite'])
            frameworks.push('Vite');
        if (dependencies['rollup'])
            frameworks.push('Rollup');
        // Database/ORM
        if (dependencies['prisma'])
            frameworks.push('Prisma');
        if (dependencies['sequelize'])
            frameworks.push('Sequelize');
        if (dependencies['typeorm'])
            frameworks.push('TypeORM');
        // Configuration-based detection
        if (configurations['next.config.js'] || configurations['next.config.mjs']) {
            if (!frameworks.includes('Next.js'))
                frameworks.push('Next.js');
        }
        if (configurations['tailwind.config.js']) {
            if (!frameworks.includes('Tailwind CSS'))
                frameworks.push('Tailwind CSS');
        }
        return frameworks;
    }
    /**
     * Categorize technologies into structured format
     */
    categorizeTechnologies(dependencies, configurations, frameworks) {
        console.log('📊 Agent 2: Categorizing technologies...');
        const technologies = {
            frontend: [],
            backend: [],
            database: [],
            infrastructure: [],
            platforms: [],
            ai: [],
            development: [],
            integrations: []
        };
        // Frontend technologies
        if (dependencies['next'])
            technologies.frontend.push(`Next.js-${dependencies['next'].replace(/[\^\~]/, '')}`);
        if (dependencies['react'])
            technologies.frontend.push(`React-${dependencies['react'].replace(/[\^\~]/, '')}`);
        if (dependencies['vue'])
            technologies.frontend.push(`Vue.js-${dependencies['vue'].replace(/[\^\~]/, '')}`);
        if (dependencies['tailwindcss'])
            technologies.frontend.push(`Tailwind-CSS-${dependencies['tailwindcss'].replace(/[\^\~]/, '')}`);
        if (dependencies['@headlessui/react'])
            technologies.frontend.push(`Headless-UI-${dependencies['@headlessui/react'].replace(/[\^\~]/, '')}`);
        if (dependencies['framer-motion'])
            technologies.frontend.push(`Framer-Motion-${dependencies['framer-motion'].replace(/[\^\~]/, '')}`);
        if (dependencies['lucide-react'])
            technologies.frontend.push(`Lucide-React-${dependencies['lucide-react'].replace(/[\^\~]/, '')}`);
        // Backend technologies
        if (dependencies['@supabase/supabase-js'])
            technologies.backend.push(`Supabase-${dependencies['@supabase/supabase-js'].replace(/[\^\~]/, '')}`);
        if (dependencies['express'])
            technologies.backend.push(`Express-${dependencies['express'].replace(/[\^\~]/, '')}`);
        if (dependencies['fastify'])
            technologies.backend.push(`Fastify-${dependencies['fastify'].replace(/[\^\~]/, '')}`);
        if (dependencies['next'] && !dependencies['express'])
            technologies.backend.push('Next.js-API-Routes');
        // Database technologies
        if (dependencies['@supabase/supabase-js']) {
            technologies.database.push('PostgreSQL');
            technologies.database.push('Supabase');
        }
        if (dependencies['prisma'])
            technologies.database.push(`Prisma-${dependencies['prisma'].replace(/[\^\~]/, '')}`);
        if (dependencies['pg'])
            technologies.database.push(`PostgreSQL-${dependencies['pg'].replace(/[\^\~]/, '')}`);
        // Infrastructure (inferred from configurations)
        if (configurations['vercel.json'] || dependencies['next']) {
            technologies.infrastructure.push('Vercel');
        }
        if (configurations['Dockerfile']) {
            technologies.infrastructure.push('Docker');
        }
        if (configurations['.github/workflows/deploy.yml']) {
            technologies.infrastructure.push('GitHub-Actions');
        }
        // AI technologies
        if (dependencies['openai'])
            technologies.ai.push(`OpenAI-${dependencies['openai'].replace(/[\^\~]/, '')}`);
        if (dependencies['@anthropic-ai/sdk'])
            technologies.ai.push(`Anthropic-${dependencies['@anthropic-ai/sdk'].replace(/[\^\~]/, '')}`);
        if (dependencies['langchain'])
            technologies.ai.push(`LangChain-${dependencies['langchain'].replace(/[\^\~]/, '')}`);
        // Development tools
        if (dependencies['typescript'])
            technologies.development.push(`TypeScript-${dependencies['typescript'].replace(/[\^\~]/, '')}`);
        if (dependencies['eslint'])
            technologies.development.push(`ESLint-${dependencies['eslint'].replace(/[\^\~]/, '')}`);
        if (dependencies['prettier'])
            technologies.development.push(`Prettier-${dependencies['prettier'].replace(/[\^\~]/, '')}`);
        if (dependencies['jest'])
            technologies.development.push(`Jest-${dependencies['jest'].replace(/[\^\~]/, '')}`);
        // Platforms
        if (dependencies['@supabase/supabase-js'])
            technologies.platforms.push('Supabase-Platform');
        if (dependencies['stripe'])
            technologies.platforms.push('Stripe-Platform');
        // Integrations
        if (dependencies['@supabase/auth-helpers-nextjs'])
            technologies.integrations.push('Supabase-Auth');
        if (dependencies['@vercel/analytics'])
            technologies.integrations.push('Vercel-Analytics');
        return technologies;
    }
    /**
     * Analyze infrastructure setup
     */
    analyzeInfrastructure() {
        console.log('🏗️ Agent 2: Analyzing infrastructure...');
        const infrastructure = {
            deployment: [],
            containerization: [],
            ci_cd: [],
            monitoring: []
        };
        // Check for deployment configurations
        if (this.explorerData.files.some(f => f.path === 'vercel.json')) {
            infrastructure.deployment.push('Vercel');
        }
        if (this.explorerData.files.some(f => f.path === 'netlify.toml')) {
            infrastructure.deployment.push('Netlify');
        }
        // Check for containerization
        if (this.explorerData.files.some(f => f.path === 'Dockerfile')) {
            infrastructure.containerization.push('Docker');
        }
        if (this.explorerData.files.some(f => f.path === 'docker-compose.yml')) {
            infrastructure.containerization.push('Docker Compose');
        }
        // Check for CI/CD
        const workflowFiles = this.explorerData.files.filter(f => f.path.startsWith('.github/workflows/'));
        if (workflowFiles.length > 0) {
            infrastructure.ci_cd.push('GitHub Actions');
        }
        return infrastructure;
    }
    /**
     * Analyze database setup
     */
    analyzeDatabase(dependencies) {
        console.log('🗄️ Agent 2: Analyzing database setup...');
        const database = {
            primary: [],
            orm: [],
            migrations: []
        };
        // Primary databases
        if (dependencies['@supabase/supabase-js']) {
            database.primary.push('PostgreSQL');
            database.primary.push('Supabase');
        }
        if (dependencies['pg'])
            database.primary.push('PostgreSQL');
        if (dependencies['mysql2'])
            database.primary.push('MySQL');
        if (dependencies['mongodb'])
            database.primary.push('MongoDB');
        // ORMs
        if (dependencies['prisma'])
            database.orm.push('Prisma');
        if (dependencies['sequelize'])
            database.orm.push('Sequelize');
        if (dependencies['typeorm'])
            database.orm.push('TypeORM');
        // Migrations
        if (this.explorerData.files.some(f => f.path.includes('supabase/migrations'))) {
            database.migrations.push('Supabase Migrations');
        }
        if (this.explorerData.files.some(f => f.path.includes('prisma/migrations'))) {
            database.migrations.push('Prisma Migrations');
        }
        return database;
    }
    /**
     * Detect AI/ML integrations from code analysis
     */
    detectAIIntegrations(dependencies) {
        console.log('🤖 Agent 2: Detecting AI integrations...');
        const ai = {
            apis: [],
            frameworks: [],
            models: [],
            integrations: []
        };
        // API integrations
        if (dependencies['openai'])
            ai.apis.push('OpenAI');
        if (dependencies['@anthropic-ai/sdk'])
            ai.apis.push('Anthropic');
        if (dependencies['@google/generative-ai'])
            ai.apis.push('Google AI');
        // ML frameworks
        if (dependencies['langchain'])
            ai.frameworks.push('LangChain');
        if (dependencies['@tensorflow/tfjs'])
            ai.frameworks.push('TensorFlow.js');
        // Check for AI usage in code files
        const codeFiles = this.explorerData.files.filter(f => f.type === 'typescript' || f.type === 'javascript');
        codeFiles.forEach(file => {
            if (file.content.includes('openai') || file.content.includes('OpenAI')) {
                if (!ai.integrations.includes('OpenAI Integration')) {
                    ai.integrations.push('OpenAI Integration');
                }
            }
            if (file.content.includes('anthropic') || file.content.includes('claude')) {
                if (!ai.integrations.includes('Anthropic Integration')) {
                    ai.integrations.push('Anthropic Integration');
                }
            }
        });
        return ai;
    }
    // Dependency file parsers
    parseRequirementsTxt(content) {
        const deps = {};
        content.split('\n').forEach(line => {
            const match = line.trim().match(/^([^=<>!]+)[=<>!](.+)$/);
            if (match) {
                deps[match[1]] = match[2];
            }
        });
        return deps;
    }
    parseGemfile(content) {
        const deps = {};
        const gemMatches = content.match(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/g);
        if (gemMatches) {
            gemMatches.forEach(match => {
                const parts = match.match(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/);
                if (parts) {
                    deps[parts[1]] = parts[2] || 'latest';
                }
            });
        }
        return deps;
    }
    parseComposerJson(content) {
        try {
            const parsed = JSON.parse(content);
            return { ...(parsed.require || {}), ...(parsed['require-dev'] || {}) };
        }
        catch {
            return {};
        }
    }
    parseGoMod(content) {
        const deps = {};
        const requireMatches = content.match(/require\s+\(([^)]+)\)/);
        if (requireMatches) {
            requireMatches[1].split('\n').forEach(line => {
                const match = line.trim().match(/^([^\s]+)\s+(.+)$/);
                if (match) {
                    deps[match[1]] = match[2];
                }
            });
        }
        return deps;
    }
    parseCargoToml(content) {
        const deps = {};
        const dependenciesSection = content.match(/\[dependencies\](.*?)(?=\n\[|\n$)/);
        if (dependenciesSection) {
            dependenciesSection[1].split('\n').forEach(line => {
                const match = line.trim().match(/^([^=]+)\s*=\s*["']([^"']+)["']/);
                if (match) {
                    deps[match[1]] = match[2];
                }
            });
        }
        return deps;
    }
    /**
     * Detect programming languages from file extensions
     */
    detectLanguages() {
        const languages = new Set();
        this.explorerData.files.forEach(file => {
            const ext = file.path.split('.').pop()?.toLowerCase();
            switch (ext) {
                case 'js':
                case 'jsx':
                case 'mjs':
                    languages.add('JavaScript');
                    break;
                case 'ts':
                case 'tsx':
                    languages.add('TypeScript');
                    break;
                case 'py':
                    languages.add('Python');
                    break;
                case 'rb':
                    languages.add('Ruby');
                    break;
                case 'php':
                    languages.add('PHP');
                    break;
                case 'go':
                    languages.add('Go');
                    break;
                case 'rs':
                    languages.add('Rust');
                    break;
                case 'java':
                    languages.add('Java');
                    break;
                case 'cs':
                    languages.add('C#');
                    break;
                case 'cpp':
                case 'cc':
                    languages.add('C++');
                    break;
            }
        });
        return Array.from(languages);
    }
    /**
     * Detect package managers from lock files
     */
    detectPackageManagers() {
        const packageManagers = [];
        const lockFiles = [
            { file: 'package-lock.json', manager: 'npm' },
            { file: 'yarn.lock', manager: 'yarn' },
            { file: 'pnpm-lock.yaml', manager: 'pnpm' },
            { file: 'requirements.txt', manager: 'pip' },
            { file: 'Gemfile.lock', manager: 'bundler' },
            { file: 'composer.lock', manager: 'composer' },
            { file: 'go.sum', manager: 'go modules' },
            { file: 'Cargo.lock', manager: 'cargo' }
        ];
        lockFiles.forEach(({ file, manager }) => {
            if (this.explorerData.files.some(f => f.path === file)) {
                packageManagers.push(manager);
            }
        });
        return packageManagers;
    }
    /**
     * Detect development tools from dependencies
     */
    detectDevelopmentTools(dependencies) {
        const tools = [];
        const devTools = [
            { dep: 'eslint', tool: 'ESLint' },
            { dep: 'prettier', tool: 'Prettier' },
            { dep: 'jest', tool: 'Jest' },
            { dep: 'cypress', tool: 'Cypress' },
            { dep: 'webpack', tool: 'Webpack' },
            { dep: 'vite', tool: 'Vite' },
            { dep: 'rollup', tool: 'Rollup' },
            { dep: 'babel', tool: 'Babel' },
            { dep: 'typescript', tool: 'TypeScript' },
            { dep: 'nodemon', tool: 'Nodemon' },
            { dep: 'concurrently', tool: 'Concurrently' }
        ];
        devTools.forEach(({ dep, tool }) => {
            if (dependencies[dep] || dependencies[`@${dep}`] || dependencies[`${dep}-*`]) {
                tools.push(tool);
            }
        });
        return tools;
    }
}
// Export the tool for MCP integration
export const technologyAnalyzerTool = {
    name: 'analyze_technology_stack',
    description: 'Agent 2: Analyze and categorize technologies from repository exploration data',
    inputSchema: {
        type: "object",
        properties: {
            exploration_data: { type: "object", description: "Output from repository explorer" },
            user_id: { type: "string", description: "User ID for tracking" }
        },
        required: ["exploration_data", "user_id"]
    },
    handler: async ({ exploration_data, user_id }) => {
        try {
            const analyzer = new TechnologyAnalyzer(exploration_data);
            const result = await analyzer.analyze();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error('❌ Technology Analyzer failed:', error);
            throw error;
        }
    }
};
/**
 * AGENT 3: Gap Analysis Engine
 * Analyzes structured tech stack and provides strategic recommendations
 */
export class GapAnalysisEngine {
    techStack;
    constructor(techStack) {
        this.techStack = techStack;
    }
    /**
     * Main gap analysis method - identifies missing components and provides recommendations
     */
    async analyze() {
        console.log(`🔍 Agent 3: Starting gap analysis for ${this.techStack.repository_info.name}`);
        try {
            // Analyze each technology category for gaps
            const gapAnalysis = {
                frontend: this.analyzeFrontendGaps(),
                backend: this.analyzeBackendGaps(),
                database: this.analyzeDatabaseGaps(),
                infrastructure: this.analyzeInfrastructureGaps(),
                platforms: this.analyzePlatformGaps(),
                ai: this.analyzeAIGaps(),
                development: this.analyzeDevelopmentGaps(),
                integrations: this.analyzeIntegrationGaps()
            };
            // Generate key decisions analysis
            const keyDecisions = this.generateKeyDecisions();
            // Generate migration recommendations
            const migrationNotes = this.generateMigrationNotes();
            // Create enhanced tech stack with gap analysis
            const enhancedTechStack = {
                ...this.techStack,
                technologies: this.enhanceTechnologies(gapAnalysis),
                gap_analysis: gapAnalysis,
                key_decisions: keyDecisions,
                migration_notes: migrationNotes,
                recommendations: this.generateStrategicRecommendations(gapAnalysis)
            };
            console.log(`✅ Agent 3: Gap analysis complete. Generated ${Object.keys(gapAnalysis).length} category analyses with strategic recommendations`);
            return enhancedTechStack;
        }
        catch (error) {
            console.error('❌ Agent 3: Gap analysis failed:', error);
            throw error;
        }
    }
    /**
     * Analyze frontend technology gaps
     */
    analyzeFrontendGaps() {
        const frontend = this.techStack.technologies.frontend;
        const gaps = [];
        // Check for missing essential frontend tools
        if (!frontend.some(tech => tech.includes('React') || tech.includes('Vue') || tech.includes('Angular'))) {
            gaps.push('No frontend framework detected');
        }
        if (!frontend.some(tech => tech.includes('TypeScript'))) {
            gaps.push('Consider TypeScript for type safety');
        }
        if (!frontend.some(tech => tech.includes('Tailwind') || tech.includes('CSS'))) {
            gaps.push('No CSS framework detected - consider Tailwind CSS');
        }
        if (!frontend.some(tech => tech.includes('State') || tech.includes('Redux') || tech.includes('Zustand'))) {
            gaps.push('Consider state management (Redux, Zustand, Jotai)');
        }
        return {
            current_technologies: frontend,
            identified_gaps: gaps,
            recommendations: this.generateFrontendRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    }
    /**
     * Analyze backend technology gaps
     */
    analyzeBackendGaps() {
        const backend = this.techStack.technologies.backend;
        const gaps = [];
        // Check for API framework
        if (!backend.some(tech => tech.includes('Express') || tech.includes('Fastify') || tech.includes('API-Routes'))) {
            gaps.push('No API framework detected');
        }
        // Check for authentication
        if (!backend.some(tech => tech.includes('Auth') || tech.includes('Supabase'))) {
            gaps.push('Authentication system needed (NextAuth, Supabase Auth)');
        }
        // Check for API documentation
        if (!backend.some(tech => tech.includes('OpenAPI') || tech.includes('Swagger'))) {
            gaps.push('API documentation tools (OpenAPI, Swagger)');
        }
        // Check for rate limiting
        if (!backend.some(tech => tech.includes('Rate') || tech.includes('Limit'))) {
            gaps.push('Rate limiting and security middleware');
        }
        return {
            current_technologies: backend,
            identified_gaps: gaps,
            recommendations: this.generateBackendRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    }
    /**
     * Analyze database technology gaps
     */
    analyzeDatabaseGaps() {
        const database = this.techStack.technologies.database;
        const gaps = [];
        // Check for database presence
        if (database.length === 0) {
            gaps.push('No database detected - consider PostgreSQL, MySQL, or MongoDB');
        }
        // Check for ORM
        if (!database.some(tech => tech.includes('Prisma') || tech.includes('Sequelize') || tech.includes('TypeORM'))) {
            gaps.push('ORM recommended (Prisma, Sequelize, TypeORM)');
        }
        // Check for caching
        if (!database.some(tech => tech.includes('Redis') || tech.includes('Cache'))) {
            gaps.push('Caching layer (Redis, Memcached)');
        }
        // Check for backup strategy
        gaps.push('Database backup and recovery strategy');
        return {
            current_technologies: database,
            identified_gaps: gaps,
            recommendations: this.generateDatabaseRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    }
    /**
     * Analyze infrastructure technology gaps
     */
    analyzeInfrastructureGaps() {
        const infrastructure = this.techStack.technologies.infrastructure;
        const gaps = [];
        // Check for deployment platform
        if (!infrastructure.some(tech => tech.includes('Vercel') || tech.includes('Netlify') || tech.includes('AWS'))) {
            gaps.push('Deployment platform (Vercel, Netlify, AWS)');
        }
        // Check for monitoring
        if (!infrastructure.some(tech => tech.includes('Sentry') || tech.includes('Monitor'))) {
            gaps.push('Error monitoring (Sentry, Bugsnag)');
        }
        // Check for analytics
        if (!infrastructure.some(tech => tech.includes('Analytics') || tech.includes('Tracking'))) {
            gaps.push('Analytics and tracking (Google Analytics, Mixpanel)');
        }
        // Check for CDN
        if (!infrastructure.some(tech => tech.includes('CDN') || tech.includes('CloudFlare'))) {
            gaps.push('CDN for asset delivery (CloudFlare, AWS CloudFront)');
        }
        return {
            current_technologies: infrastructure,
            identified_gaps: gaps,
            recommendations: this.generateInfrastructureRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    }
    /**
     * Analyze platform integration gaps
     */
    analyzePlatformGaps() {
        const platforms = this.techStack.technologies.platforms;
        const gaps = [];
        // Check for payment processing
        if (!platforms.some(tech => tech.includes('Stripe') || tech.includes('PayPal'))) {
            gaps.push('Payment processing (Stripe, PayPal)');
        }
        // Check for email service
        if (!platforms.some(tech => tech.includes('SendGrid') || tech.includes('Email'))) {
            gaps.push('Email service (SendGrid, Mailgun, SES)');
        }
        // Check for search functionality
        if (!platforms.some(tech => tech.includes('Search') || tech.includes('Elasticsearch'))) {
            gaps.push('Search functionality (Elasticsearch, Algolia)');
        }
        return {
            current_technologies: platforms,
            identified_gaps: gaps,
            recommendations: this.generatePlatformRecommendations(gaps),
            priority: gaps.length > 1 ? 'medium' : 'low'
        };
    }
    /**
     * Analyze AI technology gaps
     */
    analyzeAIGaps() {
        const ai = this.techStack.technologies.ai;
        const gaps = [];
        // For AI-powered platforms, suggest AI integrations
        if (this.techStack.repository_info.description?.toLowerCase().includes('ai') ||
            this.techStack.repository_info.description?.toLowerCase().includes('strategy')) {
            if (ai.length === 0) {
                gaps.push('AI API integration (OpenAI, Anthropic, Google AI)');
            }
            if (!ai.some(tech => tech.includes('LangChain') || tech.includes('Framework'))) {
                gaps.push('AI framework (LangChain, LlamaIndex)');
            }
            if (!ai.some(tech => tech.includes('Vector') || tech.includes('Pinecone'))) {
                gaps.push('Vector database (Pinecone, Weaviate, Chroma)');
            }
        }
        return {
            current_technologies: ai,
            identified_gaps: gaps,
            recommendations: this.generateAIRecommendations(gaps),
            priority: gaps.length > 1 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    }
    /**
     * Analyze development tools gaps
     */
    analyzeDevelopmentGaps() {
        const development = this.techStack.technologies.development;
        const gaps = [];
        // Check for linting
        if (!development.some(tech => tech.includes('ESLint') || tech.includes('Lint'))) {
            gaps.push('Code linting (ESLint, Prettier)');
        }
        // Check for testing
        if (!development.some(tech => tech.includes('Jest') || tech.includes('Test'))) {
            gaps.push('Testing framework (Jest, Vitest, Cypress)');
        }
        // Check for type checking
        if (!development.some(tech => tech.includes('TypeScript'))) {
            gaps.push('Type checking (TypeScript)');
        }
        // Check for pre-commit hooks
        if (!development.some(tech => tech.includes('Husky') || tech.includes('Hook'))) {
            gaps.push('Pre-commit hooks (Husky, lint-staged)');
        }
        return {
            current_technologies: development,
            identified_gaps: gaps,
            recommendations: this.generateDevelopmentRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    }
    /**
     * Analyze integration gaps
     */
    analyzeIntegrationGaps() {
        const integrations = this.techStack.technologies.integrations;
        const gaps = [];
        // Check for authentication integration
        if (!integrations.some(tech => tech.includes('Auth'))) {
            gaps.push('Authentication integration');
        }
        // Check for API integrations
        if (!integrations.some(tech => tech.includes('API') || tech.includes('Webhook'))) {
            gaps.push('API and webhook integrations');
        }
        // Check for third-party services
        if (integrations.length < 3) {
            gaps.push('Third-party service integrations');
        }
        return {
            current_technologies: integrations,
            identified_gaps: gaps,
            recommendations: this.generateIntegrationRecommendations(gaps),
            priority: gaps.length > 1 ? 'medium' : 'low'
        };
    }
    /**
     * Generate key technology decisions analysis
     */
    generateKeyDecisions() {
        const decisions = [];
        // Framework decisions
        if (this.techStack.technologies.frontend.some(tech => tech.includes('Next.js'))) {
            decisions.push('Chose Next.js over Create React App for SSR capabilities and API routes');
        }
        if (this.techStack.technologies.database.some(tech => tech.includes('Supabase'))) {
            decisions.push('Chose Supabase over Firebase for PostgreSQL compatibility and better developer experience');
        }
        if (this.techStack.technologies.frontend.some(tech => tech.includes('Tailwind'))) {
            decisions.push('Chose Tailwind CSS over styled-components for utility-first styling approach');
        }
        if (this.techStack.technologies.development.some(tech => tech.includes('TypeScript'))) {
            decisions.push('Chose TypeScript over JavaScript for type safety and better developer experience');
        }
        return decisions;
    }
    /**
     * Generate migration recommendations
     */
    generateMigrationNotes() {
        const migrations = [];
        // Check for outdated dependencies
        if (this.techStack.technologies.frontend.some(tech => tech.includes('React-17'))) {
            migrations.push('Plan React 18 migration for concurrent features');
        }
        if (this.techStack.technologies.frontend.some(tech => tech.includes('Next.js-13'))) {
            migrations.push('Consider Next.js 14 upgrade for improved performance');
        }
        // General recommendations
        migrations.push('Regular dependency updates and security patches');
        migrations.push('Consider progressive migration to newer framework versions');
        return migrations;
    }
    /**
     * Generate strategic recommendations
     */
    generateStrategicRecommendations(gapAnalysis) {
        const recommendations = [];
        // High priority recommendations
        Object.entries(gapAnalysis).forEach(([category, analysis]) => {
            if (analysis.priority === 'high') {
                recommendations.push({
                    category,
                    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Enhancement`,
                    description: `Address critical gaps in ${category} technology stack`,
                    priority: 'high',
                    timeline: 'immediate',
                    impact: 'high'
                });
            }
        });
        // Architecture recommendations
        recommendations.push({
            category: 'architecture',
            title: 'Microservices Consideration',
            description: 'Evaluate microservices architecture for scalability as the application grows',
            priority: 'medium',
            timeline: 'long-term',
            impact: 'medium'
        });
        return recommendations;
    }
    /**
     * Enhance technologies with gap analysis
     */
    enhanceTechnologies(gapAnalysis) {
        const enhanced = {
            frontend: this.enhanceCategoryTechnologies(this.techStack.technologies.frontend, gapAnalysis.frontend),
            backend: this.enhanceCategoryTechnologies(this.techStack.technologies.backend, gapAnalysis.backend),
            database: this.enhanceCategoryTechnologies(this.techStack.technologies.database, gapAnalysis.database),
            infrastructure: this.enhanceCategoryTechnologies(this.techStack.technologies.infrastructure, gapAnalysis.infrastructure),
            platforms: this.enhanceCategoryTechnologies(this.techStack.technologies.platforms, gapAnalysis.platforms),
            ai: this.enhanceCategoryTechnologies(this.techStack.technologies.ai, gapAnalysis.ai),
            development: this.enhanceCategoryTechnologies(this.techStack.technologies.development, gapAnalysis.development),
            integrations: this.enhanceCategoryTechnologies(this.techStack.technologies.integrations, gapAnalysis.integrations)
        };
        return enhanced;
    }
    /**
     * Enhance category technologies with gap recommendations
     */
    enhanceCategoryTechnologies(technologies, gapAnalysis) {
        const enhanced = [...technologies];
        // Add gap recommendations as potential technologies
        if (gapAnalysis.identified_gaps.length > 0) {
            enhanced.push(`GAP: ${gapAnalysis.recommendations.join(', ')}`);
        }
        return enhanced;
    }
    // Recommendation generators for each category
    generateFrontendRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('TypeScript')) {
                recommendations.push('Implement TypeScript for type safety');
            }
            if (gap.includes('CSS')) {
                recommendations.push('Add Tailwind CSS for utility-first styling');
            }
            if (gap.includes('State')) {
                recommendations.push('Implement Zustand or Redux for state management');
            }
            if (gap.includes('framework')) {
                recommendations.push('Choose React or Vue.js framework');
            }
        });
        return recommendations;
    }
    generateBackendRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('API')) {
                recommendations.push('Implement Express.js or Fastify API framework');
            }
            if (gap.includes('Auth')) {
                recommendations.push('Add NextAuth.js or Supabase Auth');
            }
            if (gap.includes('documentation')) {
                recommendations.push('Implement OpenAPI/Swagger documentation');
            }
            if (gap.includes('Rate')) {
                recommendations.push('Add rate limiting middleware');
            }
        });
        return recommendations;
    }
    generateDatabaseRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('database')) {
                recommendations.push('Implement PostgreSQL with Supabase');
            }
            if (gap.includes('ORM')) {
                recommendations.push('Add Prisma ORM for database operations');
            }
            if (gap.includes('Cache')) {
                recommendations.push('Implement Redis for caching');
            }
            if (gap.includes('backup')) {
                recommendations.push('Set up automated database backups');
            }
        });
        return recommendations;
    }
    generateInfrastructureRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('Deployment')) {
                recommendations.push('Deploy on Vercel or Netlify');
            }
            if (gap.includes('monitoring')) {
                recommendations.push('Add Sentry for error monitoring');
            }
            if (gap.includes('Analytics')) {
                recommendations.push('Implement Google Analytics or Mixpanel');
            }
            if (gap.includes('CDN')) {
                recommendations.push('Add CloudFlare CDN');
            }
        });
        return recommendations;
    }
    generatePlatformRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('Payment')) {
                recommendations.push('Integrate Stripe for payments');
            }
            if (gap.includes('Email')) {
                recommendations.push('Add SendGrid for email service');
            }
            if (gap.includes('Search')) {
                recommendations.push('Implement Algolia for search');
            }
        });
        return recommendations;
    }
    generateAIRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('AI API')) {
                recommendations.push('Integrate OpenAI or Anthropic API');
            }
            if (gap.includes('framework')) {
                recommendations.push('Add LangChain framework');
            }
            if (gap.includes('Vector')) {
                recommendations.push('Implement Pinecone vector database');
            }
        });
        return recommendations;
    }
    generateDevelopmentRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('linting')) {
                recommendations.push('Add ESLint and Prettier');
            }
            if (gap.includes('Testing')) {
                recommendations.push('Implement Jest and Cypress testing');
            }
            if (gap.includes('TypeScript')) {
                recommendations.push('Migrate to TypeScript');
            }
            if (gap.includes('hooks')) {
                recommendations.push('Add Husky pre-commit hooks');
            }
        });
        return recommendations;
    }
    generateIntegrationRecommendations(gaps) {
        const recommendations = [];
        gaps.forEach(gap => {
            if (gap.includes('Auth')) {
                recommendations.push('Implement OAuth integrations');
            }
            if (gap.includes('API')) {
                recommendations.push('Add webhook integrations');
            }
            if (gap.includes('Third-party')) {
                recommendations.push('Integrate essential third-party services');
            }
        });
        return recommendations;
    }
}
// Export the tool for MCP integration
export const gapAnalysisEngineTool = {
    name: 'analyze_technology_gaps',
    description: 'Agent 3: Analyze technology gaps and provide strategic recommendations',
    inputSchema: {
        type: "object",
        properties: {
            structured_tech_stack: { type: "object", description: "Output from technology analyzer" },
            user_id: { type: "string", description: "User ID for tracking" }
        },
        required: ["structured_tech_stack", "user_id"]
    },
    handler: async ({ structured_tech_stack, user_id }) => {
        try {
            const gapEngine = new GapAnalysisEngine(structured_tech_stack);
            const result = await gapEngine.analyze();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error('❌ Gap Analysis Engine failed:', error);
            throw error;
        }
    }
};
/**
 * Parse repository URL to extract owner and repo name
 */
function parseRepositoryUrl(url) {
    try {
        let cleanUrl = url.replace(/^https?:\/\/github\.com\//, '');
        cleanUrl = cleanUrl.replace(/\.git$/, '');
        const parts = cleanUrl.split('/');
        if (parts.length >= 2) {
            return {
                owner: parts[0],
                repo: parts[1]
            };
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * ORCHESTRATOR: Coordinates all three agents
 * Manages the complete workflow from repository exploration to gap analysis
 */
export class GitHubAnalysisOrchestrator {
    githubToken;
    repositoryUrl;
    userId;
    analysisDepth;
    focusAreas;
    constructor(githubToken, repositoryUrl, userId, analysisDepth = 'standard', focusAreas = []) {
        this.githubToken = githubToken;
        this.repositoryUrl = repositoryUrl;
        this.userId = userId;
        this.analysisDepth = analysisDepth;
        this.focusAreas = focusAreas;
    }
    /**
     * Orchestrates the complete three-agent analysis workflow
     */
    async orchestrate() {
        console.log('🎯 GitHubAnalysisOrchestrator: Starting comprehensive three-agent analysis');
        console.log(`📊 Analysis depth: ${this.analysisDepth}`);
        console.log(`🎯 Focus areas: ${this.focusAreas.join(', ')}`);
        try {
            // Parse repository URL
            const repoInfo = parseRepositoryUrl(this.repositoryUrl);
            if (!repoInfo) {
                throw new Error('Invalid repository URL format');
            }
            console.log(`🔍 Repository: ${repoInfo.owner}/${repoInfo.repo}`);
            // STAGE 1: Repository Explorer
            console.log('\n=== STAGE 1: Repository Explorer ===');
            const explorer = new RepositoryExplorer(this.githubToken, repoInfo.owner, repoInfo.repo);
            const explorerResult = await explorer.explore();
            console.log(`✅ Stage 1 Complete: ${explorerResult.total_files_scanned} files scanned, ${explorerResult.files.length} key files analyzed`);
            // STAGE 2: Technology Analyzer
            console.log('\n=== STAGE 2: Technology Analyzer ===');
            const analyzer = new TechnologyAnalyzer(explorerResult);
            const structuredTechStack = await analyzer.analyze();
            console.log(`✅ Stage 2 Complete: ${Object.keys(structuredTechStack.technologies).length} technology categories analyzed`);
            // STAGE 3: Gap Analysis Engine
            console.log('\n=== STAGE 3: Gap Analysis Engine ===');
            const gapEngine = new GapAnalysisEngine(structuredTechStack);
            const gapAnalysis = await gapEngine.analyze();
            console.log(`✅ Stage 3 Complete: ${gapAnalysis.recommendations.length} strategic recommendations generated`);
            // Combine all results
            const finalResult = {
                analysis_metadata: {
                    repository_url: this.repositoryUrl,
                    user_id: this.userId,
                    analysis_depth: this.analysisDepth,
                    focus_areas: this.focusAreas,
                    analysis_timestamp: new Date().toISOString(),
                    agent_sequence: ['Repository Explorer', 'Technology Analyzer', 'Gap Analysis Engine']
                },
                stage_1_exploration: {
                    repository_info: explorerResult.repository_info,
                    files_scanned: explorerResult.total_files_scanned,
                    key_files_analyzed: explorerResult.files.length,
                    directory_structure: explorerResult.directory_structure
                },
                stage_2_technology_analysis: {
                    technologies: structuredTechStack.technologies,
                    frameworks: structuredTechStack.frameworks,
                    languages: structuredTechStack.languages,
                    package_managers: structuredTechStack.package_managers,
                    infrastructure: structuredTechStack.infrastructure,
                    development_tools: structuredTechStack.development_tools
                },
                stage_3_gap_analysis: {
                    gap_analysis: gapAnalysis.gap_analysis,
                    recommendations: gapAnalysis.recommendations,
                    key_decisions: gapAnalysis.key_decisions,
                    migration_notes: gapAnalysis.migration_notes
                },
                // Enhanced tech stack with GAP recommendations
                enhanced_tech_stack: {
                    // Core technologies from stage 2
                    frontend: structuredTechStack.technologies.frontend,
                    backend: structuredTechStack.technologies.backend,
                    database: structuredTechStack.technologies.database,
                    infrastructure: structuredTechStack.technologies.infrastructure,
                    platforms: structuredTechStack.technologies.platforms,
                    ai: structuredTechStack.technologies.ai,
                    development: structuredTechStack.technologies.development,
                    integrations: structuredTechStack.technologies.integrations,
                    // Add GAP recommendations where appropriate
                    frontend_gaps: this.extractGapRecommendations(gapAnalysis.gap_analysis.frontend?.recommendations || []),
                    backend_gaps: this.extractGapRecommendations(gapAnalysis.gap_analysis.backend?.recommendations || []),
                    database_gaps: this.extractGapRecommendations(gapAnalysis.gap_analysis.database?.recommendations || []),
                    infrastructure_gaps: this.extractGapRecommendations(gapAnalysis.gap_analysis.infrastructure?.recommendations || []),
                    ai_gaps: this.extractGapRecommendations(gapAnalysis.gap_analysis.ai?.recommendations || []),
                    development_gaps: this.extractGapRecommendations(gapAnalysis.gap_analysis.development?.recommendations || []),
                    integration_gaps: this.extractGapRecommendations(gapAnalysis.gap_analysis.integrations?.recommendations || [])
                },
                // Summary metrics
                summary: {
                    total_technologies_detected: Object.values(structuredTechStack.technologies).flat().length,
                    total_gaps_identified: Object.keys(gapAnalysis.gap_analysis).length,
                    high_priority_recommendations: gapAnalysis.recommendations.filter(r => r.priority === 'high').length,
                    analysis_success: true
                }
            };
            console.log('\n🎉 GitHubAnalysisOrchestrator: Complete analysis finished successfully');
            console.log(`📊 Final Summary: ${finalResult.summary.total_technologies_detected} technologies, ${finalResult.summary.total_gaps_identified} gaps, ${finalResult.summary.high_priority_recommendations} high-priority recommendations`);
            return finalResult;
        }
        catch (error) {
            console.error('❌ GitHubAnalysisOrchestrator: Analysis failed:', error);
            throw new Error(`Orchestration failed: ${error.message}`);
        }
    }
    /**
     * Extract GAP recommendations formatted for tech stack fields
     */
    extractGapRecommendations(recommendations) {
        return recommendations.map(rec => `GAP: ${rec}`);
    }
}
// Export the orchestrator tool for MCP integration
export const githubAnalysisOrchestratorTool = {
    name: 'analyze_github_repository_comprehensive',
    description: 'Complete GitHub repository analysis using three-agent workflow',
    inputSchema: {
        type: "object",
        properties: {
            repository_url: {
                type: "string",
                description: "GitHub repository URL (e.g., 'owner/repo' or full URL)"
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
                default: [],
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
            const orchestrator = new GitHubAnalysisOrchestrator(github_token, repository_url, user_id, analysis_depth, focus_areas);
            const result = await orchestrator.orchestrate();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(result, null, 2)
                    }]
            };
        }
        catch (error) {
            console.error('❌ GitHub Analysis Orchestrator failed:', error);
            throw error;
        }
    }
};
// Export handler for HTTP server integration
export const handleComprehensiveGitHubAnalysis = githubAnalysisOrchestratorTool.handler;
//# sourceMappingURL=github-analysis-agents.js.map