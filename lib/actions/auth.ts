"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Get current user
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Check if user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

// Check if user has a store
export async function requireStore() {
  const supabase = await createClient()
  const user = await requireAuth()

  const { data: store } = await supabase.from("stores").select("*").eq("user_id", user.id).single()

  if (!store) {
    redirect("/onboarding")
  }

  return { user, store }
}

// Sign out
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
