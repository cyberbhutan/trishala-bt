'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

export async function signIn(formData: FormData): Promise<void> {
  const supabase = await createServerSupabase()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirect') as string) || '/business/dashboard'

  await supabase.auth.signInWithPassword({ email, password })
  redirect(redirectTo)
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?redirect=/business/dashboard`,
    },
  })
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/')
}

export async function getSession() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}
