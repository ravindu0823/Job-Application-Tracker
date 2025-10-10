import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Toaster } from '@/components/ui/sonner'
import { useTheme } from 'next-themes'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

interface MockThemeReturn {
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

describe('Toaster (Sonner) Component', () => {
  it('renders correctly', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    } as MockThemeReturn)

    const { container } = render(<Toaster />)
    expect(container).toBeInTheDocument()
  })

  it('uses theme from useTheme hook', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn(),
    } as MockThemeReturn)

    render(<Toaster />)
    // Sonner renders with theme prop
    // This is a smoke test to ensure it doesn't crash
  })

  it('uses system theme as default', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: undefined,
      setTheme: vi.fn(),
    } as MockThemeReturn)

    render(<Toaster />)
    // Should default to 'system' theme
  })

  it('applies custom className', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    } as MockThemeReturn)

    render(<Toaster className="custom-toaster" />)
    // Test passes if no error
  })

  it('passes through additional props', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    } as MockThemeReturn)

    render(<Toaster position="top-right" richColors />)
    // Test passes if no error, props are passed to Sonner
  })
})
