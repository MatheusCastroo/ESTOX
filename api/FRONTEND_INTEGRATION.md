# Integração com Frontend Next.js

Este documento mostra como integrar a API PHP com o frontend Next.js.

## 1. Criar Cliente de API

Crie o arquivo `lib/api-client.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_URL}/${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error')
    }
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    const result = await this.request('auth?action=register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    if (result.data?.token) {
      this.setToken(result.data.token)
    }
    return result
  }

  async login(email: string, password: string) {
    const result = await this.request('auth?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (result.data?.token) {
      this.setToken(result.data.token)
    }
    return result
  }

  async getCurrentUser() {
    return this.request('auth')
  }

  logout() {
    this.setToken(null)
  }

  // Stores
  async getStore() {
    return this.request('stores')
  }

  async createStore(data: any) {
    return this.request('stores', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateStore(data: any) {
    return this.request('stores', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async checkSlugAvailability(slug: string) {
    return this.request(`stores?check_slug=${encodeURIComponent(slug)}`)
  }

  // Vehicles
  async getVehicles(filters?: {
    status?: string
    search?: string
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })
    }
    return this.request(`vehicles?${params.toString()}`)
  }

  async getVehicle(id: string) {
    return this.request(`vehicles?id=${id}`)
  }

  async createVehicle(data: any) {
    return this.request('vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateVehicle(id: string, data: any) {
    return this.request(`vehicles?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteVehicle(id: string) {
    return this.request(`vehicles?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Public catalog
  async getPublicVehicles(storeSlug: string, filters?: any) {
    const params = new URLSearchParams({
      public: 'true',
      store_slug: storeSlug,
      ...filters,
    })
    return this.request(`vehicles?${params.toString()}`)
  }

  async getPublicVehicle(storeSlug: string, vehicleId: string) {
    return this.request(
      `vehicles?public=true&store_slug=${storeSlug}&vehicle_id=${vehicleId}`
    )
  }

  // Leads
  async getLeads(filters?: {
    status?: string
    search?: string
    vehicleId?: string
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })
    }
    return this.request(`leads?${params.toString()}`)
  }

  async getLeadStats() {
    return this.request('leads?stats=true')
  }

  async updateLeadStatus(leadId: string, status: string) {
    return this.request(`leads?id=${leadId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deleteLead(leadId: string) {
    return this.request(`leads?id=${leadId}`, {
      method: 'DELETE',
    })
  }

  // Public lead creation
  async createLead(data: {
    storeSlug: string
    vehicleId?: string
    name: string
    phone?: string
    email?: string
    message?: string
    source: string
  }) {
    return this.request('leads?public=true', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('dashboard?action=stats')
  }

  async getTopVehicles(limit = 5) {
    return this.request(`dashboard?action=top-vehicles&limit=${limit}`)
  }

  async getMonthlyStats(months = 3) {
    return this.request(`dashboard?action=monthly-stats&months=${months}`)
  }

  // Plans
  async getPlans() {
    return this.request('plans')
  }

  // Notifications
  async getNotificationSettings() {
    return this.request('notifications')
  }

  async updateNotificationSettings(settings: any) {
    return this.request('notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }
}

export const apiClient = new ApiClient()
```

## 2. Atualizar Variáveis de Ambiente

Adicione no `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost/api
```

## 3. Exemplo de Uso em Componentes

### Login
```typescript
'use client'

import { apiClient } from '@/lib/api-client'
import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await apiClient.login(email, password)
      if (result.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  )
}
```

### Criar Veículo
```typescript
'use client'

import { apiClient } from '@/lib/api-client'

export function CreateVehicleForm() {
  async function handleSubmit(data: any) {
    try {
      const result = await apiClient.createVehicle(data)
      if (result.success) {
        // Success
        console.log('Vehicle created:', result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    // form component
  )
}
```

## 4. Atualizar Middleware

Atualize `middleware.ts` para verificar o token JWT:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

## 5. Server Components (se necessário)

Para usar em Server Components, você precisará passar o token:

```typescript
import { cookies } from 'next/headers'
import { apiClient } from '@/lib/api-client'

export async function ServerComponent() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (token) {
    apiClient.setToken(token)
    const data = await apiClient.getStore()
    return <div>{/* render data */}</div>
  }

  return <div>Not authenticated</div>
}
```

## 6. Tratamento de Erros

Crie um hook para tratamento de erros:

```typescript
import { useState, useCallback } from 'react'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async <T,>(
    fn: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      if (result.success && result.data) {
        return result.data
      }
      throw new Error(result.error || 'Unknown error')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error }
}
```

## Próximos Passos

1. Substitua todas as Server Actions pelo `apiClient`
2. Atualize os formulários para usar o cliente
3. Implemente tratamento de erros adequado
4. Adicione loading states
5. Teste todas as funcionalidades



