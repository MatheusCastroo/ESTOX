"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Lead, LeadStatus, LeadSource } from "@/lib/types/database"

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

// Get all leads for the store
export async function getLeads(filters?: {
  status?: LeadStatus | "all"
  search?: string
  vehicleId?: string
}) {
  const supabase = await createClient()
  const store = await getUserStore()

  let query = supabase
    .from("leads")
    .select(`
      *,
      vehicle:vehicles(id, brand, model, year, images)
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
  }

  if (filters?.vehicleId) {
    query = query.eq("vehicle_id", filters.vehicleId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error("Erro ao buscar leads: " + error.message)
  }

  return data as Lead[]
}

// Get recent leads for dashboard
export async function getRecentLeads(limit = 4) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      vehicle:vehicles(id, brand, model)
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error("Erro ao buscar leads recentes: " + error.message)
  }

  return data as Lead[]
}

// Update lead status
export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId)
    .eq("store_id", store.id)
    .select()
    .single()

  if (error) {
    throw new Error("Erro ao atualizar status do lead: " + error.message)
  }

  revalidatePath("/dashboard")
  return data as Lead
}

// Create a lead (public - from catalog)
export async function createLead(data: {
  storeSlug: string
  vehicleId?: string
  name: string
  phone?: string
  email?: string
  message?: string
  source: LeadSource
}) {
  const supabase = await createClient()

  // Get store by slug
  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("slug", data.storeSlug)
    .eq("is_active", true)
    .single()

  if (storeError || !store) {
    throw new Error("Loja não encontrada")
  }

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      store_id: store.id,
      vehicle_id: data.vehicleId || null,
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      source: data.source,
      status: "new",
    })
    .select()
    .single()

  if (error) {
    throw new Error("Erro ao criar lead: " + error.message)
  }

  return lead as Lead
}

// Delete a lead
export async function deleteLead(leadId: string) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { error } = await supabase.from("leads").delete().eq("id", leadId).eq("store_id", store.id)

  if (error) {
    throw new Error("Erro ao excluir lead: " + error.message)
  }

  revalidatePath("/dashboard")
  return { success: true }
}

// Get lead statistics
export async function getLeadStats() {
  const supabase = await createClient()
  const store = await getUserStore()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: total } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .gte("created_at", thirtyDaysAgo.toISOString())

  const { count: newLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .eq("status", "new")
    .gte("created_at", thirtyDaysAgo.toISOString())

  const { count: converted } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .eq("status", "converted")
    .gte("created_at", thirtyDaysAgo.toISOString())

  return {
    total: total || 0,
    new: newLeads || 0,
    converted: converted || 0,
    conversionRate: total && total > 0 ? Math.round(((converted || 0) / total) * 100) : 0,
  }
}
