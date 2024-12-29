import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../page'
import { useAuth } from '@/contexts/AuthContext'

// Mock de los hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

describe('LoginPage', () => {
  const mockPush = jest.fn()
  const mockLogin = jest.fn()

  beforeEach(() => {
    useRouter.mockImplementation(() => ({ push: mockPush }))
    useAuth.mockImplementation(() => ({ login: mockLogin }))
  })

  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password123' },
    })
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
    })
  })

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
    
    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'testuser' },
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrongpassword' },
    })
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      const errorMessage = screen.getByText('Invalid credentials')
      expect(errorMessage).toBeInTheDocument()
    }, {
      timeout: 3000
    })
  })
})