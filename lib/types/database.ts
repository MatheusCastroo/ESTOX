export type VehicleStatus = "available" | "reserved" | "sold"
export type LeadSource = "whatsapp" | "phone" | "email" | "form"
export type LeadStatus = "new" | "contacted" | "negotiating" | "converted" | "lost"
export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled"

export interface Plan {
  id: string
  name: string
  slug: string
  price: number
  vehicle_limit: number
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  user_id: string
  plan_id: string | null
  name: string
  slug: string
  logo_url: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  description: string | null
  is_active: boolean
  subscription_status: SubscriptionStatus
  subscription_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  store_id: string
  brand: string
  model: string
  year: number
  mileage: number
  price: number
  fuel: string | null
  transmission: string | null
  color: string | null
  description: string | null
  features: string[]
  images: string[]
  status: VehicleStatus
  views: number
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  store_id: string
  vehicle_id: string | null
  name: string
  phone: string | null
  email: string | null
  message: string | null
  source: LeadSource
  status: LeadStatus
  created_at: string
  updated_at: string
  vehicle?: Vehicle
}

export interface VehicleView {
  id: string
  vehicle_id: string
  store_id: string
  viewed_at: string
  ip_address: string | null
  user_agent: string | null
}

export interface NotificationSettings {
  id: string
  store_id: string
  new_lead_email: boolean
  weekly_report: boolean
  platform_updates: boolean
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  totalViews: number
  totalLeads: number
  conversionRate: number
  viewsChange: number
  leadsChange: number
}
