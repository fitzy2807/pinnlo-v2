import { BlueprintConfig } from '../types'

export const techStackConfig: BlueprintConfig = {
  id: 'tech-stack',
  name: 'Tech Stack',
  description: 'Clean, flexible technology stack documentation with tag-based architecture',
  category: 'Organizational & Technical',
  icon: '⚙️',
  fields: [
    // === CORE INFORMATION FIELDS (5 fields) ===
    {
      id: 'stack_name',
      name: 'Stack Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Pinnlo V2 Strategy Platform',
      description: 'Clear identification and reference name for this technology stack',
      validation: {
        min: 3,
        max: 100
      }
    },
    {
      id: 'stack_type',
      name: 'Stack Type',
      type: 'enum',
      required: true,
      options: [
        'Full-Stack Web App',
        'Mobile App',
        'API Service',
        'Desktop App',
        'Microservice',
        'Serverless Function',
        'Data Pipeline',
        'ML/AI Platform',
        'DevOps Tool',
        'Other'
      ],
      description: 'Categorize the type of system this stack represents'
    },
    {
      id: 'architecture_pattern',
      name: 'Architecture Pattern',
      type: 'text',
      required: true,
      placeholder: 'e.g., Jamstack, Microservices, Monolithic, Serverless, Hybrid',
      description: 'High-level architectural approach and design pattern',
      validation: {
        min: 3,
        max: 50
      }
    },
    {
      id: 'primary_use_case',
      name: 'Primary Use Case',
      type: 'textarea',
      required: true,
      placeholder: 'e.g., Strategy management and collaborative planning platform',
      description: 'Business context and primary purpose of this technology stack',
      validation: {
        min: 10,
        max: 500
      }
    },
    {
      id: 'last_updated',
      name: 'Last Updated',
      type: 'date',
      required: true,
      description: 'Date when the tech stack was last reviewed or updated'
    },

    // === TECHNOLOGY CATEGORIES (8 tag fields) ===
    {
      id: 'frontend',
      name: 'Frontend',
      type: 'array',
      required: false,
      placeholder: 'Add frontend technologies...',
      description: 'Client-side technologies and user interface frameworks (e.g., Next.js-14, React-18, TypeScript, Tailwind-CSS, Headless-UI, Lucide-React)'
    },
    {
      id: 'backend',
      name: 'Backend',
      type: 'array',
      required: false,
      placeholder: 'Add backend technologies...',
      description: 'Server-side logic and APIs (e.g., Next.js-API-Routes, Node.js, Supabase-Auth, REST-APIs, Serverless)'
    },
    {
      id: 'database',
      name: 'Database',
      type: 'array',
      required: false,
      placeholder: 'Add database technologies...',
      description: 'Data storage and management systems (e.g., PostgreSQL, Supabase, Row-Level-Security, Real-time-subscriptions)'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      type: 'array',
      required: false,
      placeholder: 'Add infrastructure technologies...',
      description: 'Hosting, deployment, and operations tools (e.g., Vercel, CDN, Edge-Functions, Git-Deployment, Docker)'
    },
    {
      id: 'platforms',
      name: 'Platforms',
      type: 'array',
      required: false,
      placeholder: 'Add enterprise platforms...',
      description: 'Enterprise software and SaaS platforms (e.g., Salesforce, SAP, Microsoft-365, Slack, Jira, Adobe-Creative-Cloud)'
    },
    {
      id: 'ai',
      name: 'AI',
      type: 'array',
      required: false,
      placeholder: 'Add AI technologies...',
      description: 'Artificial Intelligence and ML services (e.g., OpenAI-GPT-4, Claude-3, Anthropic, LangChain, Vector-DB, MCP-Protocol)'
    },
    {
      id: 'development',
      name: 'Development',
      type: 'array',
      required: false,
      placeholder: 'Add development tools...',
      description: 'Developer tools and workflow technologies (e.g., npm, TypeScript, Jest, ESLint, Git, VS-Code, GitHub-Actions)'
    },
    {
      id: 'integrations',
      name: 'Integrations',
      type: 'array',
      required: false,
      placeholder: 'Add integration services...',
      description: 'External services and APIs (e.g., Supabase-Auth, Stripe, SendGrid, Analytics, Monitoring, Webhooks)'
    },

    // === ADDITIONAL CONTEXT FIELDS (2 optional) ===
    {
      id: 'key_decisions',
      name: 'Key Decisions',
      type: 'textarea',
      required: false,
      placeholder: 'Document major technology choices and their rationale...',
      description: 'Major technology choices and rationale (e.g., "Chose Supabase over Firebase for better PostgreSQL support and RLS")',
      validation: {
        max: 2000
      }
    },
    {
      id: 'migration_notes',
      name: 'Migration Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Track technology evolution and upgrade plans...',
      description: 'Technology evolution and upgrade plans (e.g., "Plan to migrate from Next.js 14 to 15 in Q2 2025")',
      validation: {
        max: 2000
      }
    }
  ],
  defaultValues: {
    stack_name: '',
    stack_type: 'Full-Stack Web App',
    architecture_pattern: 'Jamstack',
    primary_use_case: '',
    last_updated: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    frontend: [],
    backend: [],
    database: [],
    infrastructure: [],
    platforms: [],
    ai: [],
    development: [],
    integrations: [],
    key_decisions: '',
    migration_notes: ''
  },
  validation: {
    required: ['stack_name', 'stack_type', 'architecture_pattern', 'primary_use_case', 'last_updated']
  },
  relationships: {
    linkedBlueprints: ['technical-requirement', 'feature', 'roadmap', 'risk-assessment'],
    requiredBlueprints: []
  }
}