/**
 * Simplified GitHub Analysis Tools for MCP Server
 * Provides basic GitHub repository analysis capabilities
 */

import { createClient } from '@supabase/supabase-js';

export const githubAnalysisTools = {
  analyze_github_repository: {
    description: "Analyze a GitHub repository to detect technology stack",
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
          description: "Specific areas to focus on (e.g., 'frontend', 'backend', 'database', 'devops')"
        },
        user_id: { 
          type: "string", 
          description: "User ID for tracking and personalization" 
        }
      },
      required: ["repository_url", "github_token", "user_id"]
    },
    handler: async ({ 
      repository_url, 
      github_token, 
      analysis_depth = "standard", 
      focus_areas = [], 
      user_id 
    }) => {
      try {
        console.log('🔍 GitHub Analysis Request:', { repository_url, user_id });
        
        // Parse repository URL
        const repoInfo = parseRepositoryUrl(repository_url);
        if (!repoInfo) {
          console.error('❌ Invalid repository URL format:', repository_url);
          throw new Error("Invalid repository URL format");
        }
        
        console.log('📋 Parsed repository info:', repoInfo);

        // Initialize GitHub API client
        const github = {
          headers: {
            'Authorization': `Bearer ${github_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'PINNLO-MCP-Agent'
          }
        };

        // Get repository information
        console.log('🔍 Fetching repository info...');
        const repoResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`, {
          headers: github.headers
        });

        if (!repoResponse.ok) {
          console.error('❌ Failed to fetch repository:', repoResponse.status, repoResponse.statusText);
          throw new Error(`Failed to fetch repository: ${repoResponse.status}`);
        }

        const repository = await repoResponse.json();
        console.log('✅ Repository fetched successfully:', repository.name);

        // Analyze package.json for dependencies
        console.log('🔍 Fetching package.json...');
        const packageResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/package.json`, {
          headers: github.headers
        });

        let dependencies = {};
        let frameworks = [];

        if (packageResponse.ok) {
          console.log('✅ Package.json found');
          const packageData = await packageResponse.json();
          const packageContent = JSON.parse(Buffer.from(packageData.content, 'base64').toString());
          
          dependencies = {
            ...(packageContent.dependencies || {}),
            ...(packageContent.devDependencies || {})
          };

          console.log('📦 Dependencies found:', Object.keys(dependencies).length);

          // Detect frameworks from dependencies
          if (dependencies['next']) frameworks.push('Next.js');
          if (dependencies['react']) frameworks.push('React');
          if (dependencies['vue']) frameworks.push('Vue.js');
          if (dependencies['angular']) frameworks.push('Angular');
          if (dependencies['express']) frameworks.push('Express');
          if (dependencies['fastify']) frameworks.push('Fastify');
          if (dependencies['@supabase/supabase-js']) frameworks.push('Supabase');
          if (dependencies['tailwindcss']) frameworks.push('Tailwind CSS');
          if (dependencies['typescript']) frameworks.push('TypeScript');
          
          console.log('🛠️ Frameworks detected:', frameworks);
        } else {
          console.log('⚠️ Package.json not found');
        }

        // Return analysis results
        const result = {
          content: [{
            type: "text",
            text: JSON.stringify({
              dependencies,
              frameworks,
              repository_info: {
                name: repository.name,
                full_name: repository.full_name,
                description: repository.description,
                language: repository.language,
                size: repository.size,
                updated_at: repository.updated_at,
                default_branch: repository.default_branch
              },
              files_analyzed: 1,
              package_files: packageResponse.ok ? ['package.json'] : [],
              analysis_method: 'simplified'
            })
          }]
        };

        console.log('✅ Analysis complete, returning result');
        return result;

      } catch (error) {
        console.error('❌ GitHub analysis error:', error);
        console.error('❌ Error stack:', error.stack);
        throw new Error(`Failed to analyze repository: ${error.message}`);
      }
    }
  }
};

function parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
  try {
    // Handle different URL formats
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
  } catch {
    return null;
  }
}

// Export handlers for HTTP server integration
export const handleAnalyzeGitHubRepository = githubAnalysisTools.analyze_github_repository.handler;