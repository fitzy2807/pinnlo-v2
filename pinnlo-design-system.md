# Pinnlo Design System Documentation

## Table of Contents
1. [Overview & Tech Stack](#overview--tech-stack)
2. [Design Foundations](#design-foundations)
3. [Component Library](#component-library)
4. [Hub/Bank Architecture](#hubbank-architecture)
5. [Card Types & Patterns](#card-types--patterns)
6. [Design Patterns](#design-patterns)
7. [Visual Assets Reference](#visual-assets-reference)

---

## Overview & Tech Stack

### Core Technologies
- **Framework**: Next.js 14.2.30 with React 18
- **Styling**: Tailwind CSS 3.4.17 (utility-first CSS framework)
- **Icons**: Lucide React 0.525.0 (525+ open source icons)
- **Font**: Inter (system-ui fallback)
- **Date Handling**: date-fns 4.1.0
- **Notifications**: react-hot-toast 2.5.2

### Key Design Principles
- **Mobile-first responsive design**
- **Utility-first CSS approach**
- **Component-based architecture**
- **Consistent spacing and sizing**
- **Reduced typography scale (25% smaller than standard)**
- **Grayscale-focused with semantic colors**

---

## Design Foundations

### Color System

#### Primary Palette (Grayscale)
- **Black**: `#000000` - Primary text, headers, active states
- **Gray-900**: `#111827` - Secondary text, borders on focus
- **Gray-800**: `#1F2937` - Hover states
- **Gray-700**: `#374151` - Body text
- **Gray-600**: `#4B5563` - Secondary body text
- **Gray-500**: `#6B7280` - Placeholder text, captions
- **Gray-400**: `#9CA3AF` - Disabled states
- **Gray-300**: `#D1D5DB` - Borders, dividers
- **Gray-200**: `#E5E7EB` - Background accents, skeleton states
- **Gray-100**: `#F3F4F6` - Light backgrounds
- **Gray-50**: `#F9FAFB` - Subtle backgrounds
- **White**: `#FFFFFF` - Primary background

#### Semantic Colors
- **Success**: Green-500 (#10B981), Green-100 (#D1FAE5), Green-800 (#065F46)
- **Warning**: Yellow-500 (#F59E0B), Yellow-100 (#FEF3C7), Yellow-800 (#92400E)
- **Error**: Red-500 (#EF4444), Red-100 (#FEE2E2), Red-800 (#991B1B)
- **Info**: Blue-500 (#3B82F6), Blue-100 (#DBEAFE), Blue-800 (#1E40AF)

#### Category Colors (Intelligence Bank)
- **Market**: Green (bg-green-100, text-green-800, border-green-200)
- **Competitor**: Blue (bg-blue-100, text-blue-800, border-blue-200)
- **Trends**: Purple (bg-purple-100, text-purple-800, border-purple-200)
- **Technology**: Indigo (bg-indigo-100, text-indigo-800, border-indigo-200)
- **Stakeholder**: Yellow (bg-yellow-100, text-yellow-800, border-yellow-200)
- **Consumer**: Red (bg-red-100, text-red-800, border-red-200)
- **Risk**: Orange (bg-orange-100, text-orange-800, border-orange-200)
- **Opportunities**: Teal (bg-teal-100, text-teal-800, border-teal-200)

#### Group Colors (6-color palette)
- Blue, Green, Purple, Red, Yellow, Gray

### Typography System

#### Font Family
```css
font-family: 'Inter', system-ui, sans-serif;
font-feature-settings: 'cv11', 'ss01';
font-variation-settings: 'opsz' 32;
```

#### Type Scale (25% Reduced)
- **H1**: 24px (text-2xl), font-bold, text-gray-900
- **H2**: 20px (text-xl), font-semibold, text-gray-900
- **H3**: 18px (text-lg), font-semibold, text-gray-900
- **H4**: 16px (text-base), font-medium, text-gray-900
- **Body**: 14px (text-sm), text-gray-600
- **Small**: 12px (text-xs), text-gray-600
- **Caption**: 12px (text-xs), text-gray-500

### Spacing System
Uses Tailwind's default spacing scale:
- `0`: 0px
- `0.5`: 2px
- `1`: 4px
- `1.5`: 6px
- `2`: 8px
- `2.5`: 10px
- `3`: 12px
- `3.5`: 14px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px
- `10`: 40px
- `12`: 48px
- `16`: 64px
- `20`: 80px
- `24`: 96px

### Border Radius
- **None**: 0px
- **sm**: 2px
- **Default**: 4px
- **md**: 6px
- **lg**: 8px
- **xl**: 12px
- **2xl**: 16px
- **3xl**: 24px
- **full**: 9999px

### Shadow System
- **sm**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **Default**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **md**: 0 4px 6px rgba(0, 0, 0, 0.1)
- **lg**: 0 10px 15px rgba(0, 0, 0, 0.1)
- **xl**: 0 20px 25px rgba(0, 0, 0, 0.1)

### Animation & Transitions
- **Default Duration**: 200ms
- **Easing**: ease-out
- **Common Transitions**: all, colors, opacity, transform
- **Hover Transform**: translateY(-2px)
- **Active Transform**: scale(0.98)

---

## Component Library

### Button Component
```css
.btn {
  @apply inline-flex items-center justify-center gap-2 rounded-md font-medium 
         transition-all duration-200 focus:outline-none focus:ring-2 
         focus:ring-offset-2;
}
```

#### Variants
- **Primary**: bg-gray-900, text-white, hover:bg-gray-800
- **Secondary**: bg-white, text-gray-700, border-gray-300
- **Ghost**: text-gray-600, hover:bg-gray-100

#### Sizes
- **Small**: px-2.5 py-1.5 text-xs
- **Medium**: px-3 py-1.5 text-sm
- **Large**: px-4 py-2 text-base

### Input Component
```css
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md text-sm 
         transition-all duration-200 focus:outline-none focus:border-gray-900 
         focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20;
}
```

#### Sizes
- **Small**: px-2.5 py-1.5 text-xs
- **Large**: px-3 py-2 text-sm

### Card Component System
```css
.card {
  @apply bg-white border border-gray-200 rounded-lg p-4 
         transition-all duration-200 shadow-sm;
}
```

#### States
- **Hover**: border-gray-300 shadow-md -translate-y-0.5
- **Selected**: border-gray-900 bg-gray-50 ring-2 ring-gray-900 ring-opacity-10
- **Highlight**: bg-gray-50 border-gray-300

#### Sizes
- **Compact**: p-3 rounded-md
- **Default**: p-4 rounded-lg
- **Large**: p-6 rounded-xl

### Badge Component
```css
.badge {
  @apply inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium;
}
```

#### Variants
- **Success**: bg-green-100 text-green-800
- **Warning**: bg-yellow-100 text-yellow-800
- **Error**: bg-red-100 text-red-800
- **Neutral**: bg-gray-100 text-gray-700

### Form Components
- **Form Group**: mb-3
- **Form Label**: text-xs font-medium text-gray-900 mb-1.5
- **Form Error**: text-red-600 text-xs mt-1

### Layout Components
- **Sidebar**: w-64 (256px) bg-gray-50 border-r border-gray-200
- **Panel**: w-80 (320px) bg-gray-50 border-l border-gray-200
- **Header**: h-16 (64px) bg-black text-white border-b border-gray-200
- **Container**: max-w-7xl mx-auto px-6

### Toast Component
- Custom implementation with react-hot-toast
- Position: bottom-right
- Animation: slide-up

---

## Hub/Bank Architecture

### 1. Intelligence Bank

#### Layout
- **Type**: Full-screen modal with backdrop
- **Structure**: Two-column (sidebar + main content)
- **Sidebar Width**: 256px fixed
- **Background**: White with gray-50 sidebar

#### Sidebar Components
- **Header**: Title + Close button (X icon)
- **Agents Section**: Dynamic agent buttons (replaces old Tools dropdown)
  - Card Creator
  - URL Analyzer
  - Text & Paste Processor
  - Auto-loaded from agent registry
- **Categories**: Vertical list with counts
  - Dashboard, Market, Competitor, Trends, Technology, Stakeholder, Consumer, Risk, Opportunities, Saved Cards, Archive, Groups

#### Main Content
- **Card Display**: Uses IntelligenceCardGrid component
- **Preview Cards**: Magazine-style preview cards (IntelligenceCardPreview)
- **Modal Overlay**: Full detail view (IntelligenceCardModal)
- **Progressive Disclosure**: Preview → expand → modal pattern
- **Smart Expandable**: First click expands, second click opens modal

#### Key Features
- **Instant Loading**: Preview cards render instantly (vs 12-28 second old cards)
- **Expandable Content**: Key findings, relevance scores, action hints
- **Smooth Animations**: 200ms expansion with delayed content entrance
- **Dynamic Agents**: Agents loaded from registry, assignable to hub

#### Icons Used
X, Search, Filter, Settings, TrendingUp, Eye, BarChart3, Cpu, Crown, Target, AlertTriangle, Lightbulb, Bookmark, Archive, TestTube, Plus, ChevronDown, Grid3X3, List, Trash2, ExternalLink, Upload, Link, Menu, Folder, FolderPlus, Zap, Bot

### 2. Strategy Bank

#### Layout
- **Type**: Embedded view (not modal)
- **Structure**: Two-column with transitions
- **Integration**: Part of strategy workspace

#### Sidebar Components
- **Back Button**: Returns to strategies list
- **Agents Section**: Dynamic agent buttons
  - Card Creator (shared from Intelligence Bank)
  - Other agents as assigned
- **Tools Section**:
  - Blueprint Manager
- **Blueprints Section**: Draggable list with counts
- **Groups Section**: Create button + group list

#### Main Content
- **Card Display**: Uses IntelligenceCardGrid component (100% code reuse)
- **Preview Cards**: Same preview system as Intelligence Bank
- **Modal Overlay**: Same modal overlay as Intelligence Bank
- **Data Transformation**: Transforms strategy data to Intelligence format

#### Unique Features
- **Component Reuse**: Uses exact same components as Intelligence Bank
- **Data Transformation Layer**: Maps strategy fields to common format
- **Blueprint Integration**: Dynamic fields from blueprint registry
- **Drag & Drop**: Blueprint reordering functionality

### 3. Development Bank

#### Layout
- **Type**: Full-height embedded view
- **Structure**: Two-column standard

#### Sidebar Components
- **Agents Section**: Dynamic agent buttons
  - Card Creator
  - URL Analyzer (if assigned)
  - Text & Paste Processor (if assigned)
- **Sections**: PRD, Tech Stack, Technical Requirements, Task Lists, Testing & QA, Deployment, Documentation, Code Review
- **Groups**: Standard group management

#### Main Content Features
- **Card Display**: Uses IntelligenceCardGrid component (100% code reuse)
- **Preview Cards**: Development-specific theming (PRD: blue, TRD: green, Task List: purple)
- **Modal Overlay**: Same modal system with development-specific fields
- **Progress Indicators**: Task list progress bars, status indicators
- **Data Transformation**: Converts dev cards to Intelligence format

#### Special Features
- **TRUE Code Reuse**: All 280 lines of IntelligenceCardGrid code reused
- **Development Theming**: Category-specific colors and indicators
- **Progress Visualization**: Task completion bars and percentages
- **Owner Display**: Product manager and team assignment

#### Icons Used
Plus, Search, FileText, Database, Settings, Filter, Grid3X3, List, Trash2, Copy, Pin, Upload, Link2, Zap, ArrowUpDown, Sparkles, Edit2, FolderPlus, ChevronDown, User, EyeOff, Layers, MoreHorizontal, X, Users, Folder, Bot

### 4. Organisation Bank

#### Layout
- **Type**: Identical to Development Bank
- **Structure**: Standard two-column

#### Sidebar Components
- **Agents Section**: Dynamic agent buttons
  - Card Creator
  - Other agents as assigned
- **Sections**: Companies, Departments, Teams, People, Divisions, Business Units, Partners, Archived
- **Groups**: Standard group management

#### Main Content Features
- **Card Display**: Uses IntelligenceCardGrid component (100% code reuse)
- **Preview Cards**: Same preview system as other hubs
- **Modal Overlay**: Same modal system with organisation-specific fields
- **Section-Specific Blueprints**: Company, department, team, person blueprints

#### Special Features
- **Component Reuse**: Uses exact same components as other hubs
- **Section-Specific Blueprints**: Different blueprints for different sections
- **Consistent UX**: Same interaction patterns across all hubs
- **Data Transformation**: Maps organisation data to common format

#### Card Types
All sections use IntelligenceCardGrid with data transformation

### 5. Agent Hub

#### Layout
- **Type**: Full-screen modal (Template Bank style)
- **Structure**: Two-column (sidebar + main content)
- **Icon**: Bot icon in header navigation

#### Sidebar Components
- **Header**: "Agent Hub" + Close button
- **Agent Management**: Tools section
  - Import Agents
  - Export Configuration
  - Reset Registry
- **Categories**: Agent categories
  - Content Creation
  - Data Analysis
  - Research & Discovery
  - Automation
  - Integration
  - Utilities
  - Custom Agents
  - Archived
- **Groups**: Agent groups with colors

#### Main Content Features
- **Agent Cards**: Grid of available agents
- **Configuration Panel**: Agent assignment to hubs
- **Hub Assignment**: Checkboxes for Intelligence, Strategy, Development, Organisation
- **Agent Loader**: Dynamic component loading system
- **Registry Management**: Create, update, delete agents

#### Current Agents
- **Card Creator**: AI-powered card generation
- **URL Analyzer**: Web page analysis and intelligence extraction
- **Text & Paste Processor**: Text analysis and multi-card generation

#### Special Features
- **Dynamic Assignment**: Agents can be assigned to any hub
- **Component Loading**: Dynamic React.lazy loading
- **Registry System**: LocalStorage-based agent registry
- **Template Bank Architecture**: Follows established bank patterns

---

## Card Types & Patterns

### 1. Universal Card System (Current Architecture)

#### IntelligenceCardPreview (Preview Cards)
- **Layout**: Magazine-style preview cards
- **Features**: 
  - Instant loading (vs 12-28 second old cards)
  - Category-colored header dots
  - Truncated description (3 lines)
  - Visual metrics (progress bars for scores)
  - Tag chips display
  - Hover effects with elevation
- **Interaction**: First click expands, second click opens modal
- **Expandable Content**: Key findings, relevance scores, action hints
- **Animation**: Smooth 200ms expansion with delayed content entrance

#### IntelligenceCardModal (Detail View)
- **Layout**: 60% viewport width, centered
- **Structure**: Simple row-based layout (no collapsible sections)
- **Features**:
  - Edit/Save mode toggle
  - All field types (text, textarea, select, array, multitext)
  - Smooth open/close animations
  - ESC key support
- **Header**: Title + Edit/Save/Close buttons
- **Body**: Field rows (label + content)

#### IntelligenceCardGrid (Container)
- **Features**:
  - Manages card selection state
  - Handles search/filtering
  - Controls modal open/close
  - Supports view density (compact/comfortable/expanded)
  - Provides grid/list view modes
- **Used By**: ALL hubs (Intelligence, Strategy, Development, Organisation)

### 2. Data Transformation Pattern

#### Universal Interface
All hubs transform their data to common CardData format:
```typescript
interface CardData {
  id: string;
  title: string;
  description: string;
  cardType: string;
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
  created_at: string;
  updated_at: string;
  // Hub-specific fields mapped to common structure
}
```

#### Hub-Specific Transformations
- **Intelligence**: Maps `summary` to `description`, adds `intelligence_content`
- **Strategy**: Maps blueprint fields to common format
- **Development**: Maps `card_data` structure, adds progress indicators
- **Organisation**: Maps section-specific blueprints

### 3. Blueprint-Driven Field System

#### Blueprint Configuration
- **Location**: `/src/components/blueprints/configs/`
- **Structure**: Field definitions with types and validation
- **Registry**: Central registry at `/src/components/blueprints/registry.ts`
- **Naming**: camelCase IDs matching database columns

#### Field Types
- **Text**: Single line input
- **Textarea**: Multi-line input
- **Select**: Dropdown with options
- **Array**: Tag-based input
- **Multitext**: Multiple textarea fields
- **Date**: Date picker
- **Number**: Numeric input

#### Blueprint ID Prefixes
- **STR**: Strategic Context
- **VIS**: Vision
- **VAL**: Value Proposition
- **PER**: Personas
- **OKR**: OKRs
- **CJO**: Customer Journey
- **COM**: Competitive Analysis
- **SWO**: SWOT Analysis
- **BUS**: Business Model
- **GTM**: Go-to-Market
- **FIN**: Financial Projections
- **RSK**: Risk Assessment
- **ROA**: Roadmap
- **KPI**: KPIs
- **PRD**: Product Requirements
- **TRD**: Technical Requirements
- **TSK**: Task Lists

### 4. Category Themes and Visual Identity

#### Intelligence Categories
- **Market**: Green (bg-green-100, text-green-800, border-green-200)
- **Competitor**: Blue (bg-blue-100, text-blue-800, border-blue-200)
- **Trends**: Purple (bg-purple-100, text-purple-800, border-purple-200)
- **Technology**: Indigo (bg-indigo-100, text-indigo-800, border-indigo-200)
- **Stakeholder**: Yellow (bg-yellow-100, text-yellow-800, border-yellow-200)
- **Consumer**: Red (bg-red-100, text-red-800, border-red-200)
- **Risk**: Orange (bg-orange-100, text-orange-800, border-orange-200)
- **Opportunities**: Teal (bg-teal-100, text-teal-800, border-teal-200)

#### Development Categories
- **PRD**: Blue theme
- **TRD**: Green theme
- **Task List**: Purple theme

#### Visual Elements
- **Category Dots**: Colored circles indicating category
- **Progress Bars**: Visual representation of scores/progress
- **Hover States**: Elevation and color changes
- **Selection States**: Border and background changes

### 5. Legacy Card Components (Deprecated)

#### EnhancedMasterCard (Legacy)
- **Status**: Replaced by universal card system
- **Performance**: 12-28 second render times
- **Issues**: Complex nested components, poor performance
- **Migration**: Replaced with preview + modal pattern

#### Specialized Development Cards (Legacy)
- **PRDCard**: Replaced by universal system with PRD blueprint
- **TechnicalRequirementCard**: Replaced by universal system with TRD blueprint
- **TaskListCard**: Replaced by universal system with Task List blueprint

### 6. Smart Expandable Cards

#### Progressive Disclosure Pattern
1. **Scanning Phase**: Lightweight preview cards
2. **Decision Phase**: Expand to see key findings
3. **Action Phase**: Click through to full modal editor

#### Expansion Behavior
- **First Click**: Expands card to show key findings (+60px height)
- **Second Click**: Opens full modal editor
- **Animation**: 200ms expansion with delayed content entrance
- **Content**: Key findings, relevance score, action hints

#### Visual Indicators
- **Chevron Icons**: Down/up for expand/collapse
- **Hover States**: Preserved during expansion
- **Quick Actions**: Hidden when expanded to reduce clutter

---

## Design Patterns

### Consistent Patterns Across All Hubs

#### 1. Sidebar Pattern
- **Width**: 256px (w-64)
- **Background**: gray-50
- **Border**: Right border gray-200
- **Sections**: Collapsible with counts
- **Active State**: bg-black bg-opacity-50 with white text

#### 2. Search & Filter Bar
- **Layout**: Horizontal bar below header
- **Components**: Search input + Sort + View toggle + Filters
- **Consistent spacing**: gap-2 between elements

#### 3. Bulk Actions
- **Select All**: Checkbox in controls bar
- **Action Icons**: Grouped with tooltips
- **Selected Count**: Shows number of selected items
- **Disabled State**: When no items selected

#### 4. Group Management
- **Creation**: Inline form with color picker
- **Colors**: 6-color palette (Blue, Green, Purple, Red, Yellow, Gray)
- **Display**: Color dot + name + count
- **Actions**: Click to filter, edit, delete

#### 5. Modal Patterns
- **Backdrop**: Black with opacity
- **Container**: White rounded-lg shadow-xl
- **Header**: Title + close button
- **Content**: Scrollable with padding
- **Footer**: Action buttons right-aligned

#### 6. Interactive States
- **Hover**: bg-black bg-opacity-10 or specific hover colors
- **Active**: bg-black bg-opacity-50 with white text
- **Focus**: ring-2 ring-gray-900 ring-offset-2
- **Disabled**: opacity-50 cursor-not-allowed

#### 7. Typography Hierarchy
- **Section Headers**: text-[10px] uppercase tracking-wider
- **Card Titles**: text-sm font-medium
- **Body Text**: text-xs text-gray-600
- **Metadata**: text-[11px] text-gray-500

#### 8. Grid Systems
- **Card Grid**: grid gap-4 with responsive columns
- **Auto Grid**: repeat(auto-fit, minmax(300px, 1fr))
- **List View**: Stack with dividers

---

## Visual Assets Reference

### Complete Icon Inventory

#### Navigation & UI Control
- **ChevronDown/Up**: Dropdowns, accordions
- **X**: Close buttons
- **Menu**: Mobile menu, options
- **ArrowLeft**: Back navigation
- **MoreHorizontal**: Action menus
- **Settings**: Configuration

#### Actions
- **Plus**: Add new items
- **Edit/Edit2**: Edit mode
- **Trash2**: Delete
- **Copy**: Duplicate
- **Save/Bookmark**: Save items
- **Archive**: Archive items
- **Pin**: Pin/favorite
- **ExternalLink**: External links
- **Upload**: Upload files
- **Link/Link2**: Add links
- **Download**: Export/download

#### Views & Filters
- **Grid3X3**: Grid view
- **List**: List view
- **Search**: Search functionality
- **Filter**: Filter options
- **ArrowUpDown**: Sort
- **Eye/EyeOff**: Show/hide

#### Hub Icons
- **Brain**: Intelligence
- **BarChart3**: Strategy
- **Layers**: Development
- **Building2**: Organisation
- **Bot**: Agent Hub
- **Database**: Data/Tech Stack
- **FileText**: Documents/PRD

#### Status & Indicators
- **CheckCircle**: Success
- **AlertTriangle/AlertCircle**: Warning/Error
- **TrendingUp**: Growth/Trends
- **Target**: Goals/Objectives
- **Shield**: Security/Risk
- **Lightbulb**: Ideas/Opportunities
- **Zap**: Automation/Quick actions
- **Sparkles**: AI/Magic features

#### Categories (Intelligence)
- **TrendingUp**: Trends
- **Eye**: Market
- **BarChart3**: Analytics
- **Cpu**: Technology
- **Crown**: Stakeholder
- **Target**: Consumer
- **AlertTriangle**: Risk
- **Lightbulb**: Opportunities

#### Organisation
- **Users**: Teams
- **User**: People
- **Building2**: Companies/Departments
- **Folder/FolderPlus**: Groups

#### Time & Calendar
- **Calendar**: Date/scheduling
- **Clock**: Time tracking

### Component Usage by Hub

#### Intelligence Bank
- **Primary**: Search, Filter, Grid/List toggle
- **Categories**: All category icons (TrendingUp, Eye, BarChart3, etc.)
- **Actions**: Save, Archive, Delete, Edit
- **Agents**: Bot icon + dynamic agent buttons
- **Cards**: IntelligenceCardPreview with expandable content
- **Modal**: IntelligenceCardModal with edit/save functionality

#### Strategy Bank
- **Primary**: Sparkles (AI), drag handles
- **Actions**: FolderPlus for groups
- **Agents**: Bot icon + assigned agents
- **Cards**: IntelligenceCardPreview (100% code reuse)
- **Modal**: IntelligenceCardModal (100% code reuse)
- **Data**: Transformation layer to common format

#### Development Bank
- **Primary**: FileText, Database, Settings
- **Actions**: Full action set
- **Views**: Grid/List, Filter
- **Agents**: Bot icon + assigned agents
- **Cards**: IntelligenceCardPreview with dev theming
- **Modal**: IntelligenceCardModal with dev fields
- **Special**: Progress bars, status indicators

#### Organisation Bank
- **Primary**: Users, User, Building2
- **Actions**: Standard action set
- **Groups**: Folder icons
- **Agents**: Bot icon + assigned agents
- **Cards**: IntelligenceCardPreview (100% code reuse)
- **Modal**: IntelligenceCardModal (100% code reuse)
- **Blueprints**: Section-specific configurations

#### Agent Hub
- **Primary**: Bot icon in header
- **Layout**: Template Bank architecture
- **Cards**: Agent cards with assignment checkboxes
- **Features**: Dynamic loading, registry management
- **Assignment**: Hub checkboxes for dynamic assignment

---

## Implementation Notes

### CSS Architecture
- **Framework**: Tailwind CSS utility classes
- **Custom Components**: Defined in globals.css
- **Component Styles**: Component-specific styles in component files
- **Patterns**: Consistent use of @apply for complex patterns
- **Animations**: CSS-in-JS for complex animations in card components

### Responsive Design
- **Approach**: Mobile-first design
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Sidebar**: Collapses on mobile
- **Grid**: Columns adjust based on screen size
- **Cards**: Responsive layout with auto-fit columns

### Performance Considerations
- **Card Loading**: Instant preview card rendering (vs 12-28 second legacy)
- **Modal Loading**: Lazy loading for modals
- **Virtualization**: For long lists (when needed)
- **Debouncing**: Search inputs and auto-save
- **Optimistic Updates**: UI updates before server confirmation
- **Component Reuse**: Single IntelligenceCardGrid serves all hubs

### Universal Card System Benefits
- **Performance**: 100% shared code reduces bundle size
- **Consistency**: Identical UX across all hubs
- **Maintainability**: Single component to maintain
- **Scalability**: Easy to add new hubs or card types
- **Testing**: Single component to test thoroughly

### Data Transformation Architecture
- **Pattern**: Each hub transforms data to common CardData format
- **Benefits**: Enables component reuse while preserving data integrity
- **Implementation**: Transformation happens at component level
- **Flexibility**: Supports different database schemas per hub

### Agent System Architecture
- **Registry**: LocalStorage-based agent registry
- **Loading**: Dynamic React.lazy component loading
- **Assignment**: Agents can be assigned to any hub
- **Extension**: Easy to add new agents
- **Consistency**: Template Bank architecture pattern

### Accessibility
- **Focus Management**: Proper focus handling in modals
- **Keyboard Navigation**: Arrow keys, Enter, ESC support
- **ARIA Labels**: Screen reader support
- **Color Contrast**: WCAG AA compliance
- **Screen Reader**: Proper semantic markup

### Migration Strategy
- **Legacy Components**: Marked as deprecated but kept for reference
- **Performance**: New system provides instant loading
- **User Experience**: Progressive disclosure pattern
- **Code Quality**: Reduced complexity through component unification

### Future Considerations
- **Virtualization**: For datasets with 1000+ cards
- **Offline Support**: Enhanced offline capabilities
- **Real-time**: Multi-user collaboration features
- **Performance**: Bundle size optimization
- **Accessibility**: Enhanced keyboard navigation

---

## Change Log (v2.5.0 Updates)

### Major Architecture Changes
1. **Universal Card System**: All hubs now use IntelligenceCardGrid
2. **Agent System**: Dynamic agent assignment and loading
3. **Preview Cards**: Magazine-style instant-loading cards
4. **Modal System**: Unified modal overlay across all hubs
5. **Data Transformation**: Common interface for all card types

### Performance Improvements
- **Render Time**: From 12-28 seconds to instant loading
- **Code Reuse**: 100% component sharing across hubs
- **Bundle Size**: Reduced through component unification
- **Memory**: Optimized rendering and cleanup

### UX Enhancements
- **Progressive Disclosure**: Preview → expand → modal pattern
- **Smart Expansion**: Two-click interaction model
- **Smooth Animations**: 200ms transitions throughout
- **Consistent Patterns**: Identical UX across all hubs

### Technical Debt Reduction
- **Legacy Components**: Replaced with universal system
- **Code Duplication**: Eliminated through component reuse
- **Complexity**: Simplified through unified architecture
- **Maintainability**: Single component to maintain

---

This design system documentation provides a comprehensive reference for creating a Figma design system for Pinnlo. All measurements, colors, and patterns are based on the actual implementation in the codebase and reflect the current v2.5.0 architecture with universal card system and agent integration.