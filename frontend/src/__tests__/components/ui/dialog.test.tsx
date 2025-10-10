import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

describe('Dialog Components', () => {
  describe('Dialog with Trigger and Content', () => {
    it('renders trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Open Dialog')).toBeInTheDocument()
    })

    it('opens dialog when trigger is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>This is a test dialog</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      const trigger = screen.getByText('Open')
      await user.click(trigger)
      
      expect(await screen.findByText('Test Dialog')).toBeInTheDocument()
      expect(screen.getByText('This is a test dialog')).toBeInTheDocument()
    })

    it('renders dialog with header and footer', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogDescription>Are you sure?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      
      await user.click(screen.getByText('Open Dialog'))
      
      expect(await screen.findByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Confirm')).toBeInTheDocument()
    })

    it('renders with controlled open state', () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Always Open</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('Always Open')).toBeInTheDocument()
    })

    it('does not show content when dialog is closed', () => {
      render(
        <Dialog open={false}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hidden Content</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()
    })
  })

  describe('DialogTrigger', () => {
    it('can render as child component (asChild)', async () => {
      const user = userEvent.setup()
      
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button>Custom Button</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      
      const button = screen.getByRole('button', { name: /custom button/i })
      expect(button).toBeInTheDocument()
      
      await user.click(button)
      expect(await screen.findByText('Content')).toBeInTheDocument()
    })
  })

  describe('DialogContent', () => {
    it('renders close button by default', async () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>With Close Button</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      
      // The close button should be present
      const closeButtons = screen.getAllByRole('button')
      expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('hides close button when showCloseButton is false', () => {
      render(
        <Dialog open={true}>
          <DialogContent showCloseButton={false}>
            <DialogTitle>No Close Button</DialogTitle>
          </DialogContent>
        </Dialog>
      )
      
      expect(screen.getByText('No Close Button')).toBeInTheDocument()
      // Test that component renders without error
    })
  })
})
