'use client'

import React, { useState, useCallback } from 'react'
import { Plus, X, Shield, AlertTriangle } from 'lucide-react'
import { TRDSecurityControl, CreateTRDSecurityControl } from '@/types/trd-multi-item'

interface SecurityControlFormProps {
  item: TRDSecurityControl | CreateTRDSecurityControl
  onChange: (item: TRDSecurityControl | CreateTRDSecurityControl) => void
  aiContext?: string
}

export default function SecurityControlForm({ item, onChange, aiContext }: SecurityControlFormProps) {
  const [newFramework, setNewFramework] = useState('')

  const handleFieldChange = useCallback((field: keyof TRDSecurityControl, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const handleAddFramework = useCallback(() => {
    if (newFramework.trim()) {
      const updatedFrameworks = [...(item.compliance_frameworks || []), newFramework.trim()]
      handleFieldChange('compliance_frameworks', updatedFrameworks)
      setNewFramework('')
    }
  }, [newFramework, item.compliance_frameworks, handleFieldChange])

  const handleRemoveFramework = useCallback((index: number) => {
    const updatedFrameworks = item.compliance_frameworks?.filter((_, i) => i !== index) || []
    handleFieldChange('compliance_frameworks', updatedFrameworks)
  }, [item.compliance_frameworks, handleFieldChange])

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-red-100 text-red-700 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getControlTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return '🛡️'
      case 'detective': return '🔍'
      case 'corrective': return '🔧'
      default: return '⚙️'
    }
  }

  return (
    <div className="space-y-4">
      {/* Control ID and Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control ID *
          </label>
          <input
            type="text"
            value={item.control_id || ''}
            onChange={(e) => handleFieldChange('control_id', e.target.value)}
            placeholder="SEC-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control Title *
          </label>
          <input
            type="text"
            value={item.control_title || ''}
            onChange={(e) => handleFieldChange('control_title', e.target.value)}
            placeholder="User Authentication Control"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Control Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Control Description *
        </label>
        <textarea
          value={item.control_description || ''}
          onChange={(e) => handleFieldChange('control_description', e.target.value)}
          placeholder="Detailed description of what this security control does and why it's needed..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Control Type and Security Domain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control Type
          </label>
          <select
            value={item.control_type || 'preventive'}
            onChange={(e) => handleFieldChange('control_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="preventive">Preventive {getControlTypeIcon('preventive')}</option>
            <option value="detective">Detective {getControlTypeIcon('detective')}</option>
            <option value="corrective">Corrective {getControlTypeIcon('corrective')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Security Domain
          </label>
          <select
            value={item.security_domain || 'application'}
            onChange={(e) => handleFieldChange('security_domain', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="application">Application</option>
            <option value="data">Data</option>
            <option value="network">Network</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="identity">Identity</option>
          </select>
        </div>
      </div>

      {/* Implementation Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Implementation Method *
        </label>
        <textarea
          value={item.implementation_method || ''}
          onChange={(e) => handleFieldChange('implementation_method', e.target.value)}
          placeholder="How will this control be implemented? Include technical details, tools, and processes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Validation Criteria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Validation Criteria *
        </label>
        <textarea
          value={item.validation_criteria || ''}
          onChange={(e) => handleFieldChange('validation_criteria', e.target.value)}
          placeholder="How will you verify this control is working effectively? Include test procedures and success criteria..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Compliance Frameworks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Compliance Frameworks
        </label>
        <div className="space-y-2">
          {item.compliance_frameworks?.map((framework, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                {framework}
              </div>
              <button
                onClick={() => handleRemoveFramework(index)}
                className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Remove framework"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFramework}
              onChange={(e) => setNewFramework(e.target.value)}
              placeholder="Add compliance framework (e.g., SOC2, GDPR, HIPAA)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFramework()}
            />
            <button
              onClick={handleAddFramework}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Add framework"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Risk Level and Implementation Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Risk Level
          </label>
          <select
            value={item.risk_level || 'medium'}
            onChange={(e) => handleFieldChange('risk_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <div className="mt-1">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md border ${getRiskLevelColor(item.risk_level || 'medium')}`}>
              {item.risk_level?.toUpperCase() || 'MEDIUM'} RISK
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Implementation Status
          </label>
          <select
            value={item.implementation_status || 'planned'}
            onChange={(e) => handleFieldChange('implementation_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="implemented">Implemented</option>
            <option value="verified">Verified</option>
          </select>
        </div>
      </div>

      {/* Owner and Target Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <input
            type="text"
            value={item.owner || ''}
            onChange={(e) => handleFieldChange('owner', e.target.value)}
            placeholder="Security engineer or team responsible"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Date
          </label>
          <input
            type="date"
            value={item.target_date || ''}
            onChange={(e) => handleFieldChange('target_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Risk Assessment Display */}
      {item.risk_level && (
        <div className={`p-3 border rounded-md ${getRiskLevelColor(item.risk_level)} bg-opacity-50`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Risk Assessment: {item.risk_level.toUpperCase()} risk level in {item.security_domain} domain
            </span>
          </div>
          <p className="text-xs mt-1 opacity-90">
            Control Type: {getControlTypeIcon(item.control_type || 'preventive')} {item.control_type?.charAt(0).toUpperCase() + item.control_type?.slice(1)}
          </p>
        </div>
      )}
    </div>
  )
}