/**
 * Professional color themes for intelligence card categories
 * Designed for desktop SaaS with muted, business-appropriate colors
 */

export interface CategoryTheme {
  primary: string
  background: string
  border: string
  text: string
  gradient: string
  dot: string
}

export const categoryThemes: Record<string, CategoryTheme> = {
  'consumer': {
    primary: '#DC2626',
    background: '#FEF2F2',
    border: '#FCA5A5',
    text: '#991B1B',
    gradient: 'from-red-50 to-transparent',
    dot: 'bg-red-500'
  },
  'technology': {
    primary: '#2563EB',
    background: '#EFF6FF',
    border: '#93BBFE',
    text: '#1E40AF',
    gradient: 'from-blue-50 to-transparent',
    dot: 'bg-blue-500'
  },
  'market': {
    primary: '#16A34A',
    background: '#F0FDF4',
    border: '#86EFAC',
    text: '#14532D',
    gradient: 'from-green-50 to-transparent',
    dot: 'bg-green-500'
  },
  'risk': {
    primary: '#EA580C',
    background: '#FFF7ED',
    border: '#FDBA74',
    text: '#7C2D12',
    gradient: 'from-orange-50 to-transparent',
    dot: 'bg-orange-500'
  },
  'competitor': {
    primary: '#7C3AED',
    background: '#FAF5FF',
    border: '#C4B5FD',
    text: '#5B21B6',
    gradient: 'from-purple-50 to-transparent',
    dot: 'bg-purple-500'
  },
  'trends': {
    primary: '#06B6D4',
    background: '#F0FDFA',
    border: '#5EEAD4',
    text: '#134E4A',
    gradient: 'from-cyan-50 to-transparent',
    dot: 'bg-cyan-500'
  },
  'stakeholder': {
    primary: '#EAB308',
    background: '#FEFCE8',
    border: '#FDE047',
    text: '#713F12',
    gradient: 'from-yellow-50 to-transparent',
    dot: 'bg-yellow-500'
  },
  'opportunities': {
    primary: '#10B981',
    background: '#F0FDF4',
    border: '#86EFAC',
    text: '#064E3B',
    gradient: 'from-emerald-50 to-transparent',
    dot: 'bg-emerald-500'
  },
  // Development-specific themes
  'prd': {
    primary: '#3B82F6',
    background: '#DBEAFE',
    border: '#93C5FD',
    text: '#1E40AF',
    gradient: 'from-blue-50 to-transparent',
    dot: 'bg-blue-500'
  },
  'technical-requirement': {
    primary: '#10B981',
    background: '#D1FAE5',
    border: '#86EFAC',
    text: '#047857',
    gradient: 'from-emerald-50 to-transparent',
    dot: 'bg-emerald-500'
  },
  'task-list': {
    primary: '#8B5CF6',
    background: '#EDE9FE',
    border: '#C4B5FD',
    text: '#7C3AED',
    gradient: 'from-violet-50 to-transparent',
    dot: 'bg-violet-500'
  }
}

export function getCategoryTheme(category: string): CategoryTheme {
  const cleanCategory = category.toLowerCase().replace('-intelligence', '')
  return categoryThemes[cleanCategory] || categoryThemes['market'] // Default fallback
}

export function getCategoryDisplayName(category: string): string {
  const cleanCategory = category.toLowerCase().replace('-intelligence', '')
  const displayNames: Record<string, string> = {
    'consumer': 'Consumer',
    'technology': 'Technology',
    'market': 'Market',
    'risk': 'Risk',
    'competitor': 'Competitor',
    'trends': 'Trends',
    'stakeholder': 'Stakeholder',
    'opportunities': 'Opportunities',
    // Development-specific display names
    'prd': 'Product Requirements',
    'technical-requirement': 'Technical Requirements',
    'task-list': 'Task List'
  }
  return displayNames[cleanCategory] || 'Intelligence'
}