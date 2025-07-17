'use client'

import React, { useState } from 'react'
import { Github, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function GitHubIntegration() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsername] = useState('')

  // For development - simulate the connection process
  const handleConnect = async () => {
    if (!githubToken) {
      toast.error('Please enter a GitHub Personal Access Token')
      return
    }

    setIsConnecting(true)

    try {
      // In development, we'll just validate the token by making a simple API call
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUsername(userData.login)
        setIsConnected(true)
        
        // Store in localStorage for development
        localStorage.setItem('github_token', githubToken)
        localStorage.setItem('github_username', userData.login)
        
        toast.success(`Connected to GitHub as ${userData.login}!`)
      } else {
        throw new Error('Invalid token')
      }
    } catch (error) {
      toast.error('Failed to connect to GitHub. Please check your token.')
      console.error('GitHub connection error:', error)
    } finally {