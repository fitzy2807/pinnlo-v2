'use client'

import React, { useState } from 'react'
import { Github, Search, Loader2, FileCode, GitBranch, AlertCircle, Check, ChevronRight, ChevronDown, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  default_branch: string
  created_at: string
  updated_at: string
  size: number
  stargazers_count: number
  private: boolean
  owner: {
    login: string
  }
}

interface FileNode {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

interface RepoAnalysis {
  languages: { [key: string]: number }
  frameworks: string[]
  dependencies: { [key: string]: string }
  devDependencies: { [key: string]: string }
  totalFiles: number
  structure: any
}

export function GitHubConnector() {
  const [githubToken, setGithubToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState('')
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [repoContents, setRepoContents] = useState<FileNode[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [analysis, setAnalysis] = useState<RepoAnalysis | null>(null)

  // Check for existing token on mount
  React.useEffect(() => {
    const savedToken = sessionStorage.getItem('github_token')
    if (savedToken) {
      setGithubToken(savedToken)
      // Auto-connect if token exists
      connectToGitHub(savedToken)
    }
  }, [])

  const connectToGitHub = async (tokenToUse?: string) => {
    const token = tokenToUse || githubToken
    if (!token) {
      toast.error('Please enter a GitHub Personal Access Token')
      return
    }

    setIsLoadingRepos(true)
    try {
      // Test the token by getting user info through our API route
      const userResponse = await fetch('/api/github/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!userResponse.ok) {
        const error = await userResponse.json()
        throw new Error(error.error || 'Invalid token')
      }

      const userData = await userResponse.json()
      setUsername(userData.login)
      setIsConnected(true)
      
      // Store token in sessionStorage (not localStorage for security)
      sessionStorage.setItem('github_token', token)
      
      toast.success(`Connected to GitHub as ${userData.login}!`)
      
      // Load repositories
      await loadRepositories(token)
    } catch (error) {
      toast.error('Failed to connect to GitHub. Please check your token.')
      console.error('GitHub connection error:', error)
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const disconnectFromGitHub = () => {
    // Clear all stored data
    sessionStorage.removeItem('github_token')
    setGithubToken('')
    setIsConnected(false)
    setUsername('')
    setRepos([])
    setSelectedRepo(null)
    setRepoContents([])
    setAnalysis(null)
    
    toast.success('Disconnected from GitHub')
  }

  const loadRepositories = async (tokenToUse?: string) => {
    const token = tokenToUse || githubToken
    try {
      const response = await fetch('/api/github/repos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load repositories')
      }

      const repoData = await response.json()
      setRepos(repoData)
    } catch (error) {
      toast.error('Failed to load repositories')
      console.error('Error loading repos:', error)
    }
  }

  const selectRepository = async (repo: GitHubRepo) => {
    setSelectedRepo(repo)
    setAnalysis(null)
    
    // Load repository contents
    try {
      const response = await fetch(`/api/github/repo?owner=${repo.owner.login}&repo=${repo.name}&path=git/trees/${repo.default_branch}?recursive=true`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load repository contents')
      }

      const data = await response.json()
      setRepoContents(data.tree || [])
    } catch (error) {
      toast.error('Failed to load repository contents')
      console.error('Error loading contents:', error)
    }
  }

  const analyzeRepository = async () => {
    if (!selectedRepo) return

    setIsAnalyzing(true)
    const analysisResult: RepoAnalysis = {
      languages: {},
      frameworks: [],
      dependencies: {},
      devDependencies: {},
      totalFiles: 0,
      structure: {}
    }

    try {
      // Get language statistics
      const langResponse = await fetch(`/api/github/repo?owner=${selectedRepo.owner.login}&repo=${selectedRepo.name}&path=languages`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`
        }
      })
      
      if (langResponse.ok) {
        analysisResult.languages = await langResponse.json()
      }

      // Check for package.json
      const packageJsonFile = repoContents.find(file => file.path === 'package.json')
      if (packageJsonFile) {
        // Fetch the blob content
        const blobUrl = packageJsonFile.url.split('/').slice(-1)[0] // Get SHA from URL
        const packageResponse = await fetch(`/api/github/repo?owner=${selectedRepo.owner.login}&repo=${selectedRepo.name}&path=git/blobs/${blobUrl}`, {
          headers: {
            'Authorization': `Bearer ${githubToken}`
          }
        })
        
        if (packageResponse.ok) {
          const packageData = await packageResponse.json()
          const packageContent = JSON.parse(atob(packageData.content))
          
          analysisResult.dependencies = packageContent.dependencies || {}
          analysisResult.devDependencies = packageContent.devDependencies || {}
          
          // Detect frameworks
          const allDeps = { ...analysisResult.dependencies, ...analysisResult.devDependencies }
          if (allDeps.react) analysisResult.frameworks.push('React')
          if (allDeps.next) analysisResult.frameworks.push('Next.js')
          if (allDeps.vue) analysisResult.frameworks.push('Vue')
          if (allDeps['@angular/core']) analysisResult.frameworks.push('Angular')
          if (allDeps.express) analysisResult.frameworks.push('Express')
          if (allDeps.nestjs) analysisResult.frameworks.push('NestJS')
          if (allDeps.tailwindcss) analysisResult.frameworks.push('Tailwind CSS')
        }
      }

      // Check for requirements.txt (Python)
      const requirementsFile = repoContents.find(file => file.path === 'requirements.txt')
      if (requirementsFile) {
        analysisResult.frameworks.push('Python')
      }

      // Check for Gemfile (Ruby)
      const gemFile = repoContents.find(file => file.path === 'Gemfile')
      if (gemFile) {
        analysisResult.frameworks.push('Ruby')
      }

      // Count total files
      analysisResult.totalFiles = repoContents.filter(item => item.type === 'blob').length

      // Analyze directory structure
      const structure: any = {}
      repoContents.forEach(item => {
        const parts = item.path.split('/')
        let current = structure
        parts.forEach((part, index) => {
          if (index === parts.length - 1 && item.type === 'blob') {
            current[part] = 'file'
          } else {
            current[part] = current[part] || {}
            current = current[part]
          }
        })
      })
      analysisResult.structure = structure

      setAnalysis(analysisResult)
      toast.success('Repository analysis complete!')
    } catch (error) {
      toast.error('Failed to analyze repository')
      console.error('Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateTechStackCard = () => {
    if (!analysis || !selectedRepo) {
      toast.error('Please analyze a repository first')
      return
    }

    // Create a tech stack card based on the analysis
    const techStackData = {
      title: `Tech Stack - ${selectedRepo.name}`,
      description: selectedRepo.description || 'Technical stack analysis from GitHub repository',
      languages: analysis.languages,
      frameworks: analysis.frameworks,
      dependencies: Object.keys(analysis.dependencies).length,
      devDependencies: Object.keys(analysis.devDependencies).length,
      totalFiles: analysis.totalFiles,
      lastUpdated: selectedRepo.updated_at,
      repository: selectedRepo.full_name
    }

    // Here you would call your card creation API
    console.log('Tech Stack Card Data:', techStackData)
    toast.success('Tech Stack card data generated! (Check console)')
    
    // TODO: Integrate with your card creation system
    // createTechStackCard(techStackData)
  }

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  return (
    <div className="space-y-4">
      {/* Connection Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">GitHub Repository Connector</h3>
            {isConnected && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  Connected as {username}
                </div>
                <Button
                  onClick={disconnectFromGitHub}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 border-red-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          {!isConnected ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  GitHub Personal Access Token
                </label>
                <Input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="text-black"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Create a token at GitHub → Settings → Developer settings → Personal access tokens
                </p>
              </div>
              <Button
                onClick={() => connectToGitHub()}
                disabled={isLoadingRepos}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isLoadingRepos ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Connect to GitHub
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Repository Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Select Repository
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {repos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => selectRepository(repo)}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        selectedRepo?.id === repo.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-black">{repo.name}</div>
                          {repo.description && (
                            <div className="text-sm text-gray-600 mt-1">{repo.description}</div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <FileCode className="w-3 h-3" />
                                {repo.language}
                              </span>
                            )}
                            <span>{repo.stargazers_count} ⭐</span>
                            <span>{repo.private ? '🔒 Private' : '🌐 Public'}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Repository Analysis */}
              {selectedRepo && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-black">Repository Analysis</h4>
                    <Button
                      onClick={analyzeRepository}
                      disabled={isAnalyzing}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Analyze Repository
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Analysis Results */}
                  {analysis && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <h5 className="font-medium text-black">Analysis Results</h5>
                        
                        <div>
                          <p className="text-sm font-medium text-black mb-1">Languages:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(analysis.languages).map(([lang, bytes]) => (
                              <span key={lang} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-black">
                                {lang}: {((bytes / Object.values(analysis.languages).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-black mb-1">Detected Frameworks:</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.frameworks.map((framework) => (
                              <span key={framework} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {framework}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Files</p>
                            <p className="font-medium text-black">{analysis.totalFiles}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dependencies</p>
                            <p className="font-medium text-black">{Object.keys(analysis.dependencies).length}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Dev Dependencies</p>
                            <p className="font-medium text-black">{Object.keys(analysis.devDependencies).length}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={generateTechStackCard}
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                      >
                        <FileCode className="w-4 h-4 mr-2" />
                        Generate Tech Stack Card
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="space-y-2">
            <div className="font-medium text-sm text-black">How to use:</div>
            <ol className="text-sm text-black list-decimal list-inside space-y-1">
              <li>Create a GitHub Personal Access Token with 'repo' scope</li>
              <li>Enter your token and connect to GitHub</li>
              <li>Select a repository to analyze</li>
              <li>Click "Analyze Repository" to scan the codebase</li>
              <li>Generate a Tech Stack card based on the analysis</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
