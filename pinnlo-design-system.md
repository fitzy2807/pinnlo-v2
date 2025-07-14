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
- **Intelligence Tools**: Dropdown menu (black bg button)
  - Profile
  - Upload Data/Link
  - Text/Paste
  - Automation
- **Categories**: Vertical list with counts
  - Dashboard, Market, Competitor, Trends, Technology, Stakeholder, Consumer, Risk, Opportunities, Saved Cards, Archive, Groups

#### Main Content
- **Header Bar**: Category icon + name, action buttons, card count
- **Search Bar**: Search input + Sort dropdown + View toggle + Filters
- **Advanced Filters Panel**: Collapsible with date range, sliders, checkboxes
- **Card Grid/List**: IntelligenceCardList component

#### Icons Used
X, Search, Filter, Settings, TrendingUp, Eye, BarChart3, Cpu, Crown, Target, AlertTriangle, Lightbulb, Bookmark, Archive, TestTube, Plus, ChevronDown, Grid3X3, List, Trash2, ExternalLink, Upload, Link, Menu, Folder, FolderPlus, Zap

### 2. Strategy Bank

#### Layout
- **Type**: Embedded view (not modal)
- **Structure**: Two-column with transitions
- **Integration**: Part of strategy workspace

#### Sidebar Components
- **Back Button**: Returns to strategies list
- **Tools Section**:
  - Blueprint Manager
  - Card Creator (Sparkles icon)
- **Blueprints Section**: Draggable list with counts
- **Groups Section**: Create button + group list

#### Main Content
- Dynamic content based on selected tool:
  - Blueprint Manager
  - Card Creator
  - Strategy Bank content

#### Unique Features
- Drag & drop blueprint reordering
- Inline group creation
- Tool-based content switching

### 3. Development Bank

#### Layout
- **Type**: Full-height embedded view
- **Structure**: Two-column standard

#### Sidebar Components
- **Tools Section**:
  - Card Creator
  - PRD Writer
  - Tech Stack Diagnostic
  - TRD Writer
  - Tool 4, Tool 5
- **Sections**: PRD, Tech Stack, Technical Requirements, Task Lists, Testing & QA, Deployment, Documentation, Code Review
- **Groups**: Standard group management

#### Main Content Features
- **Context-Sensitive Controls**: Different buttons per section
- **Quick Add Form**: Slides down from controls bar
- **Specialized Cards**: PRDCard, TechnicalRequirementCard, TaskListCard
- **View Restrictions**: Some sections force list view

#### Icons Used
Plus, Search, FileText, Database, Settings, Filter, Grid3X3, List, Trash2, Copy, Pin, Upload, Link2, Zap, ArrowUpDown, Sparkles, Edit2, FolderPlus, ChevronDown, User, EyeOff, Layers, MoreHorizontal, X, Users, Folder

### 4. Organisation Bank

#### Layout
- **Type**: Identical to Development Bank
- **Structure**: Standard two-column

#### Sections
- Companies
- Departments
- Teams
- People
- Divisions
- Business Units
- Partners
- Archived

#### Card Types
All sections use standard MasterCard component

### 5. Agent Hub (New)

#### Layout
- **Type**: Modal (similar to Intelligence Bank)
- **Icon**: Bot icon in header navigation

---

## Card Types & Patterns

### 1. EnhancedMasterCard

#### Structure
- **Header**: Title, ID badge, action buttons
- **Body**: Dynamic fields based on blueprint configuration
- **Footer**: Save indicator, timestamps

#### Features
- AI-enhanced fields with suggestions
- Auto-save functionality
- Undo/redo support
- Keyboard shortcuts
- Collapsible sections
- Real-time validation

#### Blueprint ID Prefixes
- STR (Strategic Context)
- VIS (Vision)
- VAL (Value Proposition)
- PER (Personas)
- OKR (OKRs)
- CJO (Customer Journey)
- COM (Competitive Analysis)
- SWO (SWOT Analysis)
- BUS (Business Model)
- GTM (Go-to-Market)
- FIN (Financial Projections)
- RSK (Risk Assessment)
- ROA (Roadmap)
- KPI (KPIs)

### 2. IntelligenceCard

#### Layout
- Category-colored header badge
- Title and key info
- Expandable content section
- Metadata footer (date, source, scores)

#### Interactive Elements
- Expand/collapse content
- Action menu (Edit, Save, Archive, Delete)
- External link button
- Selection checkbox

#### Category-Specific Styling
Each category has unique color scheme (see Category Colors)

### 3. Specialized Development Cards

#### PRDCard
- Structured sections for requirements
- Priority indicators
- Status tracking

#### TechnicalRequirementCard
- Technical specifications
- Dependency tracking
- Implementation notes

#### TaskListCard
- Task items with checkboxes
- Progress indicators
- Due date tracking

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
- Primary: Search, Filter, Grid/List toggle
- Categories: All category icons
- Actions: Save, Archive, Delete, Edit
- Tools: Upload, Link, Menu, Zap

#### Strategy Bank
- Primary: Sparkles (AI), drag handles
- Actions: FolderPlus for groups
- Minimal icon usage

#### Development Bank
- Primary: FileText, Database, Settings
- Actions: Full action set
- Views: Grid/List, Filter
- Specialized: Layers, Pin

#### Organisation Bank
- Primary: Users, User, Building2
- Standard action set
- Groups: Folder icons

#### Agent Hub
- Primary: Bot icon
- (Full implementation pending)

---

## Implementation Notes

### CSS Architecture
- Uses Tailwind CSS utility classes
- Custom components defined in globals.css
- Component-specific styles in component files
- Consistent use of @apply for complex patterns

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar collapses on mobile
- Grid columns adjust based on screen size

### Performance Considerations
- Lazy loading for modals
- Virtualization for long lists
- Debounced search inputs
- Optimistic UI updates

### Accessibility
- Focus management
- Keyboard navigation
- ARIA labels
- Color contrast compliance
- Screen reader support

---

This design system documentation provides a comprehensive reference for creating a Figma design system for Pinnlo. All measurements, colors, and patterns are based on the actual implementation in the codebase.