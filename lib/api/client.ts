/**
 * API Client for Estocx PHP Backend
 * Integrates with the existing PHP API at /api/index.php
 */

// API Base URL - detecta automaticamente o ambiente
const getApiBaseUrl = () => {
  // Se estiver no browser, tenta usar a URL relativa ou variável de ambiente
  if (typeof window !== 'undefined') {
    // Verifica se há variável global definida (útil para configuração dinâmica)
    if ((window as any).API_URL) {
      return (window as any).API_URL
    }
    
    // Usa variável de ambiente se disponível
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL
    }
    
    // Em produção, usa URL relativa (mesmo domínio)
    // Em desenvolvimento, usa localhost
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' &&
                        !window.location.hostname.startsWith('192.168.')
    
    return isProduction 
      ? '/api/index.php'  // URL relativa para produção
      : 'http://localhost/ESTOX/api/index.php'  // Localhost para desenvolvimento
  }
  
  // Server-side: usa variável de ambiente ou fallback
  return process.env.NEXT_PUBLIC_API_URL || '/api/index.php'
}

const API_BASE_URL = getApiBaseUrl()

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function buildApiUrl(endpoint: string): string {
  const base = API_BASE_URL.replace(/\/$/, '')
  const cleanEndpoint = endpoint.replace(/^\//, '')
  
  // Split endpoint and query string if present
  const [endpointPath, queryString] = cleanEndpoint.split('?')
  
  let url = `${base}/${endpointPath}`
  
  if (queryString) {
    url += `?${queryString}`
  }
  
  return url
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint)
  
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('token') 
    : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data: ApiResponse<T> = await response.json()

    if (!response.ok || !data.success) {
      throw new ApiError(
        data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data
      )
    }

    return data.data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro desconhecido',
      0,
      error
    )
  }
}

// Public API functions (no auth required)
export async function getPublicStore(storeSlug: string) {
  const response = await apiRequest<{ store: any }>(
    `stores?public=true&slug=${storeSlug}`
  )
  return response.store
}

export async function getPublicVehicles(
  storeSlug: string,
  filters?: {
    status?: string
    brand?: string
    minPrice?: number
    maxPrice?: number
    minYear?: number
    maxYear?: number
    transmission?: string
    search?: string
  }
) {
  const params = new URLSearchParams({
    public: 'true',
    store_slug: storeSlug,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.brand && { brand: filters.brand }),
    ...(filters?.minPrice && { min_price: filters.minPrice.toString() }),
    ...(filters?.maxPrice && { max_price: filters.maxPrice.toString() }),
    ...(filters?.minYear && { min_year: filters.minYear.toString() }),
    ...(filters?.maxYear && { max_year: filters.maxYear.toString() }),
    ...(filters?.transmission && { transmission: filters.transmission }),
    ...(filters?.search && { search: filters.search }),
  })

  const response = await apiRequest<{ vehicles: any[]; store: any }>(
    `vehicles?${params.toString()}`
  )
  return response
}

export async function getPublicVehicle(storeSlug: string, vehicleId: string) {
  const response = await apiRequest<{ vehicle: any; store: any }>(
    `vehicles?public=true&store_slug=${storeSlug}&vehicle_id=${vehicleId}`
  )
  return response
}

// Authenticated API functions
export async function getStore() {
  const response = await apiRequest<{ store: any }>('stores')
  return response.store
}

export async function updateStore(data: Partial<any>) {
  const response = await apiRequest<{ store: any }>('stores', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.store
}

export async function getVehicles(filters?: {
  status?: string
  search?: string
}) {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.search) params.append('search', filters.search)

  const query = params.toString()
  const response = await apiRequest<{ vehicles: any[] }>(
    `vehicles${query ? `?${query}` : ''}`
  )
  return response.vehicles || []
}

export async function getVehicle(id: string) {
  const response = await apiRequest<{ vehicle: any }>(`vehicles?id=${id}`)
  return response.vehicle
}

export async function createVehicle(data: any) {
  const response = await apiRequest<{ vehicle: any }>('vehicles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.vehicle
}

export async function updateVehicle(id: string, data: Partial<any>) {
  const response = await apiRequest<{ vehicle: any }>(`vehicles?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.vehicle
}

export async function deleteVehicle(id: string) {
  await apiRequest(`vehicles?id=${id}`, {
    method: 'DELETE',
  })
}

export async function getDashboardStats() {
  const response = await apiRequest<{
    totalVehicles: number
    availableVehicles: number
    totalViews: number
    totalLeads: number
  }>('dashboard?action=stats')
  return response
}

export async function getNotificationSettings() {
  const response = await apiRequest<{ settings: any }>('notifications')
  return response.settings
}

export async function updateNotificationSettings(data: Partial<any>) {
  const response = await apiRequest<{ settings: any }>('notifications', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.settings
}
