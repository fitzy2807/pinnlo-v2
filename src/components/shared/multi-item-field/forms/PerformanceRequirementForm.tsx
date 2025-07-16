'use client'

import React, { useCallback } from 'react'
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { TRDPerformanceRequirement, CreateTRDPerformanceRequirement } from '@/types/trd-multi-item'

interface PerformanceRequirementFormProps {
  item: TRDPerformanceRequirement | CreateTRDPerformanceRequirement
  onChange: (item: TRDPerformanceRequirement | CreateTRDPerformanceRequirement) => void
  aiContext?: string
}

export default function PerformanceRequirementForm({ item, onChange, aiContext }: PerformanceRequirementFormProps) {
  const handleFieldChange = useCallback((field: keyof TRDPerformanceRequirement, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const getMetricTypeIcon = (type: string) => {
    switch (type) {
      case 'response_time': return '⚡'
      case 'throughput': return '📈'
      case 'availability': return '🔄'
      case 'scalability': return '📊'
      case 'resource_usage': return '💾'
      default: return '📋'
    }
  }

  const getMetricTypeDescription = (type: string) => {
    switch (type) {
      case 'response_time': return 'Time taken to respond to requests'
      case 'throughput': return 'Number of requests processed per unit time'
      case 'availability': return 'System uptime percentage'
      case 'scalability': return 'System\'s ability to handle increased load'
      case 'resource_usage': return 'CPU, memory, or storage consumption'
      default: return 'Performance metric'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'met': return 'text-green-600 bg-green-50'
      case 'validated': return 'text-blue-600 bg-blue-50'
      case 'measured': return 'text-yellow-600 bg-yellow-50'
      case 'defined': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const calculatePerformanceScore = () => {
    const target = item.target_value || 0
    const baseline = item.baseline_value || 0
    const warning = item.threshold_warning || 0
    const critical = item.threshold_critical || 0

    if (baseline === 0) return null

    // Different scoring based on metric type
    if (item.metric_type === 'response_time' || item.metric_type === 'resource_usage') {
      // Lower is better
      if (baseline <= target) return 'excellent'
      if (baseline <= warning) return 'good'
      if (baseline <= critical) return 'warning'
      return 'critical'
    } else {
      // Higher is better (throughput, availability, scalability)
      if (baseline >= target) return 'excellent'
      if (baseline >= warning) return 'good'
      if (baseline >= critical) return 'warning'
      return 'critical'
    }
  }

  const performanceScore = calculatePerformanceScore()

  return (
    <div className="space-y-4">
      {/* Requirement ID and Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirement ID *
          </label>
          <input
            type="text"
            value={item.requirement_id || ''}
            onChange={(e) => handleFieldChange('requirement_id', e.target.value)}
            placeholder="PERF-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Requirement Title *
          </label>
          <input
            type="text"
            value={item.requirement_title || ''}
            onChange={(e) => handleFieldChange('requirement_title', e.target.value)}
            placeholder="API Response Time"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Metric Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Metric Type *
        </label>
        <select
          value={item.metric_type || 'response_time'}
          onChange={(e) => handleFieldChange('metric_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="response_time">Response Time</option>
          <option value="throughput">Throughput</option>
          <option value="availability">Availability</option>
          <option value="scalability">Scalability</option>
          <option value="resource_usage">Resource Usage</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          {getMetricTypeIcon(item.metric_type || 'response_time')} {getMetricTypeDescription(item.metric_type || 'response_time')}
        </p>
      </div>

      {/* Target Value and Unit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Value *
          </label>
          <input
            type="number"
            value={item.target_value || ''}
            onChange={(e) => handleFieldChange('target_value', parseFloat(e.target.value))}
            placeholder="100"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit *
          </label>
          <select
            value={item.target_unit || 'ms'}
            onChange={(e) => handleFieldChange('target_unit', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ms">Milliseconds (ms)</option>
            <option value="s">Seconds (s)</option>
            <option value="rps">Requests per second (rps)</option>
            <option value="rpm">Requests per minute (rpm)</option>
            <option value="percent">Percentage (%)</option>
            <option value="GB">Gigabytes (GB)</option>
            <option value="MB">Megabytes (MB)</option>
            <option value="CPU">CPU cores</option>
            <option value="concurrent_users">Concurrent users</option>
          </select>
        </div>
      </div>

      {/* Measurement Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Measurement Method *
        </label>
        <textarea
          value={item.measurement_method || ''}
          onChange={(e) => handleFieldChange('measurement_method', e.target.value)}
          placeholder="How will this metric be measured? Include tools, procedures, and conditions..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Baseline and Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Baseline Value
          </label>
          <input
            type="number"
            value={item.baseline_value || ''}
            onChange={(e) => handleFieldChange('baseline_value', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Current value"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Warning Threshold
          </label>
          <input
            type="number"
            value={item.threshold_warning || ''}
            onChange={(e) => handleFieldChange('threshold_warning', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Warning level"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Critical Threshold
          </label>
          <input
            type="number"
            value={item.threshold_critical || ''}
            onChange={(e) => handleFieldChange('threshold_critical', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Critical level"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Monitoring and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monitoring Frequency
          </label>
          <select
            value={item.monitoring_frequency || 'continuous'}
            onChange={(e) => handleFieldChange('monitoring_frequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="continuous">Continuous</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
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
            value={item.status || 'defined'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="defined">Defined</option>
            <option value="measured">Measured</option>
            <option value="validated">Validated</option>
            <option value="met">Met</option>
          </select>
        </div>
      </div>

      {/* Owner and Validation Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <input
            type="text"
            value={item.owner || ''}
            onChange={(e) => handleFieldChange('owner', e.target.value)}
            placeholder="Person responsible for monitoring"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Validation Notes
          </label>
          <textarea
            value={item.validation_notes || ''}
            onChange={(e) => handleFieldChange('validation_notes', e.target.value)}
            placeholder="Notes about validation results..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Performance Score Display */}
      {performanceScore && (
        <div className={`p-3 border rounded-md ${
          performanceScore === 'excellent' ? 'bg-green-50 border-green-200' :
          performanceScore === 'good' ? 'bg-blue-50 border-blue-200' :
          performanceScore === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {performanceScore === 'excellent' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
             performanceScore === 'good' ? <TrendingUp className="w-4 h-4 text-blue-600" /> :
             <AlertTriangle className="w-4 h-4 text-yellow-600" />}
            <span className="text-sm font-medium">
              Performance Score: {performanceScore.toUpperCase()}
            </span>
          </div>
          <div className="text-xs mt-1 space-y-1">
            <p>Target: {item.target_value} {item.target_unit}</p>
            {item.baseline_value && <p>Current: {item.baseline_value} {item.target_unit}</p>}
            {item.threshold_warning && <p>Warning: {item.threshold_warning} {item.target_unit}</p>}
            {item.threshold_critical && <p>Critical: {item.threshold_critical} {item.target_unit}</p>}
          </div>
        </div>
      )}
    </div>
  )
}