'use client'

import React, { useState, useCallback } from 'react'
import { Plus, X, Code, Database } from 'lucide-react'
import { TRDApiEndpoint, CreateTRDApiEndpoint } from '@/types/trd-multi-item'

interface ApiEndpointFormProps {
  item: TRDApiEndpoint | CreateTRDApiEndpoint
  onChange: (item: TRDApiEndpoint | CreateTRDApiEndpoint) => void
  aiContext?: string
}

export default function ApiEndpointForm({ item, onChange, aiContext }: ApiEndpointFormProps) {
  const [requestSchema, setRequestSchema] = useState(JSON.stringify(item.request_format || {}, null, 2))
  const [responseSchema, setResponseSchema] = useState(JSON.stringify(item.response_format || {}, null, 2))
  const [showSchemaEditor, setShowSchemaEditor] = useState(false)

  const handleFieldChange = useCallback((field: keyof TRDApiEndpoint, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const handleSchemaChange = useCallback((type: 'request' | 'response', value: string) => {
    try {
      const parsed = JSON.parse(value)
      if (type === 'request') {
        setRequestSchema(value)
        handleFieldChange('request_format', parsed)
      } else {
        setResponseSchema(value)
        handleFieldChange('response_format', parsed)
      }
    } catch (error) {
      // Keep the string value for editing, but don't update the object
      if (type === 'request') {
        setRequestSchema(value)
      } else {
        setResponseSchema(value)
      }
    }
  }, [handleFieldChange])

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800'
      case 'POST': return 'bg-green-100 text-green-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      case 'PATCH': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Endpoint ID and Path */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endpoint ID *
          </label>
          <input
            type="text"
            value={item.endpoint_id || ''}
            onChange={(e) => handleFieldChange('endpoint_id', e.target.value)}
            placeholder="EP-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endpoint Path *
          </label>
          <input
            type="text"
            value={item.endpoint_path || ''}
            onChange={(e) => handleFieldChange('endpoint_path', e.target.value)}
            placeholder="/api/v1/users"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* HTTP Method and Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HTTP Method *
          </label>
          <select
            value={item.http_method || 'GET'}
            onChange={(e) => handleFieldChange('http_method', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <div className="mt-1">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getMethodColor(item.http_method || 'GET')}`}>
              {item.http_method || 'GET'}
            </span>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={item.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Brief description of what this endpoint does..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Authentication and Rate Limiting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={item.authentication_required !== false}
              onChange={(e) => handleFieldChange('authentication_required', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Authentication Required</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate Limit (requests)
          </label>
          <input
            type="number"
            value={item.rate_limit_requests || ''}
            onChange={(e) => handleFieldChange('rate_limit_requests', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="1000"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate Limit Window
          </label>
          <select
            value={item.rate_limit_window || ''}
            onChange={(e) => handleFieldChange('rate_limit_window', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No limit</option>
            <option value="1 minute">1 minute</option>
            <option value="5 minutes">5 minutes</option>
            <option value="15 minutes">15 minutes</option>
            <option value="1 hour">1 hour</option>
            <option value="1 day">1 day</option>
          </select>
        </div>
      </div>

      {/* Status, Priority, and Owner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="implemented">Implemented</option>
            <option value="deprecated">Deprecated</option>
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
            Owner
          </label>
          <input
            type="text"
            value={item.owner || ''}
            onChange={(e) => handleFieldChange('owner', e.target.value)}
            placeholder="Developer name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Request/Response Schema Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Request & Response Schemas
          </label>
          <button
            onClick={() => setShowSchemaEditor(!showSchemaEditor)}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Code className="w-3 h-3" />
            {showSchemaEditor ? 'Hide' : 'Show'} Schema Editor
          </button>
        </div>
        
        {showSchemaEditor && (
          <div className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Schema (JSON)
              </label>
              <textarea
                value={requestSchema}
                onChange={(e) => handleSchemaChange('request', e.target.value)}
                placeholder='{"field": "type", "example": "value"}'
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Schema (JSON)
              </label>
              <textarea
                value={responseSchema}
                onChange={(e) => handleSchemaChange('response', e.target.value)}
                placeholder='{"field": "type", "example": "value"}'
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Implementation Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Implementation Notes
        </label>
        <textarea
          value={item.implementation_notes || ''}
          onChange={(e) => handleFieldChange('implementation_notes', e.target.value)}
          placeholder="Additional implementation details, considerations, or notes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}