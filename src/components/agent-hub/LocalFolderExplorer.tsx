'use client'

import React, { useState } from 'react'
import { Folder, File, FileText, Code, ChevronRight, ChevronDown, Search, Sparkles, Loader2, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Card component not needed - using divs with styling
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { GitHubConnector } from './GitHubConnector'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  size?: number
  content?: string
}

export function LocalFolderExplorer() {
  const [folderStructure, setFolderStructure] = useState<FileNode | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'local' | 'github'>('github')

  // Function to read actual folder structure using the filesystem API
  const loadFolderStructure = async () => {
    try {
      // For prototype - simulate loading your Pinnlo folder structure
      const mockStructure: FileNode = {
        name: 'pinnlo-v2',
        path: '/Users/matthewfitzpatrick/pinnlo-v2',
        type: 'directory',
        children: [
          {
            name: 'src',
            path: '/Users/matthewfitzpatrick/pinnlo-v2/src',
            type: 'directory',
            children: [
              {
                name: 'components',
                path: '/Users/matthewfitzpatrick/pinnlo-v2/src/components',
                type: 'directory',
                children: [
                  {
                    name: 'organisation-bank',
                    path: '/Users/matthewfitzpatrick/pinnlo-v2/src/components/organisation-bank',
                    type: 'directory',
                    children: [
                      {
                        name: 'OrganisationBank.tsx',
                        path: '/Users/matthewfitzpatrick/pinnlo-v2/src/components/organisation-bank/OrganisationBank.tsx',
                        type: 'file',
                        size: 15420
                      }
                    ]
                  },
                  {
                    name: 'template-bank',
                    path: '/Users/matthewfitzpatrick/pinnlo-v2/src/components/template-bank',
                    type: 'directory',
                    children: []
                  }
                ]
              },
              {
                name: 'hooks',
                path: '/Users/matthewfitzpatrick/pinnlo-v2/src/hooks',
                type: 'directory',
                children: []
              }
            ]
          },
          {
            name: 'docs',
            path: '/Users/matthewfitzpatrick/pinnlo-v2/docs',
            type: 'directory',
            children: [
              {
                name: 'Organisation Bank - Card Structure Design.md',
                path: '/Users/matthewfitzpatrick/pinnlo-v2/docs/Organisation Bank - Card Structure Design.md',
                type: 'file',
                size: 8934
              }
            ]
          }
        ]
      }

      setFolderStructure(mockStructure)
      toast.success('Connected to local Pinnlo folder')
    } catch (error) {
      toast.error('Failed to load folder structure')
    }
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

  const loadFileContent = async (file: FileNode) => {
    setSelectedFile(file)
    try {
      // Simulate loading file content
      // In real implementation, this would read the actual file
      const mockContent = `// File: ${file.name}
// Path: ${file.path}

// This is a mock content for prototype testing
// In production, this would show the actual file content using:
// const content = await window.fs.readFile(file.path, { encoding: 'utf8' })

import React from 'react'

export function Component() {
  return <div>File content would appear here</div>
}
`
      setFileContent(mockContent)
    } catch (error) {
      toast.error('Failed to load file content')
    }
  }

  const analyzeWithAI = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      // Here you would call your MCP agent to analyze the file
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Analysis complete! The agent suggests refactoring line 42 for better performance.')
    } catch (error) {
      toast.error('Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderFileTree = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch && node.type === 'file') return null

    return (
      <div key={node.path} style={{ marginLeft: `${level * 20}px` }}>
        {node.type === 'directory' ? (
          <div
            className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4 text-black" /> : <ChevronRight className="w-4 h-4 text-black" />}
            <Folder className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-black font-medium">{node.name}</span>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 py-1 hover:bg-gray-100 rounded cursor-pointer ${
              selectedFile?.path === node.path ? 'bg-blue-100' : ''
            }`}
            onClick={() => loadFileContent(node)}
          >
            {node.name.endsWith('.tsx') || node.name.endsWith('.ts') ? (
              <Code className="w-4 h-4 text-green-500" />
            ) : (
              <FileText className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm text-black font-medium">{node.name}</span>
            {node.size && <span className="text-xs text-gray-600 ml-auto">{(node.size / 1024).toFixed(1)}KB</span>}
          </div>
        )}
        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileTree(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'local'
                ? 'bg-black text-white'
                : 'text-black hover:bg-gray-100'
            }`}
          >
            <Folder className="w-4 h-4" />
            Local Folder
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'github'
                ? 'bg-black text-white'
                : 'text-black hover:bg-gray-100'
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Repository
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'github' ? (
        <GitHubConnector />
      ) : (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Local Folder Explorer</h3>
            {!folderStructure ? (
              <Button onClick={loadFolderStructure} size="sm" className="bg-black text-white hover:bg-gray-800">
                <Folder className="w-4 h-4 mr-2" />
                Connect to Pinnlo Folder
              </Button>
            ) : (
              <div className="text-sm text-black font-medium">
                Connected to: ~/pinnlo-v2
              </div>
            )}
          </div>

          {folderStructure && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-black placeholder-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* File Tree */}
                <div className="border border-gray-200 rounded-lg p-4 h-[400px] overflow-y-auto bg-white">
                  <div className="text-sm font-medium text-black mb-2">File Explorer</div>
                  {renderFileTree(folderStructure)}
                </div>

                {/* File Content */}
                <div className="border border-gray-200 rounded-lg p-4 h-[400px] overflow-y-auto bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-black">
                      {selectedFile ? selectedFile.name : 'Select a file'}
                    </div>
                    {selectedFile && (
                      <Button
                        size="sm"
                        onClick={analyzeWithAI}
                        disabled={isAnalyzing}
                        className="bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {fileContent ? (
                    <pre className="text-xs text-black bg-gray-50 p-3 rounded overflow-x-auto">
                      <code className="text-black">{fileContent}</code>
                    </pre>
                  ) : (
                    <div className="text-sm text-black text-center mt-8">
                      Select a file to view its contents
                    </div>
                  )}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-medium text-sm text-black">AI Agent Recommendations</div>
                    <div className="text-sm text-black">
                      Select a file and click "Analyze with AI" to get recommendations for:
                      <ul className="list-disc list-inside mt-1 space-y-1 text-black">
                        <li>Code improvements and refactoring suggestions</li>
                        <li>Bug detection and security issues</li>
                        <li>Performance optimizations</li>
                        <li>Documentation gaps</li>
                        <li>Best practice violations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
