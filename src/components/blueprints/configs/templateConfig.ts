import { BlueprintConfig } from '../types'
import { Layout } from 'lucide-react'

export const templateConfig: BlueprintConfig = {
  id: 'template',
  name: 'Template',
  icon: '📋',
  lucideIcon: Layout,
  description: 'Template cards for testing the unified bank architecture',
  category: 'Template',
  prefix: 'TPL',
  color: 'bg-gray-100',
  fields: [
    {
      name: 'example_field',
      label: 'Example Field',
      type: 'text',
      required: false,
      placeholder: 'Enter example text',
      helpText: 'This is an example field for template cards'
    },
    {
      name: 'example_textarea',
      label: 'Example Text Area',
      type: 'textarea',
      required: false,
      placeholder: 'Enter detailed text here',
      helpText: 'This is an example textarea field'
    },
    {
      name: 'example_select',
      label: 'Example Select',
      type: 'select',
      required: false,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      helpText: 'This is an example select field'
    },
    {
      name: 'example_tags',
      label: 'Example Tags',
      type: 'tags',
      required: false,
      placeholder: 'Add tags',
      helpText: 'This is an example tags field'
    }
  ],
  defaultValues: {
    priority: 'medium',
    confidence: 'medium',
    tags: ['template', 'demo']
  }
}
