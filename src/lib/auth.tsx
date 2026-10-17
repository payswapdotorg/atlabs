import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  user_id: number
  username: string
  email: string
  name: string
  user_brand_settings: Record<string, any>
  credit_summary: {
    amount: number
    balance: number
  }
  is_premium: boolean
  default_image_model: string
  pusher_id?: string
}

interface AuthContextType {
  user: User | null
  login: (provider: 'google' | 'apple' | 'email') => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (provider: 'google' | 'apple' | 'email') => {
    // Use provider to avoid TS6133
    console.log(`Mock logging in with ${provider}`)
    
    // Mock user data from the brief
    const mockUser: User = {
      user_id: 179398,
      username: "yaslencatty@gmail.com",
      email: "yaslencatty@gmail.com",
      name: "yaslen Catty",
      user_brand_settings: {},
      credit_summary: {
        amount: 0,
        balance: 0
      },
      is_premium: false,
      default_image_model: "MagicX"
    }
    
    setUser(mockUser)
    localStorage.setItem('user', JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}