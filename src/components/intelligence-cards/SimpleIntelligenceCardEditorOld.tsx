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
                date_accessed: null  // Set to null instead of empty string
      })
    } catch (error) {
      alert('Error saving card: ' + error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
      />
      
      {/* Modal */}
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      >
        <div 
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl"
          style={{ 
            position: 'relative', 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
            width: '100%', 
            maxWidth: '42rem',
            zIndex: 51
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="border-b border-gray-200 px-6 py-4"
            style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}
          >
            <div 
              className="flex items-center justify-between"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Create Intelligence Card
              </h2>
              <button
                onClick={onCancel}
                style={{ 
                  padding: '4px', 
                  border: 'none', 
                  background: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  console.log('Title change:', e.target.value)
                  setTitle(e.target.value)
                }}
                placeholder="Enter intelligence title"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Summary *
              </label>
              <textarea
                value={summary}
                onChange={(e) => {
                  console.log('Summary change:', e.target.value)
                  setSummary(e.target.value)
                }}
                placeholder="Brief summary of the intelligence"
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Intelligence Content *
              </label>
              <textarea
                value={content}
                onChange={(e) => {
                  console.log('Content change:', e.target.value)
                  setContent(e.target.value)
                }}
                placeholder="Detailed intelligence content and analysis"
                rows={6}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Actions */}
            <div 
              className="flex justify-end space-x-3"
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}
            >
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  backgroundColor: saving ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save Intelligence Card'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}