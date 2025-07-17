import { NextRequest, NextResponse } from 'next/server'

// GET /api/github/repo?owner=username&repo=reponame&path=optional/path
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const path = searchParams.get('path')
  
  if (!authHeader) {
    return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
  }

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo parameter' }, { status: 400 })
  }

  try {
    let url = `https://api.github.com/repos/${owner}/${repo}`
    
    // Handle different endpoints based on path parameter
    if (path === 'languages') {
      url += '/languages'
    } else if (path === 'contents') {
      url += '/contents'
    } else if (path && path.startsWith('git/trees/')) {
      url += `/${path}`
    } else if (path && path.startsWith('git/blobs/')) {
      url = `https://api.github.com/repos/${owner}/${repo}/${path}`
    } else if (path) {
      url += `/contents/${path}`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'PINNLO-App'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'GitHub API request failed' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json({ error: 'Failed to fetch from GitHub' }, { status: 500 })
  }
}
