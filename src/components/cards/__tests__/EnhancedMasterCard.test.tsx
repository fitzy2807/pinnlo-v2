import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedMasterCard } from '../EnhancedMasterCard'
import { CardData } from '@/types/card'
import { toast } from 'react-hot-toast'

// Mock dependencies
jest.mock('react-hot-toast')
jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({ user: { id: 'test-user' } })
}))

// Mock blueprint registry
jest.mock('@/components/blueprints/registry', () => ({
  getBlueprintConfig: () => ({
    id: 'vision',
    name: 'Vision Statement',
    fields: [
      {
        id: 'visionType',
        name: 'Vision Type',
        type: 'enum',
        required: true,
        options: ['Product', 'Company', 'Mission']
      },
      {
        id: 'timeHorizon',
        name: 'Time Horizon',
        type: 'text',
        required: true,
        placeholder: 'e.g., 5 years'
      }
    ]
  })
}))

// Sample card data
const mockCardData: CardData = {
  id: '123',
  workspaceId: 'workspace-1',
  strategyId: 'strategy-1',
  title: 'Test Vision Card',
  description: 'Test description',
  cardType: 'vision',
  priority: 'High',
  confidenceLevel: 'Medium',
  creator: 'Test User',
  lastModified: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  tags: ['test', 'vision'],
  relationships: [],
  visionType: 'Company',
  timeHorizon: '5 years'
}

describe('EnhancedMasterCard', () => {
  const mockOnUpdate = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnDuplicate = jest.fn()
  const mockOnAIEnhance = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock implementation
    mockOnUpdate.mockResolvedValue(undefined)
  })

  it('renders card with correct data', () => {
    render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    expect(screen.getByText('Test Vision Card')).toBeInTheDocument()
    expect(screen.getByText(/VIS-123/)).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('saves data in correct format for onUpdate', async () => {
    const { getByText } = render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Expand the card
    fireEvent.click(getByText('Test Vision Card'))

    // Enable edit mode
    const editButton = screen.getByTitle('Toggle edit mode')
    fireEvent.click(editButton)

    // Change title
    const titleInput = screen.getByDisplayValue('Test Vision Card')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'New Vision Title')

    // Wait for debounce
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        title: 'New Vision Title'
      })
    }, { timeout: 2000 })
  })

  it('handles offline mode correctly', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })

    render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Should show offline indicator
    expect(screen.getByText(/changes pending/)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const { getByText } = render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Expand and edit
    fireEvent.click(getByText('Test Vision Card'))
    fireEvent.click(screen.getByTitle('Toggle edit mode'))

    // Clear a required field
    const titleInput = screen.getByDisplayValue('Test Vision Card')
    await userEvent.clear(titleInput)
    fireEvent.blur(titleInput)

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  it('handles keyboard shortcuts', async () => {
    render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Test Cmd+S to save
    fireEvent.keyDown(window, { key: 's', metaKey: true })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Saved!')
    })
  })

  it('tracks performance metrics', () => {
    const consoleSpy = jest.spyOn(console, 'log')

    render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Should log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] EnhancedMasterCard initial mount:')
      )
    }

    consoleSpy.mockRestore()
  })

  it('handles card actions correctly', () => {
    render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Test AI Enhance
    fireEvent.click(screen.getByTitle('AI Enhance'))
    expect(mockOnAIEnhance).toHaveBeenCalled()

    // Test Duplicate
    fireEvent.click(screen.getByTitle('Duplicate'))
    expect(mockOnDuplicate).toHaveBeenCalled()

    // Test Delete
    fireEvent.click(screen.getByTitle('Delete'))
    expect(mockOnDelete).toHaveBeenCalled()
  })

  it('handles section collapse/expand', () => {
    const { getByText, queryByText } = render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Initially collapsed
    expect(queryByText('Blueprint Fields')).not.toBeInTheDocument()

    // Expand card
    fireEvent.click(getByText('Test Vision Card'))

    // Should show sections
    expect(getByText('Blueprint Fields')).toBeInTheDocument()
  })

  it('preserves data structure on save', async () => {
    render(
      <EnhancedMasterCard
        cardData={{
          ...mockCardData,
          card_data: {
            customField: 'customValue'
          }
        }}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Expand and edit
    fireEvent.click(screen.getByText('Test Vision Card'))
    fireEvent.click(screen.getByTitle('Toggle edit mode'))

    // Change description
    const descInput = screen.getByPlaceholderText('Describe this card...')
    await userEvent.type(descInput, ' Updated')

    // Wait for save
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        description: 'Test description Updated',
        card_data: expect.objectContaining({
          customField: 'customValue'
        })
      })
    }, { timeout: 2000 })
  })

  it('handles async validation', async () => {
    render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
        onDuplicate={mockOnDuplicate}
        onAIEnhance={mockOnAIEnhance}
      />
    )

    // Expand and edit
    fireEvent.click(screen.getByText('Test Vision Card'))
    fireEvent.click(screen.getByTitle('Toggle edit mode'))

    // Type a title with "duplicate"
    const titleInput = screen.getByDisplayValue('Test Vision Card')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Duplicate Title')

    // Should show async validation error
    await waitFor(() => {
      expect(screen.getByText('Title must be unique within this card type')).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})

// Integration test for data flow
describe('EnhancedMasterCard Integration', () => {
  it('integrates with all shared components correctly', async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined)

    const { getByText, getByPlaceholderText } = render(
      <EnhancedMasterCard
        cardData={mockCardData}
        onUpdate={onUpdate}
        onDelete={jest.fn()}
        onDuplicate={jest.fn()}
        onAIEnhance={jest.fn()}
      />
    )

    // Expand card
    fireEvent.click(getByText('Test Vision Card'))

    // Enable edit mode
    fireEvent.click(screen.getByTitle('Toggle edit mode'))

    // Update multiple fields
    const descInput = getByPlaceholderText('Describe this card...')
    await userEvent.type(descInput, ' - Updated')

    // Should show save indicator
    expect(screen.getByText(/Saving/)).toBeInTheDocument()

    // Wait for save
    await waitFor(() => {
      expect(screen.getByText(/Saved/)).toBeInTheDocument()
    })

    // Verify correct data structure
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('Updated')
      })
    )
  })
})