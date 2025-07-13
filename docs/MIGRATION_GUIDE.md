# MasterCard Migration Guide

This guide helps developers migrate custom cards to use the new shared component system and understand the improvements made during the refactoring.

## Overview

The refactoring provides shared components that replace custom implementations:
- 🚫 Custom AIEnhancedField → ✅ Shared AIEnhancedField
- 🚫 Manual save logic → ✅ useAutoSave hook
- 🚫 Custom validation → ✅ useValidation hook
- 🚫 Manual keyboard handling → ✅ useKeyboardShortcuts hook

## Important Bug Fixes in Enhanced MasterCard

### Memory Leak Prevention

The shared components include critical fixes for memory leaks that were discovered during Phase A testing:

```typescript
// ❌ DON'T: This causes memory leaks
useEffect(() => {
  const resizeObserver = new ResizeObserver(callback)
  resizeObserver.observe(element)
  // Missing cleanup! Observer continues running after unmount
})

// ❌ DON'T: Event listeners without cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize)
  // Missing removeEventListener!
})

// ✅ DO: Always cleanup observers and listeners
useEffect(() => {
  const resizeObserver = new ResizeObserver(callback)
  
  // Handle browsers that don't support ResizeObserver
  if (!window.ResizeObserver) {
    console.warn('ResizeObserver not supported')
    return
  }
  
  try {
    resizeObserver.observe(element)
  } catch (error) {
    console.error('ResizeObserver error:', error)
  }
  
  // Cleanup function
  return () => {
    resizeObserver.disconnect()
    // Also cancel any pending animation frames
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}, [])
```

### Race Condition Prevention

The useAutoSave hook prevents race conditions that can occur with async operations:

```typescript
// ❌ DON'T: Updates state without checking if component is mounted
const save = async (data) => {
  const result = await api.save(data)
  setState(result) // Dangerous if component unmounted during save!
}

// ❌ DON'T: Multiple saves can race each other
const handleSave = async () => {
  // User clicks save multiple times rapidly
  await saveData(formData) // Which save wins?
}

// ✅ DO: The useAutoSave hook handles all race conditions
const { save, updateField } = useAutoSave(data, onSave)
// Features built-in:
// - AbortController cancels in-flight requests
// - isMountedRef prevents updates to unmounted components
// - Request deduplication prevents concurrent saves
// - Proper version tracking prevents overwrites
```

### Validation Edge Cases

The validation system correctly handles all data types and edge cases:

```typescript
// Edge cases that are now handled correctly:

// 1. Required field validation
// ❌ OLD BUG: 0 and false were treated as empty
if (!value) return 'Required' // Bug: rejects 0 and false!

// ✅ FIXED: Properly checks for actual empty values
if (value === '' || value === null || value === undefined) return 'Required'

// 2. Exception handling
// ❌ OLD BUG: Validator exceptions crashed the app
const emailValidator = (value) => {
  if (!value.includes('@')) throw new Error('Invalid') // Uncaught!
}

// ✅ FIXED: All validators wrapped in try-catch
try {
  return validator(value, allValues)
} catch (error) {
  return error.message || 'Validation error'
}

// 3. Async validation
// ❌ OLD BUG: Async validators didn't update error state
const validateAsync = async (value) => {
  const isUnique = await checkUniqueness(value)
  return isUnique ? null : 'Must be unique' // Error state not set!
}

// ✅ FIXED: Proper async validation with state updates
const error = await validator(value, data)
setErrors(prev => ({ ...prev, [field]: error }))
```

### Common Pitfalls to Avoid

1. **Never create your own ResizeObserver without cleanup**
   - Always use the cleanup pattern shown above
   - Consider browser compatibility

2. **Always use the shared hooks instead of custom save logic**
   - useAutoSave handles all edge cases
   - Don't implement your own debouncing

3. **Trust the validation system**
   - It properly handles 0, false, null, undefined
   - Exception handling is built-in
   - Async validation is supported

4. **Don't set state after async operations without checks**
   - Always verify component is still mounted
   - Use AbortController for cancellable operations

## Step-by-Step Migration

### 1. Update Imports

Replace your custom implementations with shared components:

```typescript
// Before
import { AIEnhancedField } from './components/AIEnhancedField'
import { saveCard } from './utils/saveCard'

// After
import { 
  AIEnhancedField,
  useAutoSave,
  useValidation,
  CardContainer,
  CardHeader,
  CollapsibleSection,
  validators
} from '@/components/shared/cards'
```

### 2. Update Data Structure

Follow the standard pattern for data updates:

```typescript
// Before
const handleSave = async () => {
  setSaving(true)
  try {
    await updateCard(cardId, formData)
  } finally {
    setSaving(false)
  }
}

// After
const { save, saving, updateField } = useAutoSave(
  initialData,
  async (updates) => {
    const { title, description, ...cardDataFields } = updates
    return await onUpdate({
      title,
      description,
      card_data: cardDataFields
    })
  }
)
```

### 3. Replace UI Components

Use the shared UI components for consistency:

```typescript
// Before
<div className="card-container">
  <div className="card-header">
    <h2>{card.title}</h2>
    <button onClick={handleEdit}>Edit</button>
    <button onClick={handleSave}>Save</button>
  </div>
  <div className="card-section">
    {/* content */}
  </div>
</div>

// After
<CardContainer>
  <CardHeader
    title={data.title}
    isEditMode={isEditMode}
    onToggleEdit={() => setIsEditMode(!isEditMode)}
    actions={cardActions}
    saveIndicator={<SaveIndicator saving={saving} />}
  />
  <CollapsibleSection
    title="Section Name"
    colorScheme="blue"
    defaultExpanded={true}
  >
    <AIEnhancedField
      label="Field Name"
      value={data.fieldName}
      onChange={(value) => updateField('fieldName', value)}
      isEditMode={isEditMode}
      error={errors.fieldName}
    />
  </CollapsibleSection>
</CardContainer>
```

### 4. Add Validation

Use the validation hook for form validation:

```typescript
// Define validation rules
const validationRules = {
  title: [validators.required('Title is required')],
  priority: [validators.required('Priority is required')],
  email: [validators.email('Invalid email format')],
  prd_id: [
    validators.required('PRD ID is required'),
    validators.pattern(/^PRD-\d{4}-\d{3}$/, 'Format: PRD-YYYY-XXX')
  ]
}

// Use the validation hook
const { errors, validateField, validateAll } = useValidation(
  data,
  validationRules
)

// Pass errors to fields
<AIEnhancedField
  label="Title"
  value={data.title}
  onChange={(value) => updateField('title', value)}
  error={errors.title}
  required={true}
/>
```

### 5. Add Keyboard Shortcuts

```typescript
// Keyboard shortcuts are automatic with the shared components
useKeyboardShortcuts({
  'cmd+s': () => save(),
  'cmd+e': () => setIsEditMode(!isEditMode),
  'cmd+z': () => undo(),
  'cmd+shift+z': () => redo()
})
```

## Testing Your Migration

### Validation Checklist

- [ ] Auto-save works (1 second delay after typing)
- [ ] Validation shows errors correctly
- [ ] Required fields accept 0 and false as valid values
- [ ] Keyboard shortcuts work (Cmd+S, Cmd+E, Cmd+Z)
- [ ] Sections collapse/expand properly
- [ ] Memory usage is stable (no leaks)
- [ ] Rapid edits don't cause race conditions
- [ ] Offline queue works when disconnected
- [ ] No console errors

### Memory Leak Testing

```typescript
// Test for memory leaks
1. Open browser DevTools > Memory tab
2. Take heap snapshot
3. Rapidly expand/collapse sections 20 times
4. Take another heap snapshot
5. Compare snapshots - memory should be stable
```

### Race Condition Testing

```typescript
// Test for race conditions
1. Make rapid edits to multiple fields
2. Click save repeatedly (Cmd+S multiple times)
3. Toggle edit mode while saving
4. All changes should be preserved correctly
```

## Example: Complete Migration

Here's a full example of migrating a custom card:

### Before (Legacy Implementation)

```typescript
export function CustomCard({ card, onUpdate }) {
  const [data, setData] = useState(card)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  
  const validate = () => {
    const newErrors = {}
    if (!data.title) newErrors.title = 'Required'
    if (!data.priority) newErrors.priority = 'Required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSave = async () => {
    if (!validate()) return
    
    setSaving(true)
    try {
      await onUpdate(card.id, data)
      setIsEditMode(false)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }
  
  const handleFieldChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }
  
  return (
    <div className="card">
      <div className="card-header">
        <h2>{data.title}</h2>
        {isEditMode ? (
          <>
            <button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setIsEditMode(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEditMode(true)}>Edit</button>
        )}
      </div>
      
      <div className="card-body">
        <div className="form-field">
          <label>Title *</label>
          <input
            value={data.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            disabled={!isEditMode}
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>
        
        <div className="form-field">
          <label>Priority *</label>
          <select
            value={data.priority}
            onChange={(e) => handleFieldChange('priority', e.target.value)}
            disabled={!isEditMode}
          >
            <option value="">Select...</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          {errors.priority && <span className="error">{errors.priority}</span>}
        </div>
      </div>
    </div>
  )
}
```

### After (Using Shared Components)

```typescript
export function CustomCard({ card, onUpdate }) {
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Initialize data with proper structure
  const initialData = {
    title: card.title,
    description: card.description,
    priority: card.card_data?.priority || 'Medium',
    // ... other fields from card_data
  }
  
  // Use auto-save hook
  const { data, updateField, saving } = useAutoSave(
    initialData,
    async (updates) => {
      const { title, description, ...cardData } = updates
      return await onUpdate({
        title,
        description,
        card_data: cardData
      })
    }
  )
  
  // Use validation hook
  const validationRules = {
    title: [validators.required('Title is required')],
    priority: [validators.required('Priority is required')]
  }
  
  const { errors } = useValidation(data, validationRules)
  
  // Use keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+e': () => setIsEditMode(!isEditMode),
    'cmd+s': () => save()
  })
  
  return (
    <CardContainer>
      <CardHeader
        title={data.title}
        isEditMode={isEditMode}
        onToggleEdit={() => setIsEditMode(!isEditMode)}
        saveIndicator={<SaveIndicator saving={saving} />}
      />
      
      <CollapsibleSection
        title="Basic Information"
        colorScheme="blue"
        defaultExpanded={true}
      >
        <AIEnhancedField
          label="Title"
          value={data.title}
          onChange={(value) => updateField('title', value)}
          isEditMode={isEditMode}
          error={errors.title}
          required={true}
        />
        
        <AIEnhancedField
          label="Priority"
          value={data.priority}
          onChange={(value) => updateField('priority', value)}
          isEditMode={isEditMode}
          error={errors.priority}
          required={true}
          fieldType="select"
          selectOptions={[
            { value: 'High', label: 'High' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Low', label: 'Low' }
          ]}
        />
      </CollapsibleSection>
    </CardContainer>
  )
}
```

## Benefits of Migration

1. **Automatic Features**: Auto-save, undo/redo, offline support
2. **Better UX**: No modals, inline editing, real-time feedback
3. **Less Code**: ~40% reduction in component code
4. **More Reliable**: No memory leaks or race conditions
5. **Consistent UI**: All cards look and behave the same
6. **Better Performance**: Optimized rendering and saves

## Troubleshooting

### Issue: Save not triggering
**Solution**: Ensure you're using `updateField` from useAutoSave, not setState directly

### Issue: Validation not showing
**Solution**: Pass the error prop to AIEnhancedField and ensure validation rules are defined

### Issue: Memory usage increasing
**Solution**: Check that all effects have cleanup functions, especially for observers and listeners

### Issue: Changes lost on rapid edits
**Solution**: Make sure you're not creating multiple instances of the save function

### Issue: Offline sync not working
**Solution**: Enable offline mode in feature flags: `{ ENABLE_OFFLINE_MODE: true }`

## Need Help?

- Check the example implementations in PRDCard, TaskListCard, and TechnicalRequirementCard
- Test your card at `/test-mastercard`
- Review the test files for memory leak and race condition examples
- Ask in #dev-help Slack channel

## Version History

- **v1.0**: Initial shared components
- **v1.1**: Fixed memory leaks in CollapsibleSection
- **v1.2**: Fixed race conditions in useAutoSave
- **v1.3**: Fixed validation edge cases (0, false, exceptions)
- **v1.4**: Added comprehensive error handling