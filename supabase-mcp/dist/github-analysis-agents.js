"use strict";
/**
 * Three-Agent GitHub Analysis System
 * Agent 1: Repository Explorer - Comprehensive file scanning and data collection
 * Agent 2: Technology Analyzer - Structured categorization and processing
 * Agent 3: Gap Analysis Engine - Strategic recommendations and gap identification
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleComprehensiveGitHubAnalysis = exports.githubAnalysisOrchestratorTool = exports.GitHubAnalysisOrchestrator = exports.gapAnalysisEngineTool = exports.GapAnalysisEngine = exports.technologyAnalyzerTool = exports.TechnologyAnalyzer = exports.repositoryExplorerTool = exports.RepositoryExplorer = void 0;
/**
 * AGENT 1: Repository Explorer
 * Scans repository comprehensively and collects raw file data
 */
var RepositoryExplorer = /** @class */ (function () {
    function RepositoryExplorer(githubToken, owner, repo) {
        this.github = {
            headers: {
                'Authorization': "Bearer ".concat(githubToken),
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
    RepositoryExplorer.prototype.explore = function () {
        return __awaiter(this, void 0, void 0, function () {
            var repositoryInfo, allFiles, filesToAnalyze, fileContents, directoryStructure, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD0D Agent 1: Starting comprehensive repository exploration for ".concat(this.owner, "/").concat(this.repo));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.getRepositoryInfo()];
                    case 2:
                        repositoryInfo = _a.sent();
                        return [4 /*yield*/, this.getAllFiles()];
                    case 3:
                        allFiles = _a.sent();
                        filesToAnalyze = this.prioritizeFiles(allFiles);
                        return [4 /*yield*/, this.fetchFileContents(filesToAnalyze)];
                    case 4:
                        fileContents = _a.sent();
                        directoryStructure = this.buildDirectoryStructure(allFiles);
                        result = {
                            repository_info: repositoryInfo,
                            files: fileContents,
                            directory_structure: directoryStructure,
                            total_files_scanned: allFiles.length,
                            analysis_timestamp: new Date().toISOString()
                        };
                        console.log("\u2705 Agent 1: Exploration complete. Scanned ".concat(allFiles.length, " files, analyzed ").concat(fileContents.length, " key files"));
                        return [2 /*return*/, result];
                    case 5:
                        error_1 = _a.sent();
                        console.error('❌ Agent 1: Repository exploration failed:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get repository basic information
     */
    RepositoryExplorer.prototype.getRepositoryInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, repo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('📋 Agent 1: Fetching repository information...');
                        return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(this.owner, "/").concat(this.repo), {
                                headers: this.github.headers
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch repository info: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        repo = _a.sent();
                        return [2 /*return*/, {
                                name: repo.name,
                                full_name: repo.full_name,
                                description: repo.description,
                                language: repo.language,
                                size: repo.size,
                                updated_at: repo.updated_at,
                                default_branch: repo.default_branch
                            }];
                }
            });
        });
    };
    /**
     * Get all files in the repository using recursive tree API
     */
    RepositoryExplorer.prototype.getAllFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, _b, _c, data;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.log('📁 Agent 1: Scanning all repository files...');
                        _a = fetch;
                        _c = (_b = "https://api.github.com/repos/".concat(this.owner, "/").concat(this.repo, "/git/trees/")).concat;
                        return [4 /*yield*/, this.getDefaultBranch()];
                    case 1: return [4 /*yield*/, _a.apply(void 0, [_c.apply(_b, [_d.sent(), "?recursive=1"]), {
                                headers: this.github.headers
                            }])];
                    case 2:
                        response = _d.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch file tree: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _d.sent();
                        return [2 /*return*/, data.tree
                                .filter(function (item) { return item.type === 'blob'; }) // Only files, not directories
                                .map(function (item) { return ({
                                path: item.path,
                                type: item.type,
                                size: item.size
                            }); })];
                }
            });
        });
    };
    /**
     * Prioritize files for analysis based on importance
     */
    RepositoryExplorer.prototype.prioritizeFiles = function (allFiles) {
        console.log('🎯 Agent 1: Prioritizing files for analysis...');
        var criticalFiles = [
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
        var importantPatterns = [
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
        var prioritizedFiles = new Set();
        // Add critical files that exist
        criticalFiles.forEach(function (file) {
            if (allFiles.some(function (f) { return f.path === file; })) {
                prioritizedFiles.add(file);
            }
        });
        // Add files matching important patterns (limit to avoid API rate limits)
        allFiles.forEach(function (file) {
            if (prioritizedFiles.size >= 50)
                return; // Limit to avoid GitHub API rate limits
            if (importantPatterns.some(function (pattern) { return pattern.test(file.path); })) {
                prioritizedFiles.add(file.path);
            }
        });
        console.log("\uD83D\uDCCA Agent 1: Selected ".concat(prioritizedFiles.size, " priority files for analysis"));
        return Array.from(prioritizedFiles);
    };
    /**
     * Fetch contents of prioritized files
     */
    RepositoryExplorer.prototype.fetchFileContents = function (filePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContents, _i, filePaths_1, filePath, response, data, content, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDCC4 Agent 1: Fetching contents of ".concat(filePaths.length, " files..."));
                        fileContents = [];
                        _i = 0, filePaths_1 = filePaths;
                        _a.label = 1;
                    case 1:
                        if (!(_i < filePaths_1.length)) return [3 /*break*/, 8];
                        filePath = filePaths_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(this.owner, "/").concat(this.repo, "/contents/").concat(filePath), {
                                headers: this.github.headers
                            })];
                    case 3:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 5];
                        return [4 /*yield*/, response.json()];
                    case 4:
                        data = _a.sent();
                        if (data.content && data.encoding === 'base64') {
                            content = Buffer.from(data.content, 'base64').toString('utf-8');
                            fileContents.push({
                                path: filePath,
                                content: content,
                                size: data.size,
                                type: this.getFileType(filePath)
                            });
                        }
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.warn("\u26A0\uFE0F Agent 1: Failed to fetch ".concat(filePath, ":"), error_2);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        console.log("\u2705 Agent 1: Successfully fetched ".concat(fileContents.length, " file contents"));
                        return [2 /*return*/, fileContents];
                }
            });
        });
    };
    /**
     * Build directory structure for overview
     */
    RepositoryExplorer.prototype.buildDirectoryStructure = function (allFiles) {
        var directories = new Set();
        allFiles.forEach(function (file) {
            var pathParts = file.path.split('/');
            var currentPath = '';
            pathParts.forEach(function (part, index) {
                if (index < pathParts.length - 1) { // Not the filename
                    currentPath += (currentPath ? '/' : '') + part;
                    directories.add(currentPath);
                }
            });
        });
        return Array.from(directories).sort();
    };
    /**
     * Get file type based on extension
     */
    RepositoryExplorer.prototype.getFileType = function (filePath) {
        var _a;
        var extension = (_a = filePath.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        var typeMap = {
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
    };
    /**
     * Get default branch name
     */
    RepositoryExplorer.prototype.getDefaultBranch = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For now, assume 'main' but could be made dynamic
                return [2 /*return*/, 'main'];
            });
        });
    };
    return RepositoryExplorer;
}());
exports.RepositoryExplorer = RepositoryExplorer;
// Export the tool for MCP integration
exports.repositoryExplorerTool = {
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
    handler: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var repoInfo, explorer, result, error_3;
        var repository_url = _b.repository_url, github_token = _b.github_token, user_id = _b.user_id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    repoInfo = parseRepositoryUrl(repository_url);
                    if (!repoInfo) {
                        throw new Error("Invalid repository URL format");
                    }
                    explorer = new RepositoryExplorer(github_token, repoInfo.owner, repoInfo.repo);
                    return [4 /*yield*/, explorer.explore()];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify(result, null, 2)
                                }]
                        }];
                case 2:
                    error_3 = _c.sent();
                    console.error('❌ Repository Explorer failed:', error_3);
                    throw error_3;
                case 3: return [2 /*return*/];
            }
        });
    }); }
};
/**
 * AGENT 2: Technology Analyzer
 * Processes raw repository data and categorizes technologies
 */
var TechnologyAnalyzer = /** @class */ (function () {
    function TechnologyAnalyzer(explorerData) {
        this.explorerData = explorerData;
    }
    /**
     * Main analysis method - processes explorer data into structured tech stack
     */
    TechnologyAnalyzer.prototype.analyze = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dependencies, configurations, frameworks, technologies, infrastructure, database, aiIntegrations, result;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDD2C Agent 2: Starting technology analysis for ".concat(this.explorerData.repository_info.name));
                try {
                    dependencies = this.extractDependencies();
                    configurations = this.analyzeConfigurations();
                    frameworks = this.detectFrameworks(dependencies, configurations);
                    technologies = this.categorizeTechnologies(dependencies, configurations, frameworks);
                    infrastructure = this.analyzeInfrastructure();
                    database = this.analyzeDatabase(dependencies);
                    aiIntegrations = this.detectAIIntegrations(dependencies);
                    result = {
                        repository_info: this.explorerData.repository_info,
                        technologies: technologies,
                        frameworks: frameworks,
                        languages: this.detectLanguages(),
                        package_managers: this.detectPackageManagers(),
                        development_tools: this.detectDevelopmentTools(dependencies),
                        dependencies: dependencies,
                        configurations: configurations,
                        infrastructure: infrastructure,
                        database: database,
                        ai_integrations: aiIntegrations,
                        analysis_metadata: {
                            files_analyzed: this.explorerData.files.length,
                            total_files_scanned: this.explorerData.total_files_scanned,
                            dependencies_count: Object.keys(dependencies).length,
                            analysis_timestamp: new Date().toISOString(),
                            method: 'Agent-based analysis'
                        }
                    };
                    console.log("\u2705 Agent 2: Analysis complete. Categorized ".concat(Object.keys(dependencies).length, " dependencies into structured tech stack"));
                    return [2 /*return*/, result];
                }
                catch (error) {
                    console.error('❌ Agent 2: Technology analysis failed:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Extract dependencies from package.json and other dependency files
     */
    TechnologyAnalyzer.prototype.extractDependencies = function () {
        var _this = this;
        console.log('📦 Agent 2: Extracting dependencies...');
        var dependencies = {};
        // Process package.json
        var packageJson = this.explorerData.files.find(function (f) { return f.path === 'package.json'; });
        if (packageJson) {
            try {
                var parsed = JSON.parse(packageJson.content);
                Object.assign(dependencies, parsed.dependencies || {});
                Object.assign(dependencies, parsed.devDependencies || {});
            }
            catch (error) {
                console.warn('⚠️ Agent 2: Failed to parse package.json');
            }
        }
        // Process other dependency files
        var dependencyFiles = [
            { path: 'requirements.txt', parser: this.parseRequirementsTxt },
            { path: 'Gemfile', parser: this.parseGemfile },
            { path: 'composer.json', parser: this.parseComposerJson },
            { path: 'go.mod', parser: this.parseGoMod },
            { path: 'Cargo.toml', parser: this.parseCargoToml }
        ];
        dependencyFiles.forEach(function (_a) {
            var path = _a.path, parser = _a.parser;
            var file = _this.explorerData.files.find(function (f) { return f.path === path; });
            if (file) {
                try {
                    var deps = parser.call(_this, file.content);
                    Object.assign(dependencies, deps);
                }
                catch (error) {
                    console.warn("\u26A0\uFE0F Agent 2: Failed to parse ".concat(path));
                }
            }
        });
        return dependencies;
    };
    /**
     * Analyze configuration files to detect tools and frameworks
     */
    TechnologyAnalyzer.prototype.analyzeConfigurations = function () {
        var _this = this;
        console.log('⚙️ Agent 2: Analyzing configuration files...');
        var configurations = {};
        var configFiles = [
            'next.config.js', 'next.config.mjs', 'nuxt.config.js', 'vue.config.js',
            'angular.json', 'svelte.config.js', 'vite.config.js', 'webpack.config.js',
            'tailwind.config.js', 'postcss.config.js', 'tsconfig.json', 'jsconfig.json',
            'babel.config.js', '.eslintrc.js', '.eslintrc.json', 'prettier.config.js',
            'jest.config.js', 'vitest.config.js', 'cypress.config.js'
        ];
        configFiles.forEach(function (configFile) {
            var file = _this.explorerData.files.find(function (f) { return f.path === configFile; });
            if (file) {
                configurations[configFile] = {
                    exists: true,
                    size: file.size,
                    content_preview: file.content.substring(0, 200)
                };
            }
        });
        return configurations;
    };
    /**
     * Detect frameworks and tools from dependencies and configurations
     */
    TechnologyAnalyzer.prototype.detectFrameworks = function (dependencies, configurations) {
        console.log('🛠️ Agent 2: Detecting frameworks...');
        var frameworks = [];
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
    };
    /**
     * Categorize technologies into structured format
     */
    TechnologyAnalyzer.prototype.categorizeTechnologies = function (dependencies, configurations, frameworks) {
        console.log('📊 Agent 2: Categorizing technologies...');
        var technologies = {
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
            technologies.frontend.push("Next.js-".concat(dependencies['next'].replace(/[\^\~]/, '')));
        if (dependencies['react'])
            technologies.frontend.push("React-".concat(dependencies['react'].replace(/[\^\~]/, '')));
        if (dependencies['vue'])
            technologies.frontend.push("Vue.js-".concat(dependencies['vue'].replace(/[\^\~]/, '')));
        if (dependencies['tailwindcss'])
            technologies.frontend.push("Tailwind-CSS-".concat(dependencies['tailwindcss'].replace(/[\^\~]/, '')));
        if (dependencies['@headlessui/react'])
            technologies.frontend.push("Headless-UI-".concat(dependencies['@headlessui/react'].replace(/[\^\~]/, '')));
        if (dependencies['framer-motion'])
            technologies.frontend.push("Framer-Motion-".concat(dependencies['framer-motion'].replace(/[\^\~]/, '')));
        if (dependencies['lucide-react'])
            technologies.frontend.push("Lucide-React-".concat(dependencies['lucide-react'].replace(/[\^\~]/, '')));
        // Backend technologies
        if (dependencies['@supabase/supabase-js'])
            technologies.backend.push("Supabase-".concat(dependencies['@supabase/supabase-js'].replace(/[\^\~]/, '')));
        if (dependencies['express'])
            technologies.backend.push("Express-".concat(dependencies['express'].replace(/[\^\~]/, '')));
        if (dependencies['fastify'])
            technologies.backend.push("Fastify-".concat(dependencies['fastify'].replace(/[\^\~]/, '')));
        if (dependencies['next'] && !dependencies['express'])
            technologies.backend.push('Next.js-API-Routes');
        // Database technologies
        if (dependencies['@supabase/supabase-js']) {
            technologies.database.push('PostgreSQL');
            technologies.database.push('Supabase');
        }
        if (dependencies['prisma'])
            technologies.database.push("Prisma-".concat(dependencies['prisma'].replace(/[\^\~]/, '')));
        if (dependencies['pg'])
            technologies.database.push("PostgreSQL-".concat(dependencies['pg'].replace(/[\^\~]/, '')));
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
            technologies.ai.push("OpenAI-".concat(dependencies['openai'].replace(/[\^\~]/, '')));
        if (dependencies['@anthropic-ai/sdk'])
            technologies.ai.push("Anthropic-".concat(dependencies['@anthropic-ai/sdk'].replace(/[\^\~]/, '')));
        if (dependencies['langchain'])
            technologies.ai.push("LangChain-".concat(dependencies['langchain'].replace(/[\^\~]/, '')));
        // Development tools
        if (dependencies['typescript'])
            technologies.development.push("TypeScript-".concat(dependencies['typescript'].replace(/[\^\~]/, '')));
        if (dependencies['eslint'])
            technologies.development.push("ESLint-".concat(dependencies['eslint'].replace(/[\^\~]/, '')));
        if (dependencies['prettier'])
            technologies.development.push("Prettier-".concat(dependencies['prettier'].replace(/[\^\~]/, '')));
        if (dependencies['jest'])
            technologies.development.push("Jest-".concat(dependencies['jest'].replace(/[\^\~]/, '')));
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
    };
    /**
     * Analyze infrastructure setup
     */
    TechnologyAnalyzer.prototype.analyzeInfrastructure = function () {
        console.log('🏗️ Agent 2: Analyzing infrastructure...');
        var infrastructure = {
            deployment: [],
            containerization: [],
            ci_cd: [],
            monitoring: []
        };
        // Check for deployment configurations
        if (this.explorerData.files.some(function (f) { return f.path === 'vercel.json'; })) {
            infrastructure.deployment.push('Vercel');
        }
        if (this.explorerData.files.some(function (f) { return f.path === 'netlify.toml'; })) {
            infrastructure.deployment.push('Netlify');
        }
        // Check for containerization
        if (this.explorerData.files.some(function (f) { return f.path === 'Dockerfile'; })) {
            infrastructure.containerization.push('Docker');
        }
        if (this.explorerData.files.some(function (f) { return f.path === 'docker-compose.yml'; })) {
            infrastructure.containerization.push('Docker Compose');
        }
        // Check for CI/CD
        var workflowFiles = this.explorerData.files.filter(function (f) { return f.path.startsWith('.github/workflows/'); });
        if (workflowFiles.length > 0) {
            infrastructure.ci_cd.push('GitHub Actions');
        }
        return infrastructure;
    };
    /**
     * Analyze database setup
     */
    TechnologyAnalyzer.prototype.analyzeDatabase = function (dependencies) {
        console.log('🗄️ Agent 2: Analyzing database setup...');
        var database = {
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
        if (this.explorerData.files.some(function (f) { return f.path.includes('supabase/migrations'); })) {
            database.migrations.push('Supabase Migrations');
        }
        if (this.explorerData.files.some(function (f) { return f.path.includes('prisma/migrations'); })) {
            database.migrations.push('Prisma Migrations');
        }
        return database;
    };
    /**
     * Detect AI/ML integrations from code analysis
     */
    TechnologyAnalyzer.prototype.detectAIIntegrations = function (dependencies) {
        console.log('🤖 Agent 2: Detecting AI integrations...');
        var ai = {
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
        var codeFiles = this.explorerData.files.filter(function (f) {
            return f.type === 'typescript' || f.type === 'javascript';
        });
        codeFiles.forEach(function (file) {
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
    };
    // Dependency file parsers
    TechnologyAnalyzer.prototype.parseRequirementsTxt = function (content) {
        var deps = {};
        content.split('\n').forEach(function (line) {
            var match = line.trim().match(/^([^=<>!]+)[=<>!](.+)$/);
            if (match) {
                deps[match[1]] = match[2];
            }
        });
        return deps;
    };
    TechnologyAnalyzer.prototype.parseGemfile = function (content) {
        var deps = {};
        var gemMatches = content.match(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/g);
        if (gemMatches) {
            gemMatches.forEach(function (match) {
                var parts = match.match(/gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/);
                if (parts) {
                    deps[parts[1]] = parts[2] || 'latest';
                }
            });
        }
        return deps;
    };
    TechnologyAnalyzer.prototype.parseComposerJson = function (content) {
        try {
            var parsed = JSON.parse(content);
            return __assign(__assign({}, (parsed.require || {})), (parsed['require-dev'] || {}));
        }
        catch (_a) {
            return {};
        }
    };
    TechnologyAnalyzer.prototype.parseGoMod = function (content) {
        var deps = {};
        var requireMatches = content.match(/require\s+\(([^)]+)\)/);
        if (requireMatches) {
            requireMatches[1].split('\n').forEach(function (line) {
                var match = line.trim().match(/^([^\s]+)\s+(.+)$/);
                if (match) {
                    deps[match[1]] = match[2];
                }
            });
        }
        return deps;
    };
    TechnologyAnalyzer.prototype.parseCargoToml = function (content) {
        var deps = {};
        var dependenciesSection = content.match(/\[dependencies\](.*?)(?=\n\[|\n$)/);
        if (dependenciesSection) {
            dependenciesSection[1].split('\n').forEach(function (line) {
                var match = line.trim().match(/^([^=]+)\s*=\s*["']([^"']+)["']/);
                if (match) {
                    deps[match[1]] = match[2];
                }
            });
        }
        return deps;
    };
    /**
     * Detect programming languages from file extensions
     */
    TechnologyAnalyzer.prototype.detectLanguages = function () {
        var languages = new Set();
        this.explorerData.files.forEach(function (file) {
            var _a;
            var ext = (_a = file.path.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
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
    };
    /**
     * Detect package managers from lock files
     */
    TechnologyAnalyzer.prototype.detectPackageManagers = function () {
        var _this = this;
        var packageManagers = [];
        var lockFiles = [
            { file: 'package-lock.json', manager: 'npm' },
            { file: 'yarn.lock', manager: 'yarn' },
            { file: 'pnpm-lock.yaml', manager: 'pnpm' },
            { file: 'requirements.txt', manager: 'pip' },
            { file: 'Gemfile.lock', manager: 'bundler' },
            { file: 'composer.lock', manager: 'composer' },
            { file: 'go.sum', manager: 'go modules' },
            { file: 'Cargo.lock', manager: 'cargo' }
        ];
        lockFiles.forEach(function (_a) {
            var file = _a.file, manager = _a.manager;
            if (_this.explorerData.files.some(function (f) { return f.path === file; })) {
                packageManagers.push(manager);
            }
        });
        return packageManagers;
    };
    /**
     * Detect development tools from dependencies
     */
    TechnologyAnalyzer.prototype.detectDevelopmentTools = function (dependencies) {
        var tools = [];
        var devTools = [
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
        devTools.forEach(function (_a) {
            var dep = _a.dep, tool = _a.tool;
            if (dependencies[dep] || dependencies["@".concat(dep)] || dependencies["".concat(dep, "-*")]) {
                tools.push(tool);
            }
        });
        return tools;
    };
    return TechnologyAnalyzer;
}());
exports.TechnologyAnalyzer = TechnologyAnalyzer;
// Export the tool for MCP integration
exports.technologyAnalyzerTool = {
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
    handler: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var analyzer, result, error_4;
        var exploration_data = _b.exploration_data, user_id = _b.user_id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    analyzer = new TechnologyAnalyzer(exploration_data);
                    return [4 /*yield*/, analyzer.analyze()];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify(result, null, 2)
                                }]
                        }];
                case 2:
                    error_4 = _c.sent();
                    console.error('❌ Technology Analyzer failed:', error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    }); }
};
/**
 * AGENT 3: Gap Analysis Engine
 * Analyzes structured tech stack and provides strategic recommendations
 */
var GapAnalysisEngine = /** @class */ (function () {
    function GapAnalysisEngine(techStack) {
        this.techStack = techStack;
    }
    /**
     * Main gap analysis method - identifies missing components and provides recommendations
     */
    GapAnalysisEngine.prototype.analyze = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gapAnalysis, keyDecisions, migrationNotes, enhancedTechStack;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDD0D Agent 3: Starting gap analysis for ".concat(this.techStack.repository_info.name));
                try {
                    gapAnalysis = {
                        frontend: this.analyzeFrontendGaps(),
                        backend: this.analyzeBackendGaps(),
                        database: this.analyzeDatabaseGaps(),
                        infrastructure: this.analyzeInfrastructureGaps(),
                        platforms: this.analyzePlatformGaps(),
                        ai: this.analyzeAIGaps(),
                        development: this.analyzeDevelopmentGaps(),
                        integrations: this.analyzeIntegrationGaps()
                    };
                    keyDecisions = this.generateKeyDecisions();
                    migrationNotes = this.generateMigrationNotes();
                    enhancedTechStack = __assign(__assign({}, this.techStack), { technologies: this.enhanceTechnologies(gapAnalysis), gap_analysis: gapAnalysis, key_decisions: keyDecisions, migration_notes: migrationNotes, recommendations: this.generateStrategicRecommendations(gapAnalysis) });
                    console.log("\u2705 Agent 3: Gap analysis complete. Generated ".concat(Object.keys(gapAnalysis).length, " category analyses with strategic recommendations"));
                    return [2 /*return*/, enhancedTechStack];
                }
                catch (error) {
                    console.error('❌ Agent 3: Gap analysis failed:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Analyze frontend technology gaps
     */
    GapAnalysisEngine.prototype.analyzeFrontendGaps = function () {
        var frontend = this.techStack.technologies.frontend;
        var gaps = [];
        // Check for missing essential frontend tools
        if (!frontend.some(function (tech) { return tech.includes('React') || tech.includes('Vue') || tech.includes('Angular'); })) {
            gaps.push('No frontend framework detected');
        }
        if (!frontend.some(function (tech) { return tech.includes('TypeScript'); })) {
            gaps.push('Consider TypeScript for type safety');
        }
        if (!frontend.some(function (tech) { return tech.includes('Tailwind') || tech.includes('CSS'); })) {
            gaps.push('No CSS framework detected - consider Tailwind CSS');
        }
        if (!frontend.some(function (tech) { return tech.includes('State') || tech.includes('Redux') || tech.includes('Zustand'); })) {
            gaps.push('Consider state management (Redux, Zustand, Jotai)');
        }
        return {
            current_technologies: frontend,
            identified_gaps: gaps,
            recommendations: this.generateFrontendRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    };
    /**
     * Analyze backend technology gaps
     */
    GapAnalysisEngine.prototype.analyzeBackendGaps = function () {
        var backend = this.techStack.technologies.backend;
        var gaps = [];
        // Check for API framework
        if (!backend.some(function (tech) { return tech.includes('Express') || tech.includes('Fastify') || tech.includes('API-Routes'); })) {
            gaps.push('No API framework detected');
        }
        // Check for authentication
        if (!backend.some(function (tech) { return tech.includes('Auth') || tech.includes('Supabase'); })) {
            gaps.push('Authentication system needed (NextAuth, Supabase Auth)');
        }
        // Check for API documentation
        if (!backend.some(function (tech) { return tech.includes('OpenAPI') || tech.includes('Swagger'); })) {
            gaps.push('API documentation tools (OpenAPI, Swagger)');
        }
        // Check for rate limiting
        if (!backend.some(function (tech) { return tech.includes('Rate') || tech.includes('Limit'); })) {
            gaps.push('Rate limiting and security middleware');
        }
        return {
            current_technologies: backend,
            identified_gaps: gaps,
            recommendations: this.generateBackendRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    };
    /**
     * Analyze database technology gaps
     */
    GapAnalysisEngine.prototype.analyzeDatabaseGaps = function () {
        var database = this.techStack.technologies.database;
        var gaps = [];
        // Check for database presence
        if (database.length === 0) {
            gaps.push('No database detected - consider PostgreSQL, MySQL, or MongoDB');
        }
        // Check for ORM
        if (!database.some(function (tech) { return tech.includes('Prisma') || tech.includes('Sequelize') || tech.includes('TypeORM'); })) {
            gaps.push('ORM recommended (Prisma, Sequelize, TypeORM)');
        }
        // Check for caching
        if (!database.some(function (tech) { return tech.includes('Redis') || tech.includes('Cache'); })) {
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
    };
    /**
     * Analyze infrastructure technology gaps
     */
    GapAnalysisEngine.prototype.analyzeInfrastructureGaps = function () {
        var infrastructure = this.techStack.technologies.infrastructure;
        var gaps = [];
        // Check for deployment platform
        if (!infrastructure.some(function (tech) { return tech.includes('Vercel') || tech.includes('Netlify') || tech.includes('AWS'); })) {
            gaps.push('Deployment platform (Vercel, Netlify, AWS)');
        }
        // Check for monitoring
        if (!infrastructure.some(function (tech) { return tech.includes('Sentry') || tech.includes('Monitor'); })) {
            gaps.push('Error monitoring (Sentry, Bugsnag)');
        }
        // Check for analytics
        if (!infrastructure.some(function (tech) { return tech.includes('Analytics') || tech.includes('Tracking'); })) {
            gaps.push('Analytics and tracking (Google Analytics, Mixpanel)');
        }
        // Check for CDN
        if (!infrastructure.some(function (tech) { return tech.includes('CDN') || tech.includes('CloudFlare'); })) {
            gaps.push('CDN for asset delivery (CloudFlare, AWS CloudFront)');
        }
        return {
            current_technologies: infrastructure,
            identified_gaps: gaps,
            recommendations: this.generateInfrastructureRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    };
    /**
     * Analyze platform integration gaps
     */
    GapAnalysisEngine.prototype.analyzePlatformGaps = function () {
        var platforms = this.techStack.technologies.platforms;
        var gaps = [];
        // Check for payment processing
        if (!platforms.some(function (tech) { return tech.includes('Stripe') || tech.includes('PayPal'); })) {
            gaps.push('Payment processing (Stripe, PayPal)');
        }
        // Check for email service
        if (!platforms.some(function (tech) { return tech.includes('SendGrid') || tech.includes('Email'); })) {
            gaps.push('Email service (SendGrid, Mailgun, SES)');
        }
        // Check for search functionality
        if (!platforms.some(function (tech) { return tech.includes('Search') || tech.includes('Elasticsearch'); })) {
            gaps.push('Search functionality (Elasticsearch, Algolia)');
        }
        return {
            current_technologies: platforms,
            identified_gaps: gaps,
            recommendations: this.generatePlatformRecommendations(gaps),
            priority: gaps.length > 1 ? 'medium' : 'low'
        };
    };
    /**
     * Analyze AI technology gaps
     */
    GapAnalysisEngine.prototype.analyzeAIGaps = function () {
        var _a, _b;
        var ai = this.techStack.technologies.ai;
        var gaps = [];
        // For AI-powered platforms, suggest AI integrations
        if (((_a = this.techStack.repository_info.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('ai')) ||
            ((_b = this.techStack.repository_info.description) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('strategy'))) {
            if (ai.length === 0) {
                gaps.push('AI API integration (OpenAI, Anthropic, Google AI)');
            }
            if (!ai.some(function (tech) { return tech.includes('LangChain') || tech.includes('Framework'); })) {
                gaps.push('AI framework (LangChain, LlamaIndex)');
            }
            if (!ai.some(function (tech) { return tech.includes('Vector') || tech.includes('Pinecone'); })) {
                gaps.push('Vector database (Pinecone, Weaviate, Chroma)');
            }
        }
        return {
            current_technologies: ai,
            identified_gaps: gaps,
            recommendations: this.generateAIRecommendations(gaps),
            priority: gaps.length > 1 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    };
    /**
     * Analyze development tools gaps
     */
    GapAnalysisEngine.prototype.analyzeDevelopmentGaps = function () {
        var development = this.techStack.technologies.development;
        var gaps = [];
        // Check for linting
        if (!development.some(function (tech) { return tech.includes('ESLint') || tech.includes('Lint'); })) {
            gaps.push('Code linting (ESLint, Prettier)');
        }
        // Check for testing
        if (!development.some(function (tech) { return tech.includes('Jest') || tech.includes('Test'); })) {
            gaps.push('Testing framework (Jest, Vitest, Cypress)');
        }
        // Check for type checking
        if (!development.some(function (tech) { return tech.includes('TypeScript'); })) {
            gaps.push('Type checking (TypeScript)');
        }
        // Check for pre-commit hooks
        if (!development.some(function (tech) { return tech.includes('Husky') || tech.includes('Hook'); })) {
            gaps.push('Pre-commit hooks (Husky, lint-staged)');
        }
        return {
            current_technologies: development,
            identified_gaps: gaps,
            recommendations: this.generateDevelopmentRecommendations(gaps),
            priority: gaps.length > 2 ? 'high' : gaps.length > 0 ? 'medium' : 'low'
        };
    };
    /**
     * Analyze integration gaps
     */
    GapAnalysisEngine.prototype.analyzeIntegrationGaps = function () {
        var integrations = this.techStack.technologies.integrations;
        var gaps = [];
        // Check for authentication integration
        if (!integrations.some(function (tech) { return tech.includes('Auth'); })) {
            gaps.push('Authentication integration');
        }
        // Check for API integrations
        if (!integrations.some(function (tech) { return tech.includes('API') || tech.includes('Webhook'); })) {
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
    };
    /**
     * Generate key technology decisions analysis
     */
    GapAnalysisEngine.prototype.generateKeyDecisions = function () {
        var decisions = [];
        // Framework decisions
        if (this.techStack.technologies.frontend.some(function (tech) { return tech.includes('Next.js'); })) {
            decisions.push('Chose Next.js over Create React App for SSR capabilities and API routes');
        }
        if (this.techStack.technologies.database.some(function (tech) { return tech.includes('Supabase'); })) {
            decisions.push('Chose Supabase over Firebase for PostgreSQL compatibility and better developer experience');
        }
        if (this.techStack.technologies.frontend.some(function (tech) { return tech.includes('Tailwind'); })) {
            decisions.push('Chose Tailwind CSS over styled-components for utility-first styling approach');
        }
        if (this.techStack.technologies.development.some(function (tech) { return tech.includes('TypeScript'); })) {
            decisions.push('Chose TypeScript over JavaScript for type safety and better developer experience');
        }
        return decisions;
    };
    /**
     * Generate migration recommendations
     */
    GapAnalysisEngine.prototype.generateMigrationNotes = function () {
        var migrations = [];
        // Check for outdated dependencies
        if (this.techStack.technologies.frontend.some(function (tech) { return tech.includes('React-17'); })) {
            migrations.push('Plan React 18 migration for concurrent features');
        }
        if (this.techStack.technologies.frontend.some(function (tech) { return tech.includes('Next.js-13'); })) {
            migrations.push('Consider Next.js 14 upgrade for improved performance');
        }
        // General recommendations
        migrations.push('Regular dependency updates and security patches');
        migrations.push('Consider progressive migration to newer framework versions');
        return migrations;
    };
    /**
     * Generate strategic recommendations
     */
    GapAnalysisEngine.prototype.generateStrategicRecommendations = function (gapAnalysis) {
        var recommendations = [];
        // High priority recommendations
        Object.entries(gapAnalysis).forEach(function (_a) {
            var category = _a[0], analysis = _a[1];
            if (analysis.priority === 'high') {
                recommendations.push({
                    category: category,
                    title: "".concat(category.charAt(0).toUpperCase() + category.slice(1), " Enhancement"),
                    description: "Address critical gaps in ".concat(category, " technology stack"),
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
    };
    /**
     * Enhance technologies with gap analysis
     */
    GapAnalysisEngine.prototype.enhanceTechnologies = function (gapAnalysis) {
        var enhanced = {
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
    };
    /**
     * Enhance category technologies with gap recommendations
     */
    GapAnalysisEngine.prototype.enhanceCategoryTechnologies = function (technologies, gapAnalysis) {
        var enhanced = __spreadArray([], technologies, true);
        // Add gap recommendations as potential technologies
        if (gapAnalysis.identified_gaps.length > 0) {
            enhanced.push("GAP: ".concat(gapAnalysis.recommendations.join(', ')));
        }
        return enhanced;
    };
    // Recommendation generators for each category
    GapAnalysisEngine.prototype.generateFrontendRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    GapAnalysisEngine.prototype.generateBackendRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    GapAnalysisEngine.prototype.generateDatabaseRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    GapAnalysisEngine.prototype.generateInfrastructureRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    GapAnalysisEngine.prototype.generatePlatformRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    GapAnalysisEngine.prototype.generateAIRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    GapAnalysisEngine.prototype.generateDevelopmentRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    GapAnalysisEngine.prototype.generateIntegrationRecommendations = function (gaps) {
        var recommendations = [];
        gaps.forEach(function (gap) {
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
    };
    return GapAnalysisEngine;
}());
exports.GapAnalysisEngine = GapAnalysisEngine;
// Export the tool for MCP integration
exports.gapAnalysisEngineTool = {
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
    handler: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var gapEngine, result, error_5;
        var structured_tech_stack = _b.structured_tech_stack, user_id = _b.user_id;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    gapEngine = new GapAnalysisEngine(structured_tech_stack);
                    return [4 /*yield*/, gapEngine.analyze()];
                case 1:
                    result = _c.sent();
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify(result, null, 2)
                                }]
                        }];
                case 2:
                    error_5 = _c.sent();
                    console.error('❌ Gap Analysis Engine failed:', error_5);
                    throw error_5;
                case 3: return [2 /*return*/];
            }
        });
    }); }
};
/**
 * Parse repository URL to extract owner and repo name
 */
function parseRepositoryUrl(url) {
    try {
        var cleanUrl = url.replace(/^https?:\/\/github\.com\//, '');
        cleanUrl = cleanUrl.replace(/\.git$/, '');
        var parts = cleanUrl.split('/');
        if (parts.length >= 2) {
            return {
                owner: parts[0],
                repo: parts[1]
            };
        }
        return null;
    }
    catch (_a) {
        return null;
    }
}
/**
 * ORCHESTRATOR: Coordinates all three agents
 * Manages the complete workflow from repository exploration to gap analysis
 */
var GitHubAnalysisOrchestrator = /** @class */ (function () {
    function GitHubAnalysisOrchestrator(githubToken, repositoryUrl, userId, analysisDepth, focusAreas) {
        if (analysisDepth === void 0) { analysisDepth = 'standard'; }
        if (focusAreas === void 0) { focusAreas = []; }
        this.githubToken = githubToken;
        this.repositoryUrl = repositoryUrl;
        this.userId = userId;
        this.analysisDepth = analysisDepth;
        this.focusAreas = focusAreas;
    }
    /**
     * Orchestrates the complete three-agent analysis workflow
     */
    GitHubAnalysisOrchestrator.prototype.orchestrate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var repoInfo, explorer, explorerResult, analyzer, structuredTechStack, gapEngine, gapAnalysis, finalResult, error_6;
            var _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        console.log('🎯 GitHubAnalysisOrchestrator: Starting comprehensive three-agent analysis');
                        console.log("\uD83D\uDCCA Analysis depth: ".concat(this.analysisDepth));
                        console.log("\uD83C\uDFAF Focus areas: ".concat(this.focusAreas.join(', ')));
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 5, , 6]);
                        repoInfo = parseRepositoryUrl(this.repositoryUrl);
                        if (!repoInfo) {
                            throw new Error('Invalid repository URL format');
                        }
                        console.log("\uD83D\uDD0D Repository: ".concat(repoInfo.owner, "/").concat(repoInfo.repo));
                        // STAGE 1: Repository Explorer
                        console.log('\n=== STAGE 1: Repository Explorer ===');
                        explorer = new RepositoryExplorer(this.githubToken, repoInfo.owner, repoInfo.repo);
                        return [4 /*yield*/, explorer.explore()];
                    case 2:
                        explorerResult = _h.sent();
                        console.log("\u2705 Stage 1 Complete: ".concat(explorerResult.total_files_scanned, " files scanned, ").concat(explorerResult.files.length, " key files analyzed"));
                        // STAGE 2: Technology Analyzer
                        console.log('\n=== STAGE 2: Technology Analyzer ===');
                        analyzer = new TechnologyAnalyzer(explorerResult);
                        return [4 /*yield*/, analyzer.analyze()];
                    case 3:
                        structuredTechStack = _h.sent();
                        console.log("\u2705 Stage 2 Complete: ".concat(Object.keys(structuredTechStack.technologies).length, " technology categories analyzed"));
                        // STAGE 3: Gap Analysis Engine
                        console.log('\n=== STAGE 3: Gap Analysis Engine ===');
                        gapEngine = new GapAnalysisEngine(structuredTechStack);
                        return [4 /*yield*/, gapEngine.analyze()];
                    case 4:
                        gapAnalysis = _h.sent();
                        console.log("\u2705 Stage 3 Complete: ".concat(gapAnalysis.recommendations.length, " strategic recommendations generated"));
                        finalResult = {
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
                                frontend_gaps: this.extractGapRecommendations(((_a = gapAnalysis.gap_analysis.frontend) === null || _a === void 0 ? void 0 : _a.recommendations) || []),
                                backend_gaps: this.extractGapRecommendations(((_b = gapAnalysis.gap_analysis.backend) === null || _b === void 0 ? void 0 : _b.recommendations) || []),
                                database_gaps: this.extractGapRecommendations(((_c = gapAnalysis.gap_analysis.database) === null || _c === void 0 ? void 0 : _c.recommendations) || []),
                                infrastructure_gaps: this.extractGapRecommendations(((_d = gapAnalysis.gap_analysis.infrastructure) === null || _d === void 0 ? void 0 : _d.recommendations) || []),
                                ai_gaps: this.extractGapRecommendations(((_e = gapAnalysis.gap_analysis.ai) === null || _e === void 0 ? void 0 : _e.recommendations) || []),
                                development_gaps: this.extractGapRecommendations(((_f = gapAnalysis.gap_analysis.development) === null || _f === void 0 ? void 0 : _f.recommendations) || []),
                                integration_gaps: this.extractGapRecommendations(((_g = gapAnalysis.gap_analysis.integrations) === null || _g === void 0 ? void 0 : _g.recommendations) || [])
                            },
                            // Summary metrics
                            summary: {
                                total_technologies_detected: Object.values(structuredTechStack.technologies).flat().length,
                                total_gaps_identified: Object.keys(gapAnalysis.gap_analysis).length,
                                high_priority_recommendations: gapAnalysis.recommendations.filter(function (r) { return r.priority === 'high'; }).length,
                                analysis_success: true
                            }
                        };
                        console.log('\n🎉 GitHubAnalysisOrchestrator: Complete analysis finished successfully');
                        console.log("\uD83D\uDCCA Final Summary: ".concat(finalResult.summary.total_technologies_detected, " technologies, ").concat(finalResult.summary.total_gaps_identified, " gaps, ").concat(finalResult.summary.high_priority_recommendations, " high-priority recommendations"));
                        return [2 /*return*/, finalResult];
                    case 5:
                        error_6 = _h.sent();
                        console.error('❌ GitHubAnalysisOrchestrator: Analysis failed:', error_6);
                        throw new Error("Orchestration failed: ".concat(error_6.message));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extract GAP recommendations formatted for tech stack fields
     */
    GitHubAnalysisOrchestrator.prototype.extractGapRecommendations = function (recommendations) {
        return recommendations.map(function (rec) { return "GAP: ".concat(rec); });
    };
    return GitHubAnalysisOrchestrator;
}());
exports.GitHubAnalysisOrchestrator = GitHubAnalysisOrchestrator;
// Export the orchestrator tool for MCP integration
exports.githubAnalysisOrchestratorTool = {
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
    handler: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var orchestrator, result, error_7;
        var repository_url = _b.repository_url, github_token = _b.github_token, _c = _b.analysis_depth, analysis_depth = _c === void 0 ? "standard" : _c, _d = _b.focus_areas, focus_areas = _d === void 0 ? [] : _d, user_id = _b.user_id;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    orchestrator = new GitHubAnalysisOrchestrator(github_token, repository_url, user_id, analysis_depth, focus_areas);
                    return [4 /*yield*/, orchestrator.orchestrate()];
                case 1:
                    result = _e.sent();
                    return [2 /*return*/, {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify(result, null, 2)
                                }]
                        }];
                case 2:
                    error_7 = _e.sent();
                    console.error('❌ GitHub Analysis Orchestrator failed:', error_7);
                    throw error_7;
                case 3: return [2 /*return*/];
            }
        });
    }); }
};
// Export handler for HTTP server integration
exports.handleComprehensiveGitHubAnalysis = exports.githubAnalysisOrchestratorTool.handler;
