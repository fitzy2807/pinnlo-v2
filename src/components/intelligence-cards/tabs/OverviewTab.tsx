'use client'

import React from 'react'
import { CardData } from '@/types/card'
import { getCategoryTheme, getCategoryDisplayName } from '../utils/categoryThemes'
import { Calendar, User, Tag, Target, Shield, TrendingUp } from 'lucide-react'

interface OverviewTabProps {
  card: CardData
}

export default function OverviewTab({ card }: OverviewTabProps) {
  const theme = getCategoryTheme(card.cardType || 'market')
  const categoryName = getCategoryDisplayName(card.cardType || 'market')
  
  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Extract key insights from various possible fields
  const getKeyInsights = () => {
    const insights = []
    
    // Check for key_findings field
    if (card.key_findings && Array.isArray(card.key_findings)) {
      insights.push(...card.key_findings)
    }
    
    // Check for insights field
    if (card.insights && Array.isArray(card.insights)) {
      insights.push(...card.insights)
    }
    
    // Check for bullet points in description
    if (card.description) {
      const bullets = card.description.split('\n').filter(line => 
        line.trim().startsWith('•') || line.trim().startsWith('-')
      )
      if (bullets.length > 0) {
        insights.push(...bullets.map(b => b.replace(/^[•-]\s*/, '')))
      }
    }
    
    return insights
  }
  
  const keyInsights = getKeyInsights()
  
  return (
    <div className="overview-tab-content">
      {/* Executive Summary Section */}
      <section className="mb-8">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${theme.dot}`}></div>
          Executive Summary
        </h3>
        <div className="text-[12px] leading-relaxed text-gray-700 space-y-3">
          {card.description ? (
            card.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-wrap">
                {paragraph.trim()}
              </p>
            ))
          ) : (
            <p className="text-gray-500 italic">No summary available</p>
          )}
        </div>
      </section>
      
      {/* Key Insights Section */}
      {keyInsights.length > 0 && (
        <section className="mb-8">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-600" />
            Key Insights
          </h3>
          <div className="space-y-2">
            {keyInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[12px] text-gray-700">
                <span className="text-gray-400 mt-0.5">•</span>
                <span className="flex-1">{insight}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Strategic Context Section */}
      {card.strategicAlignment && (
        <section className="mb-8">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            Strategic Context
          </h3>
          <p className="text-[12px] leading-relaxed text-gray-700">
            {card.strategicAlignment}
          </p>
        </section>
      )}
      
      {/* Metadata Grid */}
      <section className="mb-8">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-600" />
          Intelligence Metadata
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Priority Level</p>
            <p className="text-[12px] text-gray-900 font-medium">
              {card.priority || 'Medium'}
              {card.priorityRationale && (
                <span className="text-gray-600 font-normal ml-2">
                  — {card.priorityRationale}
                </span>
              )}
            </p>
          </div>
          
          {/* Confidence */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Confidence Level</p>
            <p className="text-[12px] text-gray-900 font-medium">
              {card.confidenceLevel || 'Medium'}
              {card.confidenceRationale && (
                <span className="text-gray-600 font-normal ml-2">
                  — {card.confidenceRationale}
                </span>
              )}
            </p>
          </div>
          
          {/* Owner */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Owner</p>
            <p className="text-[12px] text-gray-900 flex items-center gap-1">
              <User className="w-3 h-3 text-gray-400" />
              {card.owner || card.creator || 'Unassigned'}
            </p>
          </div>
          
          {/* Category */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Category</p>
            <p className="text-[12px] text-gray-900">{categoryName}</p>
          </div>
        </div>
      </section>
      
      {/* Tags Section */}
      {card.tags && card.tags.length > 0 && (
        <section className="mb-8">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-600" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {card.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-[11px] rounded-full bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
      
      {/* Timeline */}
      <section className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(card.created_at || card.createdDate)}</span>
          </div>
          <div>
            Last updated {formatDate(card.updated_at || card.lastModified)}
          </div>
        </div>
      </section>
    </div>
  )
}