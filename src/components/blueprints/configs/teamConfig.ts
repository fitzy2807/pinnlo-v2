import { BlueprintConfig } from '../types'
import { Users } from 'lucide-react'

export const teamConfig: BlueprintConfig = {
  id: 'team',
  name: 'Team',
  icon: '👥',
  lucideIcon: Users,
  description: 'Capture information about teams and working groups',
  category: 'Organisation',
  prefix: 'TEM',
  color: 'bg-orange-100',
  fields: [
    // Basic Team Information
    {
      id: 'team_name',
      name: 'Team Name',
      label: 'Team Name',
      type: 'text',
      required: true,
      placeholder: 'Enter team name',
      helpText: 'Name of the team'
    },
    {
      id: 'team_type',
      name: 'Team Type',
      label: 'Team Type',
      type: 'select',
      required: true,
      options: [
        { value: 'permanent', label: 'Permanent Team' },
        { value: 'project', label: 'Project Team' },
        { value: 'cross_functional', label: 'Cross-functional Team' },
        { value: 'agile', label: 'Agile/Scrum Team' },
        { value: 'task_force', label: 'Task Force' },
        { value: 'committee', label: 'Committee' }
      ],
      helpText: 'Type of team structure'
    },
    {
      id: 'department',
      name: 'Department',
      label: 'Department',
      type: 'text',
      required: false,
      placeholder: 'Parent department',
      helpText: 'Department this team belongs to'
    },
    {
      id: 'formation_date',
      name: 'Formation Date',
      label: 'Formation Date',
      type: 'text',
      required: false,
      placeholder: 'e.g., 2024-01-15',
      helpText: 'When the team was formed'
    },
    
    // Team Leadership
    {
      id: 'team_lead',
      name: 'Team Lead',
      label: 'Team Lead/Manager',
      type: 'text',
      required: false,
      placeholder: 'Name of team lead',
      helpText: 'Person leading this team'
    },
    {
      id: 'lead_title',
      name: 'Lead Title',
      label: 'Lead\'s Title',
      type: 'text',
      required: false,
      placeholder: 'e.g., Engineering Manager, Scrum Master',
      helpText: 'Title of team lead'
    },
    {
      id: 'team_size',
      name: 'Team Size',
      label: 'Team Size',
      type: 'text',
      required: false,
      placeholder: 'e.g., 8',
      helpText: 'Number of team members'
    },
    
    // Team Purpose & Goals
    {
      id: 'mission',
      name: 'Mission',
      label: 'Team Mission',
      type: 'textarea',
      required: false,
      placeholder: 'Team\'s mission or purpose',
      helpText: 'Why this team exists'
    },
    {
      id: 'objectives',
      name: 'Objectives',
      label: 'Team Objectives',
      type: 'textarea',
      required: false,
      placeholder: 'List team objectives or goals',
      helpText: 'Current team goals'
    },
    {
      id: 'key_responsibilities',
      name: 'Key Responsibilities',
      label: 'Key Responsibilities',
      type: 'textarea',
      required: false,
      placeholder: 'List main team responsibilities',
      helpText: 'What the team is responsible for'
    },
    
    // Team Members & Roles
    {
      id: 'team_members',
      name: 'Team Members',
      label: 'Team Members',
      type: 'textarea',
      required: false,
      placeholder: 'List team members and roles',
      helpText: 'Current team composition'
    },
    {
      id: 'key_skills',
      name: 'Key Skills',
      label: 'Key Skills',
      type: 'tags',
      required: false,
      placeholder: 'Add team skills',
      helpText: 'Core competencies of the team'
    },
    {
      id: 'skill_gaps',
      name: 'Skill Gaps',
      label: 'Skill Gaps',
      type: 'textarea',
      required: false,
      placeholder: 'Skills the team needs',
      helpText: 'Missing skills or capabilities'
    },
    
    // Working Style & Process
    {
      id: 'methodology',
      name: 'Methodology',
      label: 'Working Methodology',
      type: 'select',
      required: false,
      options: [
        { value: 'agile', label: 'Agile' },
        { value: 'scrum', label: 'Scrum' },
        { value: 'kanban', label: 'Kanban' },
        { value: 'waterfall', label: 'Waterfall' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'adhoc', label: 'Ad-hoc' }
      ],
      helpText: 'How the team works'
    },
    {
      id: 'meeting_cadence',
      name: 'Meeting Cadence',
      label: 'Meeting Cadence',
      type: 'textarea',
      required: false,
      placeholder: 'e.g., Daily standups, Weekly planning',
      helpText: 'Regular team meetings'
    },
    {
      id: 'communication_tools',
      name: 'Communication Tools',
      label: 'Communication Tools',
      type: 'textarea',
      required: false,
      placeholder: 'e.g., Slack, Teams, Email',
      helpText: 'How the team communicates'
    },
    {
      id: 'collaboration_style',
      name: 'Collaboration Style',
      label: 'Collaboration Style',
      type: 'textarea',
      required: false,
      placeholder: 'Describe team collaboration approach',
      helpText: 'How team members work together'
    },
    
    // Current Work
    {
      id: 'current_projects',
      name: 'Current Projects',
      label: 'Current Projects',
      type: 'textarea',
      required: false,
      placeholder: 'List active projects',
      helpText: 'What the team is working on'
    },
    {
      id: 'sprint_goals',
      name: 'Sprint Goals',
      label: 'Current Sprint/Period Goals',
      type: 'textarea',
      required: false,
      placeholder: 'Goals for current work period',
      helpText: 'Short-term objectives'
    },
    {
      id: 'backlog_size',
      name: 'Backlog Size',
      label: 'Backlog Size',
      type: 'text',
      required: false,
      placeholder: 'e.g., 45 items, 3 months',
      helpText: 'Size of work backlog'
    },
    
    // Performance & Metrics
    {
      id: 'performance_metrics',
      name: 'Performance Metrics',
      label: 'Performance Metrics',
      type: 'textarea',
      required: false,
      placeholder: 'List team KPIs',
      helpText: 'How team performance is measured'
    },
    {
      id: 'velocity',
      name: 'Velocity',
      label: 'Team Velocity',
      type: 'text',
      required: false,
      placeholder: 'e.g., 40 points/sprint',
      helpText: 'Team productivity measure'
    },
    {
      id: 'achievements',
      name: 'Achievements',
      label: 'Recent Achievements',
      type: 'textarea',
      required: false,
      placeholder: 'List recent team wins',
      helpText: 'Notable accomplishments'
    },
    
    // Challenges & Needs
    {
      id: 'current_challenges',
      name: 'Current Challenges',
      label: 'Current Challenges',
      type: 'textarea',
      required: false,
      placeholder: 'List team challenges',
      helpText: 'Issues the team is facing'
    },
    {
      id: 'support_needed',
      name: 'Support Needed',
      label: 'Support Needed',
      type: 'textarea',
      required: false,
      placeholder: 'What help the team needs',
      helpText: 'Resources or support required'
    },
    {
      id: 'improvement_areas',
      name: 'Improvement Areas',
      label: 'Improvement Areas',
      type: 'textarea',
      required: false,
      placeholder: 'Areas for team improvement',
      helpText: 'Where the team can grow'
    },
    
    // Additional Information
    {
      id: 'team_culture',
      name: 'Team Culture',
      label: 'Team Culture',
      type: 'textarea',
      required: false,
      placeholder: 'Describe team culture and values',
      helpText: 'Team dynamics and culture'
    },
    {
      id: 'remote_setup',
      name: 'Remote Setup',
      label: 'Remote/Hybrid Setup',
      type: 'select',
      required: false,
      options: [
        { value: 'colocated', label: 'Co-located' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'fully_remote', label: 'Fully Remote' },
        { value: 'distributed', label: 'Distributed' }
      ],
      helpText: 'Team location setup'
    },
    {
      id: 'status',
      name: 'Status',
      label: 'Team Status',
      type: 'select',
      required: false,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'forming', label: 'Forming' },
        { value: 'scaling', label: 'Scaling' },
        { value: 'restructuring', label: 'Restructuring' },
        { value: 'disbanding', label: 'Disbanding' }
      ],
      helpText: 'Current team status'
    },
    {
      id: 'tags',
      name: 'Tags',
      label: 'Tags',
      type: 'tags',
      required: false,
      placeholder: 'Add tags',
      helpText: 'Tags for categorization'
    }
  ],
  defaultValues: {
    priority: 'medium',
    confidence: 'medium',
    team_type: 'permanent',
    methodology: 'agile',
    remote_setup: 'hybrid',
    status: 'active',
    tags: ['team']
  }
}