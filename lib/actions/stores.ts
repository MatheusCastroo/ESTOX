"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Store, NotificationSettings, Plan } from "@/lib/types/database"

export interface StoreFormData {
  name: string
  slug: string
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
  city?: string
  state?: string
  description?: string
}

// Get current user
async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  return user
}

// Get user's store
export async function getUserStore(): Promise<Store | null> {
  const supabase = await createClient()
  const user = await getCurrentUser()

  const { data, error } = await supabase.from("stores").select("*").eq("user_id", user.id).single()

  if (error) {
    return null
  }

  return data as Store
}

// Create a new store (called after registration)
export async function createStore(formData: StoreFormData, planSlug?: string) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  // Check if user already has a store
  const existingStore = await getUserStore()
  if (existingStore) {
    throw new Error("Usuário já possui uma loja cadastrada")
  }

  // Check if slug is available
  const { data: slugCheck } = await supabase.from("stores").select("id").eq("slug", formData.slug).single()

  if (slugCheck) {
    throw new Error("Este slug já está em uso. Escolha outro.")
  }

  // Get plan if specified
  let planId = null
  if (planSlug) {
    const { data: plan } = await supabase.from("plans").select("id").eq("slug", planSlug).single()

    planId = plan?.id
  }

  // Create store
  const { data, error } = await supabase
    .from("stores")
    .insert({
      user_id: user.id,
      plan_id: planId,
      name: formData.name,
      slug: formData.slug,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email || user.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      description: formData.description,
      subscription_status: "trial",
      subscription_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
    })
    .select()
    .single()

  if (error) {
    throw new Error("Erro ao criar loja: " + error.message)
  }

  // Create default notification settings
  await supabase.from("notification_settings").insert({
    store_id: data.id,
  })

  revalidatePath("/dashboard")
  return data as Store
}

// Update store
export async function updateStore(formData: Partial<StoreFormData>) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  // If updating slug, check if it's available
  if (formData.slug) {
    const { data: slugCheck } = await supabase.from("stores").select("id, user_id").eq("slug", formData.slug).single()

    if (slugCheck && slugCheck.user_id !== user.id) {
      throw new Error("Este slug já está em uso. Escolha outro.")
    }
  }

  const { data, error } = await supabase.from("stores").update(formData).eq("user_id", user.id).select().single()

  if (error) {
    throw new Error("Erro ao atualizar loja: " + error.message)
  }

  revalidatePath("/dashboard/configuracoes")
  return data as Store
}

// Get notification settings
export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const supabase = await createClient()
  const store = await getUserStore()

  if (!store) return null

  const { data, error } = await supabase.from("notification_settings").select("*").eq("store_id", store.id).single()

  if (error) return null

  return data as NotificationSettings
}

// Update notification settings
export async function updateNotificationSettings(settings: {
  new_lead_email?: boolean
  weekly_report?: boolean
  platform_updates?: boolean
}) {
  const supabase = await createClient()
  const store = await getUserStore()

  if (!store) {
    throw new Error("Loja não encontrada")
  }

  const { data, error } = await supabase
    .from("notification_settings")
    .update(settings)
    .eq("store_id", store.id)
    .select()
    .single()

  if (error) {
    throw new Error("Erro ao atualizar configurações: " + error.message)
  }

  revalidatePath("/dashboard/configuracoes")
  return data as NotificationSettings
}

// Get all plans
export async function getPlans(): Promise<Plan[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true })

  if (error) {
    throw new Error("Erro ao buscar planos: " + error.message)
  }

  return data as Plan[]
}

// Check slug availability
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase.from("stores").select("id").eq("slug", slug).single()

  return !data
}
