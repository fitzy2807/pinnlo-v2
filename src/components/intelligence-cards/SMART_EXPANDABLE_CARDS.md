# Smart Expandable Intelligence Cards

## Overview
Intelligence cards now feature smart expansion that shows just enough additional context for decision-making without overwhelming the scanning experience.

## Interaction Pattern

1. **First Click**: Expands card to show key findings + relevance score (adds ~60px height)
2. **Second Click**: Opens full modal editor with all details

## Expanded Content

When expanded, cards reveal:
- **Key Findings**: 2-3 bullet points with most important insights
- **Relevance Score**: Visual progress bar showing intelligence value
- **Action Hint**: "Click to view full details and edit"

## Design Features

### Typography
- Clean, small text (10-13px) using system font stack
- Clear hierarchy with restrained font weights
- Minimal color usage - focus on gray tones

### Animation
- Smooth 200ms expansion with delayed content entrance
- Subtle fade-in for expanded content
- No jarring movements or excessive height changes

### Visual Indicators
- Chevron down/up icons for expand/collapse
- Hover states preserved
- Quick actions hidden when expanded to reduce clutter

## User Benefits

1. **Scanning Phase**: See titles and brief summaries
2. **Decision Phase**: Expand to see if content is relevant
3. **Action Phase**: Click through to full editor

This creates a progressive disclosure pattern perfect for business intelligence workflows.