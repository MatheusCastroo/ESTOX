"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Vehicle, VehicleStatus } from "@/lib/types/database"

export interface VehicleFormData {
  brand: string
  model: string
  year: number
  mileage: number
  price: number
  fuel: string
  transmission: string
  color: string
  description: string
  features: string[]
  images: string[]
  status: VehicleStatus
}

// Get user's store
async function getUserStore() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const { data: store, error } = await supabase.from("stores").select("*").eq("user_id", user.id).single()

  if (error || !store) {
    throw new Error("Loja não encontrada")
  }

  return store
}

// Get all vehicles for the user's store
export async function getVehicles(filters?: {
  status?: VehicleStatus | "all"
  search?: string
}) {
  const supabase = await createClient()
  const store = await getUserStore()

  let query = supabase.from("vehicles").select("*").eq("store_id", store.id).order("created_at", { ascending: false })

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  if (filters?.search) {
    query = query.or(`brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error("Erro ao buscar veículos: " + error.message)
  }

  return data as Vehicle[]
}

// Get a single vehicle by ID
export async function getVehicle(id: string) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).eq("store_id", store.id).single()

  if (error) {
    throw new Error("Veículo não encontrado")
  }

  return data as Vehicle
}

// Create a new vehicle
export async function createVehicle(formData: VehicleFormData) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      store_id: store.id,
      brand: formData.brand,
      model: formData.model,
      year: formData.year,
      mileage: formData.mileage,
      price: formData.price,
      fuel: formData.fuel,
      transmission: formData.transmission,
      color: formData.color,
      description: formData.description,
      features: formData.features,
      images: formData.images,
      status: formData.status,
    })
    .select()
    .single()

  if (error) {
    throw new Error("Erro ao criar veículo: " + error.message)
  }

  revalidatePath("/dashboard/veiculos")
  return data as Vehicle
}

// Update a vehicle
export async function updateVehicle(id: string, formData: Partial<VehicleFormData>) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase
    .from("vehicles")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("store_id", store.id)
    .select()
    .single()

  if (error) {
    throw new Error("Erro ao atualizar veículo: " + error.message)
  }

  revalidatePath("/dashboard/veiculos")
  revalidatePath(`/dashboard/veiculos/${id}`)
  return data as Vehicle
}

// Delete a vehicle
export async function deleteVehicle(id: string) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { error } = await supabase.from("vehicles").delete().eq("id", id).eq("store_id", store.id)

  if (error) {
    throw new Error("Erro ao excluir veículo: " + error.message)
  }

  revalidatePath("/dashboard/veiculos")
  return { success: true }
}

// Toggle vehicle status
export async function toggleVehicleStatus(id: string, newStatus: VehicleStatus) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase
    .from("vehicles")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("store_id", store.id)
    .select()
    .single()

  if (error) {
    throw new Error("Erro ao alterar status: " + error.message)
  }

  revalidatePath("/dashboard/veiculos")
  return data as Vehicle
}

// Get recent vehicles for dashboard
export async function getRecentVehicles(limit = 5) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error("Erro ao buscar veículos recentes: " + error.message)
  }

  return data as Vehicle[]
}

// ========== PUBLIC CATALOG FUNCTIONS ==========

// Get vehicles for public catalog (by store slug)
export async function getPublicVehicles(
  storeSlug: string,
  filters?: {
    brand?: string
    minPrice?: number
    maxPrice?: number
    minYear?: number
    maxYear?: number
    transmission?: string
    search?: string
  },
) {
  const supabase = await createClient()

  // First, get the store by slug
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url, phone, whatsapp, email, address, city, state, description")
    .eq("slug", storeSlug)
    .eq("is_active", true)
    .single()

  if (storeError || !store) {
    throw new Error("Loja não encontrada")
  }

  // Then, get vehicles for that store
  let query = supabase
    .from("vehicles")
    .select("*")
    .eq("store_id", store.id)
    .eq("status", "available")
    .order("created_at", { ascending: false })

  if (filters?.brand) {
    query = query.eq("brand", filters.brand)
  }
  if (filters?.minPrice) {
    query = query.gte("price", filters.minPrice)
  }
  if (filters?.maxPrice) {
    query = query.lte("price", filters.maxPrice)
  }
  if (filters?.minYear) {
    query = query.gte("year", filters.minYear)
  }
  if (filters?.maxYear) {
    query = query.lte("year", filters.maxYear)
  }
  if (filters?.transmission) {
    query = query.eq("transmission", filters.transmission)
  }
  if (filters?.search) {
    query = query.or(`brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
  }

  const { data: vehicles, error: vehiclesError } = await query

  if (vehiclesError) {
    throw new Error("Erro ao buscar veículos: " + vehiclesError.message)
  }

  return { store, vehicles: vehicles as Vehicle[] }
}

// Get a single vehicle for public catalog
export async function getPublicVehicle(storeSlug: string, vehicleId: string) {
  const supabase = await createClient()

  // Get store
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url, phone, whatsapp, email, address, city, state, description")
    .eq("slug", storeSlug)
    .eq("is_active", true)
    .single()

  if (storeError || !store) {
    throw new Error("Loja não encontrada")
  }

  // Get vehicle
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .eq("store_id", store.id)
    .single()

  if (vehicleError || !vehicle) {
    throw new Error("Veículo não encontrado")
  }

  // Record the view
  await supabase.from("vehicle_views").insert({
    vehicle_id: vehicleId,
    store_id: store.id,
  })

  // Increment view count
  await supabase
    .from("vehicles")
    .update({ views: (vehicle.views || 0) + 1 })
    .eq("id", vehicleId)

  return { store, vehicle: vehicle as Vehicle }
}
