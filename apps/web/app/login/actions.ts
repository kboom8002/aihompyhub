'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  // Redirect handles checking the role in the middleware
  redirect('/tenant/home')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Actually signing up creates a 'pending_admin' profile automatically via the PSQL trigger
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'pending_admin',
      }
    }
  })

  if (error) {
    redirect('/login?message=Could not sign up user')
  }

  // We redirect to /pending or /login with success message
  redirect('/login?message=Check email to continue sign in process')
}
