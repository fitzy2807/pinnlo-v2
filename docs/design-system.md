# PINNLO Design System
*Linear's Sleekness + Monday.com's Rounded Containers*

## 🧱 1. FOUNDATIONS

### Color Palette

#### Primary Colors
```css
--primary-50: #f0f9ff    /* Light blue backgrounds */
--primary-100: #e0f2fe   /* Subtle accents */
--primary-500: #0ea5e9   /* Primary actions */
--primary-600: #0284c7   /* Primary hover */
--primary-900: #0c4a6e   /* Dark text */
```

#### Secondary Colors
```css
--secondary-50: #fafafa   /* Light gray backgrounds */
--secondary-100: #f5f5f5  /* Card backgrounds */
--secondary-200: #e5e5e5  /* Borders */
--secondary-400: #a3a3a3  /* Secondary text */
--secondary-600: #525252  /* Primary text */
--secondary-900: #171717  /* Headings */
```

#### Global Navigation (Required Black)
```css
--nav-bg: #000000        /* Black background */
--nav-text: #ffffff      /* White text */
--nav-text-muted: #a3a3a3 /* Muted text */
--nav-accent: #0ea5e9    /* Blue accents */
```

#### Semantic Colors
```css
--success-50: #f0fdf4
--success-500: #22c55e
--warning-50: #fffbeb
--warning-500: #f59e0b
--error-50: #fef2f2
--error-500: #ef4444
```

#### Card-Specific Backgrounds
```css
--card-neutral: #ffffff
--card-highlight: #f8fafc
--card-hover: #f1f5f9
--card-selected: #dbeafe
```

### Typography

#### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

#### Font Sizes & Weights
```css
/* Headings */
--text-h1: 2rem;     font-weight: 700;  /* Page titles */
--text-h2: 1.5rem;   font-weight: 600;  /* Section headers */
--text-h3: 1.25rem;  font-weight: 600;  /* Card titles */
--text-h4: 1.125rem; font-weight: 500;  /* Subsections */

/* Body Text */
--text-lg: 1.125rem; font-weight: 400;  /* Large body */
--text-base: 1rem;   font-weight: 400;  /* Default body */
--text-sm: 0.875rem; font-weight: 400;  /* Small body */
--text-xs: 0.75rem;  font-weight: 400;  /* Captions */

/* Specific Use Cases */
--card-title: var(--text-h3);           /* Card headers */
--card-meta: var(--text-xs);            /* Card metadata */
--card-summary: var(--text-sm);         /* Card descriptions */
```

### Spacing & Sizing

#### Spacing Tokens
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

#### Card-Specific Spacing
```css
--card-padding-sm: var(--space-3);      /* Compact cards */
--card-padding-md: var(--space-4);      /* Regular cards */
--card-padding-lg: var(--space-6);      /* Large cards */
--card-gap: var(--space-4);             /* Between cards */
--card-inner-gap: var(--space-3);       /* Card content spacing */
```

### Grid & Layout

#### Grid System
```css
--container-max: 1280px;               /* Max content width */
--sidebar-width: 256px;                /* Navigation sidebar */
--panel-width: 320px;                  /* Right panel */
--header-height: 64px;                 /* Global nav height */
```

#### Card Grid Layouts
```css
/* Responsive card grids */
.card-grid-1 { grid-template-columns: 1fr; }
.card-grid-2 { grid-template-columns: repeat(2, 1fr); }
.card-grid-3 { grid-template-columns: repeat(3, 1fr); }
.card-grid-auto { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }

/* Grid gaps */
--grid-gap-sm: var(--space-3);
--grid-gap-md: var(--space-4);
--grid-gap-lg: var(--space-6);
```

### Elevation & Shadows

#### Shadow Tokens
```css
--shadow-none: none;
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

#### Card Elevation System
```css
--card-elevation-default: var(--shadow-sm);
--card-elevation-hover: var(--shadow-md);
--card-elevation-active: var(--shadow-lg);
--card-elevation-modal: var(--shadow-xl);
```

### Borders & Radius

#### Border Radius (Monday.com Style)
```css
--radius-none: 0;
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Cards, buttons */
--radius-lg: 0.75rem;    /* 12px - Large cards */
--radius-xl: 1rem;       /* 16px - Containers */
--radius-full: 9999px;   /* Circular */
```

#### Border Widths
```css
--border-thin: 1px;
--border-thick: 2px;
```

### Iconography

#### Icon Sizes
```css
--icon-xs: 12px;    /* Inline icons */
--icon-sm: 16px;    /* Card meta icons */
--icon-md: 20px;    /* Button icons */
--icon-lg: 24px;    /* Header icons */
--icon-xl: 32px;    /* Feature icons */
```

## 🧩 2. COMPONENTS

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--primary-500);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: var(--secondary-600);
  border: var(--border-thin) solid var(--secondary-200);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}

.btn-secondary:hover {
  background: var(--secondary-50);
  border-color: var(--secondary-300);
}
```

#### Button Sizes
```css
.btn-sm { padding: var(--space-1) var(--space-3); font-size: var(--text-sm); }
.btn-md { padding: var(--space-2) var(--space-4); font-size: var(--text-base); }
.btn-lg { padding: var(--space-3) var(--space-6); font-size: var(--text-lg); }
```

### Inputs & Forms

#### Text Input
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: var(--border-thin) solid var(--secondary-200);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgb(14 165 233 / 0.1);
}
```

#### Form Layout
```css
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--secondary-900);
  margin-bottom: var(--space-2);
}
```

### Badges & Tags

#### Status Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.badge-success {
  background: var(--success-50);
  color: var(--success-500);
}

.badge-warning {
  background: var(--warning-50);
  color: var(--warning-500);
}
```

## 📦 3. CARD COMPONENTS

### Card Anatomy

#### Base Card Structure
```css
.card {
  background: var(--card-neutral);
  border: var(--border-thin) solid var(--secondary-200);
  border-radius: var(--radius-lg);        /* Monday.com rounded style */
  padding: var(--card-padding-md);
  transition: all 0.2s ease;
  box-shadow: var(--card-elevation-default);
}

.card:hover {
  border-color: var(--secondary-300);
  box-shadow: var(--card-elevation-hover);
  transform: translateY(-2px);            /* Subtle lift effect */
}
```

#### Card Zones
```css
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--card-inner-gap);
}

.card-meta {
  font-size: var(--card-meta);
  color: var(--secondary-400);
  margin-bottom: var(--space-2);
}

.card-content {
  margin-bottom: var(--card-inner-gap);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--card-inner-gap);
  border-top: var(--border-thin) solid var(--secondary-200);
}
```

### Card Types

#### Info Card
```css
.card-info {
  /* Base card styles */
}

.card-info .card-title {
  font-size: var(--card-title);
  font-weight: 600;
  color: var(--secondary-900);
  margin-bottom: var(--space-2);
}

.card-info .card-description {
  font-size: var(--card-summary);
  color: var(--secondary-600);
  line-height: 1.5;
}
```

#### Action Card
```css
.card-action {
  cursor: pointer;
  position: relative;
}

.card-action::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--primary-500);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.card-action:hover::after {
  opacity: 0.02;
}
```

#### Input Card
```css
.card-input {
  border-color: var(--primary-200);
  background: var(--primary-50);
}

.card-input .input {
  background: white;
  border: none;
  box-shadow: var(--shadow-sm);
}
```

### Card States

#### Default State
```css
.card-default {
  /* Base card styles already defined */
}
```

#### Selected State
```css
.card-selected {
  border-color: var(--primary-500);
  background: var(--card-selected);
  box-shadow: 0 0 0 3px rgb(14 165 233 / 0.1);
}
```

#### Loading State
```css
.card-loading {
  position: relative;
  overflow: hidden;
}

.card-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

#### Empty State
```css
.card-empty {
  border: 2px dashed var(--secondary-200);
  background: var(--secondary-50);
  text-align: center;
  padding: var(--space-8);
}

.card-empty-icon {
  font-size: var(--icon-xl);
  color: var(--secondary-400);
  margin-bottom: var(--space-3);
}
```

### Card Variants

#### Size Variants
```css
.card-compact {
  padding: var(--card-padding-sm);
  border-radius: var(--radius-md);
}

.card-regular {
  padding: var(--card-padding-md);
  border-radius: var(--radius-lg);
}

.card-large {
  padding: var(--card-padding-lg);
  border-radius: var(--radius-xl);
}
```

#### Visual Emphasis
```css
.card-highlighted {
  background: var(--card-highlight);
  border-color: var(--primary-200);
}

.card-warning {
  background: var(--warning-50);
  border-color: var(--warning-200);
}

.card-success {
  background: var(--success-50);
  border-color: var(--success-200);
}
```

## 🧠 4. PATTERNS

### Card Collections

#### Grid Layout
```css
.card-grid {
  display: grid;
  gap: var(--grid-gap-md);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Responsive breakpoints */
@media (min-width: 768px) {
  .card-grid-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .card-grid-3 { grid-template-columns: repeat(3, 1fr); }
}
```

#### List Layout
```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card-list .card {
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
```

### Card Creation Pattern

#### Add New Card
```css
.card-add {
  border: 2px dashed var(--secondary-300);
  background: var(--secondary-50);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-add:hover {
  border-color: var(--primary-400);
  background: var(--primary-50);
}
```

### Card Relationships

#### Linked Cards
```css
.card-linked {
  position: relative;
}

.card-linked::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--primary-500);
  border-radius: var(--radius-sm);
}
```

## ⚙️ 5. USAGE GUIDELINES

### When to Use Cards
- ✅ **Use cards for:** Discrete content pieces, actionable items, related information groups
- ❌ **Don't use cards for:** Long form content, simple lists, navigation elements

### Card Content Guidelines
- **Title:** 1-3 words maximum
- **Description:** 1-2 sentences maximum
- **Actions:** 1-3 primary actions per card

### Responsive Guidelines
```css
/* Mobile: Single column */
@media (max-width: 767px) {
  .card-grid { grid-template-columns: 1fr; }
  .card { padding: var(--card-padding-sm); }
}

/* Tablet: Two columns */
@media (min-width: 768px) and (max-width: 1023px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: Three+ columns */
@media (min-width: 1024px) {
  .card-grid { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
}
```

### Accessibility
```css
.card {
  /* Focus states */
  &:focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }
  
  /* Keyboard navigation */
  &[tabindex] {
    cursor: pointer;
  }
}
```

## 🎨 6. IMPLEMENTATION TOKENS

### CSS Custom Properties
```css
:root {
  /* Primary Colors */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-900: #0c4a6e;

  /* Secondary Colors */
  --secondary-50: #fafafa;
  --secondary-100: #f5f5f5;
  --secondary-200: #e5e5e5;
  --secondary-400: #a3a3a3;
  --secondary-600: #525252;
  --secondary-900: #171717;

  /* Global Navigation */
  --nav-bg: #000000;
  --nav-text: #ffffff;
  --nav-text-muted: #a3a3a3;
  --nav-accent: #0ea5e9;

  /* Semantic Colors */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --error-50: #fef2f2;
  --error-500: #ef4444;

  /* Card Backgrounds */
  --card-neutral: #ffffff;
  --card-highlight: #f8fafc;
  --card-hover: #f1f5f9;
  --card-selected: #dbeafe;

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Card Spacing */
  --card-padding-sm: var(--space-3);
  --card-padding-md: var(--space-4);
  --card-padding-lg: var(--space-6);
  --card-gap: var(--space-4);
  --card-inner-gap: var(--space-3);

  /* Layout */
  --container-max: 1280px;
  --sidebar-width: 256px;
  --panel-width: 320px;
  --header-height: 64px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Card Elevation */
  --card-elevation-default: var(--shadow-sm);
  --card-elevation-hover: var(--shadow-md);
  --card-elevation-active: var(--shadow-lg);
  --card-elevation-modal: var(--shadow-xl);

  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Borders */
  --border-thin: 1px;
  --border-thick: 2px;

  /* Icons */
  --icon-xs: 12px;
  --icon-sm: 16px;
  --icon-md: 20px;
  --icon-lg: 24px;
  --icon-xl: 32px;

  /* Dark mode overrides */
  @media (prefers-color-scheme: dark) {
    --card-neutral: #1f2937;
    --secondary-100: #374151;
    --secondary-600: #d1d5db;
    --secondary-900: #f9fafb;
  }
}
```

---

This design system provides **Linear's clean sophistication** with **Monday.com's friendly rounded containers**, while maintaining your required **black global navigation**. The system is modular, scalable, and provides clear guidelines for consistent implementation across PINNLO! 🚀