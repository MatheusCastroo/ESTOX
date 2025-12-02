"use server"

import { createClient } from "@/lib/supabase/server"
import type { DashboardStats } from "@/lib/types/database"

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

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const store = await getUserStore()

  // Get vehicle counts
  const { count: totalVehicles } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)

  const { count: availableVehicles } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .eq("status", "available")

  // Get total views from vehicle_views table (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: totalViews } = await supabase
    .from("vehicle_views")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .gte("viewed_at", thirtyDaysAgo.toISOString())

  // Get previous period views (30-60 days ago)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const { count: previousViews } = await supabase
    .from("vehicle_views")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .gte("viewed_at", sixtyDaysAgo.toISOString())
    .lt("viewed_at", thirtyDaysAgo.toISOString())

  // Get leads count (last 30 days)
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .gte("created_at", thirtyDaysAgo.toISOString())

  // Get previous period leads
  const { count: previousLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store.id)
    .gte("created_at", sixtyDaysAgo.toISOString())
    .lt("created_at", thirtyDaysAgo.toISOString())

  // Calculate conversion rate (leads / views * 100)
  const conversionRate = totalViews && totalViews > 0 ? ((totalLeads || 0) / totalViews) * 100 : 0

  // Calculate percentage changes
  const viewsChange =
    previousViews && previousViews > 0 ? (((totalViews || 0) - previousViews) / previousViews) * 100 : 0

  const leadsChange =
    previousLeads && previousLeads > 0 ? (((totalLeads || 0) - previousLeads) / previousLeads) * 100 : 0

  return {
    totalVehicles: totalVehicles || 0,
    availableVehicles: availableVehicles || 0,
    totalViews: totalViews || 0,
    totalLeads: totalLeads || 0,
    conversionRate: Math.round(conversionRate * 10) / 10,
    viewsChange: Math.round(viewsChange),
    leadsChange: Math.round(leadsChange),
  }
}

// Get top viewed vehicles
export async function getTopVehicles(limit = 5) {
  const supabase = await createClient()
  const store = await getUserStore()

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id,
      brand,
      model,
      views,
      images
    `)
    .eq("store_id", store.id)
    .order("views", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error("Erro ao buscar veículos mais vistos: " + error.message)
  }

  // Get leads count for each vehicle
  const vehiclesWithLeads = await Promise.all(
    (data || []).map(async (vehicle) => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("vehicle_id", vehicle.id)

      return {
        ...vehicle,
        leads: count || 0,
      }
    }),
  )

  return vehiclesWithLeads
}

// Get monthly stats for reports
export async function getMonthlyStats(months = 3) {
  const supabase = await createClient()
  const store = await getUserStore()

  const stats = []
  const now = new Date()

  for (let i = 0; i < months; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    const { count: views } = await supabase
      .from("vehicle_views")
      .select("*", { count: "exact", head: true })
      .eq("store_id", store.id)
      .gte("viewed_at", monthStart.toISOString())
      .lte("viewed_at", monthEnd.toISOString())

    const { count: leads } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("store_id", store.id)
      .gte("created_at", monthStart.toISOString())
      .lte("created_at", monthEnd.toISOString())

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    stats.unshift({
      month: monthNames[monthStart.getMonth()],
      year: monthStart.getFullYear(),
      views: views || 0,
      leads: leads || 0,
    })
  }

  return stats
}
