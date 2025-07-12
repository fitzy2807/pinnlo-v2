// Task List and Task Card Data Types based on PINNLO Implementation Plan

export interface TaskCard {
  id: string;
  taskId: string; // e.g., "INFRA-001", "SEC-001"
  title: string;
  description: string;
  card_type: 'task';
  card_data: TaskCardData;
  strategy_id: number;
  task_list_id: string; // Links to parent task list
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TaskCardData {
  // Metadata
  metadata: {
    taskId: string; // INFRA-001, SEC-001, etc.
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    effort: number; // Story points 1-13
    status: 'Not Started' | 'In Progress' | 'Review' | 'Done';
    assignee: string;
    sprint: string;
    labels: string[];
    dueDate: string | null;
    completionPercentage: number; // 0-100
  };

  // Description
  description: {
    objective: string;
    businessValue: string;
    technicalContext: string;
  };

  // Acceptance Criteria
  acceptanceCriteria: Array<{
    id: string;
    criterion: string;
    status: 'Not Started' | 'In Progress' | 'Complete';
  }>;

  // Dependencies
  dependencies: {
    blocks: string[]; // Task IDs that depend on this
    blockedBy: string[]; // Task IDs this depends on
    related: string[]; // Related task IDs
  };

  // Technical Implementation
  technicalImplementation: {
    approach: string;
    filesToCreate: Array<{
      path: string;
      status: 'Not Started' | 'In Progress' | 'Complete';
    }>;
    configuration: string[];
    testing: string;
  };

  // Definition of Done
  definitionOfDone: Array<{
    id: string;
    criterion: string;
    status: 'Not Started' | 'In Progress' | 'Complete';
  }>;

  // Resources
  resources: {
    documentation: string[];
    examples: string[];
    tools: string[];
  };

  // TRD Source Information
  trdSource: {
    trdId: string;
    trdTitle: string;
    section: string;
  };

  // Comments and Attachments
  comments: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

export interface TaskListContainer {
  id: string;
  title: string;
  description: string;
  card_type: 'task-list';
  card_data: TaskListData;
  strategy_id: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TaskListData {
  // Container Metadata
  metadata: {
    status: 'Not Started' | 'In Progress' | 'Completed';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    estimatedEffort: number; // Total story points
    timeline: {
      startDate: string | null;
      targetDate: string | null;
    };
    owner: string;
    dependencies: string[];
    progress: {
      totalTasks: number;
      completedTasks: number;
      percentage: number;
    };
  };

  // Task Categories
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Not Started' | 'In Progress' | 'Completed';
    taskCount: number;
    completedCount: number;
    estimatedEffort: number;
    isExpanded: boolean;
  }>;

  // TRD Source Information
  trdSource: {
    trdId: string;
    trdTitle: string;
    committedAt: string;
    committedBy: string;
  };

  // Generation Settings
  generationSettings: {
    includedSections: string[];
    generatedAt: string;
    generatedBy: string;
    version: string;
  };
}

// Task Category Templates
export const TASK_CATEGORIES = {
  'infrastructure': {
    name: 'Infrastructure & Foundation',
    icon: '🏗️',
    description: 'Core system setup, environment configuration, and foundational services',
    priority: 'Critical',
    taskPrefix: 'INFRA'
  },
  'security': {
    name: 'Security & Authentication',
    icon: '🔐',
    description: 'Authentication, authorization, encryption, and security infrastructure',
    priority: 'Critical',
    taskPrefix: 'SEC'
  },
  'database': {
    name: 'Database & Data Management',
    icon: '🗄️',
    description: 'Database schema, migrations, data models, and optimization',
    priority: 'High',
    taskPrefix: 'DATA'
  },
  'realtime': {
    name: 'Real-Time & Collaboration',
    icon: '🔄',
    description: 'WebSocket infrastructure, real-time updates, and collaborative features',
    priority: 'Critical',
    taskPrefix: 'RT'
  },
  'frontend': {
    name: 'Frontend & User Experience',
    icon: '🎨',
    description: 'React components, UI/UX implementation, and client-side features',
    priority: 'High',
    taskPrefix: 'FE'
  },
  'api': {
    name: 'API & Integration',
    icon: '🔌',
    description: 'RESTful APIs, external integrations, and service interfaces',
    priority: 'Critical',
    taskPrefix: 'API'
  },
  'testing': {
    name: 'Testing & Quality Assurance',
    icon: '🧪',
    description: 'Automated testing, quality gates, and validation frameworks',
    priority: 'High',
    taskPrefix: 'QA'
  },
  'monitoring': {
    name: 'Monitoring & Observability',
    icon: '📊',
    description: 'Logging, metrics, monitoring, and alerting infrastructure',
    priority: 'Medium',
    taskPrefix: 'MON'
  },
  'documentation': {
    name: 'Documentation & Knowledge Transfer',
    icon: '📚',
    description: 'Technical documentation, user guides, and knowledge sharing',
    priority: 'Low',
    taskPrefix: 'DOC'
  }
} as const;

// Task Templates for each category
export const TASK_TEMPLATES = {
  infrastructure: [
    {
      title: 'Development Environment Setup',
      objective: 'Configure local development environment with Docker',
      effort: 3,
      priority: 'Critical' as const,
      acceptanceCriteria: [
        'Docker containers running locally',
        'Database migrations execute successfully',
        'All team members can run project locally'
      ],
      filesToCreate: [
        'docker-compose.yml',
        'Dockerfile',
        'README.md'
      ]
    },
    {
      title: 'CI/CD Pipeline Implementation',
      objective: 'Automated build, test, and deployment pipeline',
      effort: 5,
      priority: 'Critical' as const,
      acceptanceCriteria: [
        'Automated testing on pull requests',
        'Automated deployment to staging',
        'Manual approval gate for production'
      ],
      filesToCreate: [
        '.github/workflows/',
        'deploy.yml',
        'terraform/'
      ]
    }
  ],
  security: [
    {
      title: 'OAuth 2.0 Authentication Implementation',
      objective: 'Implement JWT-based authentication with OAuth 2.0',
      effort: 5,
      priority: 'Critical' as const,
      acceptanceCriteria: [
        'JWT token validation middleware',
        'Token refresh mechanism',
        'Rate limiting (100 req/min per user)',
        'Comprehensive audit logging'
      ],
      filesToCreate: [
        'src/middleware/authMiddleware.js',
        'src/services/tokenService.js',
        'tests/auth/authentication.test.js',
        'docs/authentication-api.md'
      ]
    },
    {
      title: 'Data Encryption Service',
      objective: 'AES-256 encryption for sensitive data with AWS KMS',
      effort: 8,
      priority: 'Critical' as const,
      acceptanceCriteria: [
        'AES-256-GCM encryption implementation',
        'AWS KMS integration for key management',
        'Key rotation every 90 days',
        'Performance <500ms for 1MB data',
        'FIPS 140-2 compliance validation'
      ],
      filesToCreate: [
        'src/services/encryptionService.js',
        'src/services/keyManagementService.js',
        'scripts/key-rotation.js',
        'tests/security/encryption.test.js'
      ]
    }
  ],
  database: [
    {
      title: 'Database Schema Design & Migration',
      objective: 'Core database schema with row-level security',
      effort: 5,
      priority: 'High' as const,
      acceptanceCriteria: [
        'All entity tables created with proper relationships',
        'Row-level security (RLS) policies implemented',
        'Indexes optimized for query performance',
        'Migration scripts with rollback capability',
        'Performance testing with 1M+ records'
      ],
      filesToCreate: [
        'migrations/001-create-core-schema.sql',
        'migrations/002-add-rls-policies.sql',
        'migrations/003-create-indexes.sql',
        'docs/database-schema.md'
      ]
    }
  ],
  realtime: [
    {
      title: 'WebSocket Connection Management',
      objective: 'Scalable WebSocket infrastructure for real-time collaboration',
      effort: 5,
      priority: 'Critical' as const,
      acceptanceCriteria: [
        'Support 50 concurrent users per board',
        'Connection establishment <100ms',
        'Automatic reconnection with exponential backoff',
        'JWT authentication on connection',
        'Redis-backed connection state',
        'Memory usage <2MB per 100 connections'
      ],
      filesToCreate: [
        'src/websocket/connectionManager.js',
        'src/websocket/authHandler.js',
        'src/utils/redis-connection-store.js',
        'tests/websocket/connection.test.js'
      ]
    }
  ],
  frontend: [
    {
      title: 'Real-Time Collaboration UI Components',
      objective: 'React components for collaborative editing experience',
      effort: 8,
      priority: 'High' as const,
      acceptanceCriteria: [
        'Real-time cursor tracking and user presence',
        'Optimistic updates with rollback capability',
        'Connection status indicator',
        'Offline mode with queued operations',
        'TypeScript implementation with strict types',
        'Accessibility WCAG 2.1 AA compliance'
      ],
      filesToCreate: [
        'src/hooks/useWebSocket.ts',
        'src/hooks/useCollaboration.ts',
        'src/components/CollaborativeBoard.tsx',
        'src/components/ConnectionStatus.tsx',
        'tests/components/collaboration.test.tsx'
      ]
    }
  ],
  api: [
    {
      title: 'Core Board Management API',
      objective: 'RESTful API for board CRUD operations',
      effort: 5,
      priority: 'Critical' as const,
      acceptanceCriteria: [
        'Full CRUD operations for boards',
        'Input validation with JSON schemas',
        'Response time <300ms for 95th percentile',
        'Comprehensive error handling',
        'OpenAPI documentation',
        'Rate limiting and authentication'
      ],
      filesToCreate: [
        'src/controllers/boardController.js',
        'src/routes/boardRoutes.js',
        'src/validators/boardValidator.js',
        'tests/api/board.test.js',
        'docs/api/board-api.md'
      ]
    }
  ],
  testing: [
    {
      title: 'Automated Test Suite Implementation',
      objective: 'Comprehensive test automation framework',
      effort: 8,
      priority: 'High' as const,
      acceptanceCriteria: [
        'Unit tests >90% code coverage',
        'Integration tests for all API endpoints',
        'End-to-end tests for critical user journeys',
        'Performance tests with load simulation',
        'Security tests with vulnerability scanning'
      ],
      filesToCreate: [
        'tests/unit/',
        'tests/integration/',
        'tests/e2e/',
        'tests/performance/',
        'tests/security/'
      ]
    }
  ],
  monitoring: [
    {
      title: 'Application Performance Monitoring',
      objective: 'Comprehensive APM with metrics and alerting',
      effort: 5,
      priority: 'High' as const,
      acceptanceCriteria: [
        'Prometheus metrics collection',
        'Grafana dashboards for key metrics',
        'Alerting for performance degradation',
        'Distributed tracing with correlation IDs',
        'Business metrics tracking'
      ],
      filesToCreate: [
        'monitoring/prometheus-config.yml',
        'monitoring/grafana-dashboards/',
        'src/middleware/metricsMiddleware.js',
        'alerts/performance-alerts.yml'
      ]
    }
  ],
  documentation: [
    {
      title: 'Technical Documentation Suite',
      objective: 'Comprehensive technical documentation',
      effort: 5,
      priority: 'Medium' as const,
      acceptanceCriteria: [
        'API documentation with examples',
        'Architecture decision records (ADRs)',
        'Deployment and operation guides',
        'Troubleshooting and FAQ sections',
        'Code commenting and inline documentation'
      ],
      filesToCreate: [
        'docs/api/',
        'docs/architecture/',
        'docs/operations/',
        'README.md'
      ]
    }
  ]
};

// Helper function to create task list from TRD
export function createTaskListFromTRD(
  trdId: string,
  trdTitle: string,
  userId: string,
  strategyId: number,
  selectedCategories: string[] = Object.keys(TASK_CATEGORIES)
): { taskList: TaskListContainer, tasks: TaskCard[] } {
  const now = new Date().toISOString();
  
  // Calculate totals
  let totalTasks = 0;
  let totalEffort = 0;
  
  const categories = selectedCategories.map(categoryKey => {
    const category = TASK_CATEGORIES[categoryKey];
    const templates = TASK_TEMPLATES[categoryKey] || [];
    const taskCount = templates.length;
    const effort = templates.reduce((sum, template) => sum + template.effort, 0);
    
    totalTasks += taskCount;
    totalEffort += effort;
    
    return {
      id: categoryKey,
      name: category.name,
      icon: category.icon,
      description: category.description,
      priority: category.priority,
      status: 'Not Started' as const,
      taskCount,
      completedCount: 0,
      estimatedEffort: effort,
      isExpanded: false
    };
  });

  // Create task list container
  const taskListId = `tasklist-${Date.now()}`;
  const taskList: TaskListContainer = {
    id: taskListId,
    title: `Implementation Plan: ${trdTitle}`,
    description: `Comprehensive implementation plan generated from TRD: ${trdTitle}`,
    card_type: 'task-list',
    card_data: {
      metadata: {
        status: 'Not Started',
        priority: 'Critical',
        estimatedEffort: totalEffort,
        timeline: {
          startDate: null,
          targetDate: null
        },
        owner: '',
        dependencies: [],
        progress: {
          totalTasks,
          completedTasks: 0,
          percentage: 0
        }
      },
      categories,
      trdSource: {
        trdId,
        trdTitle,
        committedAt: now,
        committedBy: userId
      },
      generationSettings: {
        includedSections: selectedCategories,
        generatedAt: now,
        generatedBy: userId,
        version: '1.0.0'
      }
    },
    strategy_id: strategyId,
    created_at: now,
    updated_at: now,
    created_by: userId
  };

  // Create individual task cards
  const tasks: TaskCard[] = [];
  let taskCounter = 1;

  selectedCategories.forEach(categoryKey => {
    const category = TASK_CATEGORIES[categoryKey];
    const templates = TASK_TEMPLATES[categoryKey] || [];

    templates.forEach((template, index) => {
      const taskId = `${category.taskPrefix}-${String(index + 1).padStart(3, '0')}`;
      const taskCardId = `task-${Date.now()}-${taskCounter++}`;

      const task: TaskCard = {
        id: taskCardId,
        taskId,
        title: template.title,
        description: template.objective,
        card_type: 'task',
        task_list_id: taskListId,
        card_data: {
          metadata: {
            taskId,
            priority: template.priority,
            effort: template.effort,
            status: 'Not Started',
            assignee: '',
            sprint: '',
            labels: [categoryKey],
            dueDate: null,
            completionPercentage: 0
          },
          description: {
            objective: template.objective,
            businessValue: '',
            technicalContext: ''
          },
          acceptanceCriteria: template.acceptanceCriteria.map((criterion, i) => ({
            id: `ac-${i + 1}`,
            criterion,
            status: 'Not Started' as const
          })),
          dependencies: {
            blocks: [],
            blockedBy: [],
            related: []
          },
          technicalImplementation: {
            approach: '',
            filesToCreate: template.filesToCreate.map(path => ({
              path,
              status: 'Not Started' as const
            })),
            configuration: [],
            testing: ''
          },
          definitionOfDone: [
            { id: 'dod-1', criterion: 'All acceptance criteria met', status: 'Not Started' },
            { id: 'dod-2', criterion: 'Code review approved', status: 'Not Started' },
            { id: 'dod-3', criterion: 'Tests passing with >90% coverage', status: 'Not Started' },
            { id: 'dod-4', criterion: 'Documentation updated', status: 'Not Started' }
          ],
          resources: {
            documentation: [],
            examples: [],
            tools: []
          },
          trdSource: {
            trdId,
            trdTitle,
            section: category.name
          },
          comments: [],
          attachments: []
        },
        strategy_id: strategyId,
        created_at: now,
        updated_at: now,
        created_by: userId
      };

      tasks.push(task);
    });
  });

  return { taskList, tasks };
}
