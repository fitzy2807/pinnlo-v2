'use client'

import React, { useCallback } from 'react'
import { TestTube, User, Clock, AlertCircle } from 'lucide-react'
import { TRDTestCase, CreateTRDTestCase } from '@/types/trd-multi-item'

interface TestCaseFormProps {
  item: TRDTestCase | CreateTRDTestCase
  onChange: (item: TRDTestCase | CreateTRDTestCase) => void
  aiContext?: string
}

export default function TestCaseForm({ item, onChange, aiContext }: TestCaseFormProps) {
  const handleFieldChange = useCallback((field: keyof TRDTestCase, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'functional': return '⚙️'
      case 'unit': return '🧪'
      case 'integration': return '🔗'
      case 'performance': return '⚡'
      case 'security': return '🔒'
      case 'usability': return '👤'
      default: return '📋'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'blocked': return 'text-orange-600 bg-orange-50'
      case 'in_progress': return 'text-blue-600 bg-blue-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAutomationIcon = (status: string) => {
    switch (status) {
      case 'automated': return '🤖'
      case 'semi_automated': return '🔄'
      case 'manual': return '👨‍💻'
      default: return '📋'
    }
  }

  return (
    <div className="space-y-4">
      {/* Test Case ID and Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Case ID *
          </label>
          <input
            type="text"
            value={item.test_case_id || ''}
            onChange={(e) => handleFieldChange('test_case_id', e.target.value)}
            placeholder="TC-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Title *
          </label>
          <input
            type="text"
            value={item.test_title || ''}
            onChange={(e) => handleFieldChange('test_title', e.target.value)}
            placeholder="User Login Validation"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Test Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Test Description *
        </label>
        <textarea
          value={item.test_description || ''}
          onChange={(e) => handleFieldChange('test_description', e.target.value)}
          placeholder="Detailed description of what this test validates..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Test Type and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Type
          </label>
          <select
            value={item.test_type || 'functional'}
            onChange={(e) => handleFieldChange('test_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="functional">Functional {getTestTypeIcon('functional')}</option>
            <option value="unit">Unit {getTestTypeIcon('unit')}</option>
            <option value="integration">Integration {getTestTypeIcon('integration')}</option>
            <option value="performance">Performance {getTestTypeIcon('performance')}</option>
            <option value="security">Security {getTestTypeIcon('security')}</option>
            <option value="usability">Usability {getTestTypeIcon('usability')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Category
          </label>
          <select
            value={item.test_category || 'positive'}
            onChange={(e) => handleFieldChange('test_category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="boundary">Boundary</option>
            <option value="edge_case">Edge Case</option>
          </select>
        </div>
      </div>

      {/* Test Steps */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Test Steps *
        </label>
        <textarea
          value={item.test_steps || ''}
          onChange={(e) => handleFieldChange('test_steps', e.target.value)}
          placeholder="Step-by-step instructions to execute this test..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Expected Result */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expected Result *
        </label>
        <textarea
          value={item.expected_result || ''}
          onChange={(e) => handleFieldChange('expected_result', e.target.value)}
          placeholder="What should happen when this test is executed successfully..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Automation Status, Priority, and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Automation Status
          </label>
          <select
            value={item.automation_status || 'manual'}
            onChange={(e) => handleFieldChange('automation_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="manual">Manual {getAutomationIcon('manual')}</option>
            <option value="semi_automated">Semi-automated {getAutomationIcon('semi_automated')}</option>
            <option value="automated">Automated {getAutomationIcon('automated')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={item.priority || 'medium'}
            onChange={(e) => handleFieldChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={item.status || 'draft'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Test Data and Environment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Data
          </label>
          <textarea
            value={item.test_data || ''}
            onChange={(e) => handleFieldChange('test_data', e.target.value)}
            placeholder="Test data requirements or sample data..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Environment
          </label>
          <input
            type="text"
            value={item.test_environment || ''}
            onChange={(e) => handleFieldChange('test_environment', e.target.value)}
            placeholder="Testing environment (dev, staging, prod)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Assigned Tester and Estimated Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Tester
          </label>
          <input
            type="text"
            value={item.assigned_tester || ''}
            onChange={(e) => handleFieldChange('assigned_tester', e.target.value)}
            placeholder="Name of assigned tester"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Time
          </label>
          <input
            type="text"
            value={item.estimated_time || ''}
            onChange={(e) => handleFieldChange('estimated_time', e.target.value)}
            placeholder="30 minutes"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Test Case Summary */}
      <div className={`p-3 border rounded-md ${getStatusColor(item.status || 'draft')}`}>
        <div className="flex items-center gap-2">
          <TestTube className="w-4 h-4" />
          <span className="text-sm font-medium">
            Test Case Summary
          </span>
        </div>
        <div className="text-xs mt-1 space-y-1">
          <p>Type: {getTestTypeIcon(item.test_type || 'functional')} {item.test_type?.replace('_', ' ').toUpperCase()}</p>
          <p>Category: {item.test_category?.replace('_', ' ').toUpperCase()}</p>
          <p>Automation: {getAutomationIcon(item.automation_status || 'manual')} {item.automation_status?.replace('_', ' ').toUpperCase()}</p>
          {item.assigned_tester && <p>Tester: {item.assigned_tester}</p>}
          {item.estimated_time && <p>Estimated Time: {item.estimated_time}</p>}
        </div>
      </div>
    </div>
  )
}