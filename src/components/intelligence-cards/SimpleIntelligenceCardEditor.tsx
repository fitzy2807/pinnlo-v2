'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

interface SimpleIntelligenceCardEditorProps {
  onSave: (data: any) => Promise<void>
  onCancel: () => void
  category?: string
}

export default function SimpleIntelligenceCardEditor({
  onSave,
  onCancel,
  category = 'market'
}: SimpleIntelligenceCardEditorProps) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !summary.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      await onSave({
        category,
        title: title.trim(),
        summary: summary.trim(),
        intelligence_content: content.trim(),
        key_findings: [],
        tags: [],
        status: 'active',
        date_accessed: null
      })
    } catch (error) {
      alert('Error saving card: ' + error)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.5',
    color: '#111827',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
    outline: 'none',
    transition: 'border-color 0.2s ease'
  }

  const focusStyle = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onCancel}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)' 
        }}
      />
      
      {/* Modal */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          position: 'relative', 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
          width: '100%', 
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ 
          borderBottom: '1px solid #e5e7eb', 
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            margin: 0,
            color: '#111827'
          }}>
            Create Intelligence Card ({category})
          </h2>
          <button
            onClick={onCancel}
            style={{ 
              padding: '8px', 
              border: 'none', 
              background: 'none', 
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#374151'
            }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter intelligence title..."
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
            <div style={{ 
              marginTop: '4px', 
              fontSize: '12px', 
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              Current: "{title}"
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#374151'
            }}>
              Summary *
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of the intelligence..."
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical' as const,
                minHeight: '80px'
              }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
            <div style={{ 
              marginTop: '4px', 
              fontSize: '12px', 
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              Current: "{summary}"
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '15px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#374151'
            }}>
              Intelligence Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed intelligence content and analysis..."
              rows={6}
              style={{
                ...inputStyle,
                resize: 'vertical' as const,
                minHeight: '120px'
              }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
            <div style={{ 
              marginTop: '4px', 
              fontSize: '12px', 
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              Current: "{content}"
            </div>
          </div>

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '2px solid #d1d5db',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: '#374151'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 20px',
                border: 'none',
                backgroundColor: saving ? '#9ca3af' : '#3b82f6',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save Intelligence Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}