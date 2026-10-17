import React, { createContext, useContext, useState } from 'react'

/**
 * Shape persisted in localStorage under the "user" key.
 * Mirrors the fixture documented in docs/api-surface.md (get_user_details/).
 */
export interface User {
  user_id: number
  username: string
  email: string
  name: string
  user_brand_settings: Record<string, unknown>
  credit_summary: {
    amount: number
    balance: number
  }
  is_premium: boolean
  default_image_model: string
  pusher_id?: string
}

export type LoginProvider = 'google' | 'apple' | 'email'

interface AuthContextType {
  user: User | null
  login: (provider: LoginProvider) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const STORAGE_KEY = 'user'

const readStoredUser = (): User | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

const MOCK_USER: User = {
  user_id: 179398,
  username: 'yaslencatty@gmail.com',
  email: 'yaslencatty@gmail.com',
  name: 'yaslen Catty',
  user_brand_settings: {},
  credit_summary: {
    amount: 0,
    balance: 0,
  },
  is_premium: false,
  default_image_model: 'MagicX',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Auth provider backed by localStorage ("user" key). `login()` is a mock
 * social/email login that persists the fixture user after a short latency,
 * standing in for the real OAuth flows.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize synchronously so AuthGuard does not flash-redirect on reload.
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  const login = async (provider: LoginProvider): Promise<void> => {
    // Simulated round-trip to the auth backend. The provider distinguishes
    // the Google / Apple / email entry points in the real flow.
    console.debug('[auth] mock login via', provider)
    await new Promise((resolve) => setTimeout(resolve, 300))
    const nextUser: User = { ...MOCK_USER }
    setUser(nextUser)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
  }

  const logout = (): void => {
    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}
