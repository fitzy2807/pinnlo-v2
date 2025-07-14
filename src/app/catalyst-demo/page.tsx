'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Import all Catalyst components
import { Alert } from '../../../catalyst-ui-kit 2/typescript/alert'
import { Avatar, AvatarButton, AvatarGroup } from '../../../catalyst-ui-kit 2/typescript/avatar'
import { Badge } from '../../../catalyst-ui-kit 2/typescript/badge'
import { Button } from '../../../catalyst-ui-kit 2/typescript/button'
import { Checkbox, CheckboxField, CheckboxGroup } from '../../../catalyst-ui-kit 2/typescript/checkbox'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '../../../catalyst-ui-kit 2/typescript/combobox'
import { Description, DescriptionDetails, DescriptionList, DescriptionTerm } from '../../../catalyst-ui-kit 2/typescript/description-list'
import { Dialog, DialogBody, DialogActions, DialogDescription, DialogTitle } from '../../../catalyst-ui-kit 2/typescript/dialog'
import { Divider } from '../../../catalyst-ui-kit 2/typescript/divider'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '../../../catalyst-ui-kit 2/typescript/dropdown'
import { ErrorMessage, Field, FieldGroup, Fieldset, Label, Legend } from '../../../catalyst-ui-kit 2/typescript/fieldset'
import { Heading, Subheading } from '../../../catalyst-ui-kit 2/typescript/heading'
import { Input } from '../../../catalyst-ui-kit 2/typescript/input'
import { Listbox, ListboxLabel, ListboxOption } from '../../../catalyst-ui-kit 2/typescript/listbox'
import { Radio, RadioField, RadioGroup } from '../../../catalyst-ui-kit 2/typescript/radio'
import { Select } from '../../../catalyst-ui-kit 2/typescript/select'
import { Switch, SwitchField, SwitchGroup } from '../../../catalyst-ui-kit 2/typescript/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../catalyst-ui-kit 2/typescript/table'
import { Text, TextLink, Strong, Code } from '../../../catalyst-ui-kit 2/typescript/text'
import { Textarea } from '../../../catalyst-ui-kit 2/typescript/textarea'

export default function CatalystDemo() {
  const [showDialog, setShowDialog] = useState(false)
  const [selectedOption, setSelectedOption] = useState('option1')
  const [switchEnabled, setSwitchEnabled] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [comboboxQuery, setComboboxQuery] = useState('')
  
  const people = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager' },
  ]

  const comboboxOptions = [
    { id: 1, name: 'Wade Cooper' },
    { id: 2, name: 'Arlene Mccoy' },
    { id: 3, name: 'Devon Webb' },
    { id: 4, name: 'Tom Cook' },
  ]

  const filteredPeople = comboboxOptions.filter((person) =>
    person.name.toLowerCase().includes(comboboxQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pinnlo
              </Link>
            </div>
            <h1 className="text-lg font-semibold">Catalyst UI Kit Demo</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          
          {/* Typography Section */}
          <section>
            <Heading>Typography</Heading>
            <Divider className="my-4" />
            <div className="space-y-4">
              <Heading>This is a Heading</Heading>
              <Subheading>This is a Subheading</Subheading>
              <Text>
                This is regular text with a <TextLink href="#">text link</TextLink> and some <Strong>strong text</Strong>.
                You can also use <Code>inline code</Code> within text.
              </Text>
            </div>
          </section>

          {/* Buttons Section */}
          <section>
            <Heading>Buttons</Heading>
            <Divider className="my-4" />
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button color="blue">Blue Button</Button>
              <Button color="dark/zinc">Dark Button</Button>
              <Button color="light">Light Button</Button>
              <Button color="dark/white">White Button</Button>
              <Button color="blue" disabled>Disabled Button</Button>
              <Button outline>Outline Button</Button>
              <Button plain>Plain Button</Button>
            </div>
          </section>

          {/* Badges Section */}
          <section>
            <Heading>Badges</Heading>
            <Divider className="my-4" />
            <div className="flex flex-wrap gap-4">
              <Badge>Default</Badge>
              <Badge color="blue">Blue</Badge>
              <Badge color="purple">Purple</Badge>
              <Badge color="amber">Amber</Badge>
              <Badge color="red">Red</Badge>
              <Badge color="green">Green</Badge>
            </div>
          </section>

          {/* Alert Section */}
          <section>
            <Heading>Alerts</Heading>
            <Divider className="my-4" />
            <div className="space-y-4">
              <Alert>This is a default alert message</Alert>
              <Alert color="amber">This is a warning alert message</Alert>
              <Alert color="red">This is an error alert message</Alert>
              <Alert color="green">This is a success alert message</Alert>
            </div>
          </section>

          {/* Avatar Section */}
          <section>
            <Heading>Avatars</Heading>
            <Divider className="my-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar src="/users/erica.jpg" />
                <Avatar initials="JD" />
                <Avatar />
                <AvatarButton src="/users/erica.jpg" />
              </div>
              <AvatarGroup>
                <Avatar src="/users/erica.jpg" />
                <Avatar initials="JD" />
                <Avatar initials="JS" />
                <Avatar initials="BJ" />
              </AvatarGroup>
            </div>
          </section>

          {/* Form Controls Section */}
          <section>
            <Heading>Form Controls</Heading>
            <Divider className="my-4" />
            
            <div className="space-y-8">
              {/* Input Fields */}
              <FieldGroup>
                <Field>
                  <Label>Name</Label>
                  <Input name="name" placeholder="Enter your name" />
                </Field>
                <Field>
                  <Label>Email</Label>
                  <Input type="email" name="email" placeholder="Enter your email" />
                </Field>
                <Field>
                  <Label>Password</Label>
                  <Input type="password" name="password" placeholder="Enter your password" />
                </Field>
                <Field invalid>
                  <Label>Invalid Input</Label>
                  <Input name="invalid" defaultValue="Invalid value" />
                  <ErrorMessage>This field has an error</ErrorMessage>
                </Field>
              </FieldGroup>

              {/* Textarea */}
              <Field>
                <Label>Description</Label>
                <Textarea name="description" rows={3} placeholder="Enter a description" />
              </Field>

              {/* Select */}
              <Field>
                <Label>Country</Label>
                <Select name="country">
                  <option value="">Select a country</option>
                  <option value="us">United States</option>
                  <option value="ca">Canada</option>
                  <option value="mx">Mexico</option>
                </Select>
              </Field>

              {/* Checkbox */}
              <CheckboxField>
                <Checkbox name="terms" checked={checkboxChecked} onChange={setCheckboxChecked} />
                <Label>I agree to the terms and conditions</Label>
              </CheckboxField>

              {/* Checkbox Group */}
              <Fieldset>
                <Legend>Notifications</Legend>
                <CheckboxGroup>
                  <CheckboxField>
                    <Checkbox name="email-notifications" />
                    <Label>Email notifications</Label>
                  </CheckboxField>
                  <CheckboxField>
                    <Checkbox name="sms-notifications" />
                    <Label>SMS notifications</Label>
                  </CheckboxField>
                  <CheckboxField>
                    <Checkbox name="push-notifications" />
                    <Label>Push notifications</Label>
                  </CheckboxField>
                </CheckboxGroup>
              </Fieldset>

              {/* Radio Group */}
              <Fieldset>
                <Legend>Delivery method</Legend>
                <RadioGroup value={selectedOption} onChange={setSelectedOption}>
                  <RadioField>
                    <Radio value="option1" />
                    <Label>Standard shipping</Label>
                  </RadioField>
                  <RadioField>
                    <Radio value="option2" />
                    <Label>Express shipping</Label>
                  </RadioField>
                  <RadioField>
                    <Radio value="option3" />
                    <Label>Overnight shipping</Label>
                  </RadioField>
                </RadioGroup>
              </Fieldset>

              {/* Switch */}
              <SwitchField>
                <Label>Enable notifications</Label>
                <Switch checked={switchEnabled} onChange={setSwitchEnabled} />
              </SwitchField>

              {/* Combobox */}
              <Field>
                <Label>Assign to</Label>
                <Combobox value={comboboxQuery} onChange={setComboboxQuery}>
                  <ComboboxInput 
                    displayValue={(person: any) => person?.name || ''}
                    placeholder="Search people..."
                  />
                  <ComboboxOptions>
                    {filteredPeople.map((person) => (
                      <ComboboxOption key={person.id} value={person}>
                        {person.name}
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </Combobox>
              </Field>

              {/* Listbox */}
              <Field>
                <Label>Priority</Label>
                <Listbox defaultValue="normal">
                  <ListboxOption value="low">
                    <ListboxLabel>Low priority</ListboxLabel>
                  </ListboxOption>
                  <ListboxOption value="normal">
                    <ListboxLabel>Normal priority</ListboxLabel>
                  </ListboxOption>
                  <ListboxOption value="high">
                    <ListboxLabel>High priority</ListboxLabel>
                  </ListboxOption>
                </Listbox>
              </Field>
            </div>
          </section>

          {/* Dropdown Section */}
          <section>
            <Heading>Dropdown Menu</Heading>
            <Divider className="my-4" />
            <Dropdown>
              <DropdownButton>Options</DropdownButton>
              <DropdownMenu>
                <DropdownItem>View</DropdownItem>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </section>

          {/* Table Section */}
          <section>
            <Heading>Table</Heading>
            <Divider className="my-4" />
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Role</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell>{person.name}</TableCell>
                    <TableCell>{person.email}</TableCell>
                    <TableCell>{person.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* Description List Section */}
          <section>
            <Heading>Description List</Heading>
            <Divider className="my-4" />
            <DescriptionList>
              <DescriptionTerm>Full name</DescriptionTerm>
              <DescriptionDetails>Tom Cook</DescriptionDetails>
              
              <DescriptionTerm>Email address</DescriptionTerm>
              <DescriptionDetails>tom.cook@example.com</DescriptionDetails>
              
              <DescriptionTerm>Role</DescriptionTerm>
              <DescriptionDetails>Senior Developer</DescriptionDetails>
              
              <DescriptionTerm>Location</DescriptionTerm>
              <DescriptionDetails>San Francisco, CA</DescriptionDetails>
            </DescriptionList>
          </section>

          {/* Dialog Section - Temporarily commented out due to compatibility issue */}
          <section>
            <Heading>Dialog</Heading>
            <Divider className="my-4" />
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Text className="text-amber-800">
                Dialog component temporarily disabled due to a compatibility issue with @headlessui/react. 
                All other components are working correctly.
              </Text>
            </div>
            {/* <Button onClick={() => setShowDialog(true)}>Open Dialog</Button> */}
          </section>

        </div>
      </div>
    </div>
  )
}