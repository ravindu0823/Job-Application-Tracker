import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

describe('Select Components', () => {
  describe('Select with Trigger and Value', () => {
    it('renders correctly', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      )
      
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('renders trigger with custom size - default', () => {
      render(
        <Select>
          <SelectTrigger size="default">
            <SelectValue placeholder="Default size" />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('data-size', 'default')
    })

    it('renders trigger with custom size - sm', () => {
      render(
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Small size" />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('data-size', 'sm')
    })

    it('renders with custom className on trigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue placeholder="Custom" />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('trigger is disabled when disabled prop is passed', () => {
      render(
        <Select>
          <SelectTrigger disabled>
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    it('has correct data-slot attributes', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Test" />
          </SelectTrigger>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('data-slot', 'select-trigger')
    })
  })

  describe('Select with controlled value', () => {
    it('displays the selected value', () => {
      render(
        <Select value="option2">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(
        <Select defaultValue="opt1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opt1">Option One</SelectItem>
            <SelectItem value="opt2">Option Two</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByText('Option One')).toBeInTheDocument()
    })
  })
})
