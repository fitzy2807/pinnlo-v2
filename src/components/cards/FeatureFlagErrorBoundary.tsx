'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class FeatureFlagErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error('Feature flag error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Feature flag error details:', {
      error,
      errorInfo,
      errorBoundary: 'FeatureFlagErrorBoundary'
    })
    
    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // Track error
      // analytics.track('feature_flag_error', {
      //   error: error.message,
      //   stack: error.stack,
      //   componentStack: errorInfo.componentStack
      // })
    }
  }

  render() {
    if (this.state.hasError) {
      // In production, silently fall back to legacy component
      if (process.env.NODE_ENV === 'production') {
        return this.props.fallback
      }

      // In development, show error details
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Feature Flag Error
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {this.state.error?.message || 'An error occurred with the feature flag system'}
              </p>
              <p className="mt-2 text-xs text-red-600">
                Falling back to legacy component...
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="mt-2 text-xs text-red-600 underline hover:text-red-700"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}