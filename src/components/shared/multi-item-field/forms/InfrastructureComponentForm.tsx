'use client'

import React, { useState, useCallback } from 'react'
import { Server, DollarSign, Gauge, AlertCircle } from 'lucide-react'
import { TRDInfrastructureComponent, CreateTRDInfrastructureComponent } from '@/types/trd-multi-item'

interface InfrastructureComponentFormProps {
  item: TRDInfrastructureComponent | CreateTRDInfrastructureComponent
  onChange: (item: TRDInfrastructureComponent | CreateTRDInfrastructureComponent) => void
  aiContext?: string
}

export default function InfrastructureComponentForm({ item, onChange, aiContext }: InfrastructureComponentFormProps) {
  const [resourceRequirements, setResourceRequirements] = useState(JSON.stringify(item.resource_requirements || {}, null, 2))
  const [scalingConfig, setScalingConfig] = useState(JSON.stringify(item.scaling_configuration || {}, null, 2))

  const handleFieldChange = useCallback((field: keyof TRDInfrastructureComponent, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const handleJsonChange = useCallback((type: 'resource' | 'scaling', value: string) => {
    try {
      const parsed = JSON.parse(value)
      if (type === 'resource') {
        setResourceRequirements(value)
        handleFieldChange('resource_requirements', parsed)
      } else {
        setScalingConfig(value)
        handleFieldChange('scaling_configuration', parsed)
      }
    } catch (error) {
      // Keep the string value for editing, but don't update the object
      if (type === 'resource') {
        setResourceRequirements(value)
      } else {
        setScalingConfig(value)
      }
    }
  }, [handleFieldChange])

  const getComponentTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return '🔧'
      case 'database': return '🗃️'
      case 'cache': return '⚡'
      case 'load_balancer': return '⚖️'
      case 'storage': return '💾'
      case 'network': return '🌐'
      default: return '📦'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-600 bg-green-50'
      case 'configured': return 'text-blue-600 bg-blue-50'
      case 'in_progress': return 'text-yellow-600 bg-yellow-50'
      case 'planned': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800'
      case 'staging': return 'bg-yellow-100 text-yellow-800'
      case 'development': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCostDisplay = () => {
    if (item.cost_estimate && item.cost_frequency) {
      return `$${item.cost_estimate}/${item.cost_frequency}`
    }
    return 'No cost estimate'
  }

  return (
    <div className="space-y-4">
      {/* Component ID and Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Component ID *
          </label>
          <input
            type="text"
            value={item.component_id || ''}
            onChange={(e) => handleFieldChange('component_id', e.target.value)}
            placeholder="INFRA-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Component Name *
          </label>
          <input
            type="text"
            value={item.component_name || ''}
            onChange={(e) => handleFieldChange('component_name', e.target.value)}
            placeholder="API Gateway"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Component Type and Environment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Component Type
          </label>
          <select
            value={item.component_type || 'service'}
            onChange={(e) => handleFieldChange('component_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="service">Service {getComponentTypeIcon('service')}</option>
            <option value="database">Database {getComponentTypeIcon('database')}</option>
            <option value="cache">Cache {getComponentTypeIcon('cache')}</option>
            <option value="load_balancer">Load Balancer {getComponentTypeIcon('load_balancer')}</option>
            <option value="storage">Storage {getComponentTypeIcon('storage')}</option>
            <option value="network">Network {getComponentTypeIcon('network')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deployment Environment
          </label>
          <select
            value={item.deployment_environment || 'production'}
            onChange={(e) => handleFieldChange('deployment_environment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
          <div className="mt-1">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getEnvironmentColor(item.deployment_environment || 'production')}`}>
              {item.deployment_environment?.toUpperCase() || 'PRODUCTION'}
            </span>
          </div>
        </div>
      </div>

      {/* Component Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Component Description *
        </label>
        <textarea
          value={item.component_description || ''}
          onChange={(e) => handleFieldChange('component_description', e.target.value)}
          placeholder="Detailed description of this infrastructure component..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Technology Stack */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Technology Stack *
        </label>
        <input
          type="text"
          value={item.technology_stack || ''}
          onChange={(e) => handleFieldChange('technology_stack', e.target.value)}
          placeholder="Node.js, Docker, AWS ECS, PostgreSQL"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Resource Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Resource Requirements (JSON)
        </label>
        <textarea
          value={resourceRequirements}
          onChange={(e) => handleJsonChange('resource', e.target.value)}
          placeholder='{"cpu": "2 cores", "memory": "4GB", "storage": "20GB"}'
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        />
      </div>

      {/* Scaling Configuration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Scaling Configuration (JSON)
        </label>
        <textarea
          value={scalingConfig}
          onChange={(e) => handleJsonChange('scaling', e.target.value)}
          placeholder='{"min_instances": 2, "max_instances": 10, "target_cpu": 70}'
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        />
      </div>

      {/* Monitoring Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monitoring Requirements *
        </label>
        <textarea
          value={item.monitoring_requirements || ''}
          onChange={(e) => handleFieldChange('monitoring_requirements', e.target.value)}
          placeholder="Monitoring and alerting requirements for this component..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Cost Estimation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Estimate ($)
          </label>
          <input
            type="number"
            value={item.cost_estimate || ''}
            onChange={(e) => handleFieldChange('cost_estimate', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="150.00"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost Frequency
          </label>
          <select
            value={item.cost_frequency || ''}
            onChange={(e) => handleFieldChange('cost_frequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select frequency</option>
            <option value="hour">Per Hour</option>
            <option value="day">Per Day</option>
            <option value="month">Per Month</option>
            <option value="year">Per Year</option>
          </select>
        </div>
      </div>

      {/* Status and Owner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={item.status || 'planned'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="configured">Configured</option>
            <option value="deployed">Deployed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <input
            type="text"
            value={item.owner || ''}
            onChange={(e) => handleFieldChange('owner', e.target.value)}
            placeholder="Infrastructure team or person responsible"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Dependencies and Health Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dependencies
          </label>
          <textarea
            value={item.dependencies || ''}
            onChange={(e) => handleFieldChange('dependencies', e.target.value)}
            placeholder="List of dependencies this component requires..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Health Check Endpoint
          </label>
          <input
            type="text"
            value={item.health_check_endpoint || ''}
            onChange={(e) => handleFieldChange('health_check_endpoint', e.target.value)}
            placeholder="/health"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Component Summary */}
      <div className={`p-3 border rounded-md ${getStatusColor(item.status || 'planned')}`}>
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          <span className="text-sm font-medium">
            Infrastructure Component Summary
          </span>
        </div>
        <div className="text-xs mt-1 space-y-1">
          <p>Type: {getComponentTypeIcon(item.component_type || 'service')} {item.component_type?.replace('_', ' ').toUpperCase()}</p>
          <p>Environment: {item.deployment_environment?.toUpperCase()}</p>
          <p>Technology: {item.technology_stack}</p>
          <p>Cost: {formatCostDisplay()}</p>
          {item.owner && <p>Owner: {item.owner}</p>}
          {item.health_check_endpoint && <p>Health Check: {item.health_check_endpoint}</p>}
        </div>
      </div>
    </div>
  )
}