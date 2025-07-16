import { 
  FileText, 
  Database, 
  Settings, 
  Code, 
  CheckCircle,
  Layers,
  Zap,
  Users,
  Target,
  GitBranch
} from 'lucide-react'

export interface DevelopmentTheme {
  background: string
  dot: string
  accent: string
  icon: any
  gradient: string
  border: string
}

export const getDevelopmentTheme = (cardType: string): DevelopmentTheme => {
  switch (cardType) {
    case 'prd':
      return {
        background: '#f0f9ff',
        dot: 'bg-blue-500',
        accent: 'text-blue-600',
        icon: FileText,
        gradient: 'from-blue-50 to-blue-100',
        border: 'border-blue-200'
      }
    
    case 'technical-requirement':
    case 'trd':
      return {
        background: '#f0fdf4',
        dot: 'bg-green-500',
        accent: 'text-green-600',
        icon: Code,
        gradient: 'from-green-50 to-green-100',
        border: 'border-green-200'
      }
    
    case 'tech-stack':
      return {
        background: '#fef3c7',
        dot: 'bg-yellow-500',
        accent: 'text-yellow-600',
        icon: Database,
        gradient: 'from-yellow-50 to-yellow-100',
        border: 'border-yellow-200'
      }
    
    case 'task-list':
      return {
        background: '#f3e8ff',
        dot: 'bg-purple-500',
        accent: 'text-purple-600',
        icon: CheckCircle,
        gradient: 'from-purple-50 to-purple-100',
        border: 'border-purple-200'
      }
    
    case 'feature-spec':
      return {
        background: '#ecfdf5',
        dot: 'bg-emerald-500',
        accent: 'text-emerald-600',
        icon: Layers,
        gradient: 'from-emerald-50 to-emerald-100',
        border: 'border-emerald-200'
      }
    
    case 'api-spec':
      return {
        background: '#fef2f2',
        dot: 'bg-rose-500',
        accent: 'text-rose-600',
        icon: Zap,
        gradient: 'from-rose-50 to-rose-100',
        border: 'border-rose-200'
      }
    
    case 'user-journey':
      return {
        background: '#f5f3ff',
        dot: 'bg-violet-500',
        accent: 'text-violet-600',
        icon: Users,
        gradient: 'from-violet-50 to-violet-100',
        border: 'border-violet-200'
      }
    
    case 'milestone':
      return {
        background: '#fff7ed',
        dot: 'bg-orange-500',
        accent: 'text-orange-600',
        icon: Target,
        gradient: 'from-orange-50 to-orange-100',
        border: 'border-orange-200'
      }
    
    case 'deployment-guide':
      return {
        background: '#f0f4ff',
        dot: 'bg-indigo-500',
        accent: 'text-indigo-600',
        icon: GitBranch,
        gradient: 'from-indigo-50 to-indigo-100',
        border: 'border-indigo-200'
      }
    
    default:
      return {
        background: '#f9fafb',
        dot: 'bg-gray-500',
        accent: 'text-gray-600',
        icon: Settings,
        gradient: 'from-gray-50 to-gray-100',
        border: 'border-gray-200'
      }
  }
}

export const getDevelopmentDisplayName = (cardType: string): string => {
  switch (cardType) {
    case 'prd':
      return 'PRD'
    case 'technical-requirement':
    case 'trd':
      return 'TRD'
    case 'tech-stack':
      return 'Tech Stack'
    case 'task-list':
      return 'Task List'
    case 'feature-spec':
      return 'Feature Spec'
    case 'api-spec':
      return 'API Spec'
    case 'user-journey':
      return 'User Journey'
    case 'milestone':
      return 'Milestone'
    case 'deployment-guide':
      return 'Deployment Guide'
    default:
      return 'Development'
  }
}

export const getDevelopmentDescription = (cardType: string): string => {
  switch (cardType) {
    case 'prd':
      return 'Product Requirements Document - Define features, user stories, and business requirements'
    case 'technical-requirement':
    case 'trd':
      return 'Technical Requirements Document - Specify technical implementation details'
    case 'tech-stack':
      return 'Technology Stack - Define technologies, frameworks, and architecture'
    case 'task-list':
      return 'Task List - Break down work into actionable tasks and track progress'
    case 'feature-spec':
      return 'Feature Specification - Detailed feature design and implementation guide'
    case 'api-spec':
      return 'API Specification - Define API endpoints, data structures, and integration'
    case 'user-journey':
      return 'User Journey - Map user interactions and experience flows'
    case 'milestone':
      return 'Milestone - Track key project milestones and deliverables'
    case 'deployment-guide':
      return 'Deployment Guide - Instructions for deploying and maintaining the system'
    default:
      return 'Development Asset - Generic development documentation'
  }
}

export const getDevelopmentStatusColors = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'approved':
    case 'released':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      }
    case 'in_progress':
    case 'review':
    case 'in_review':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200'
      }
    case 'blocked':
    case 'failed':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      }
    case 'draft':
    case 'not_started':
    case 'pending':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      }
  }
}

export const getDevelopmentPriorityColors = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'urgent':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      }
    case 'medium':
    case 'normal':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200'
      }
    case 'low':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200'
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      }
  }
}