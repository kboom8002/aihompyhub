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
    console.error("Login Error:", error);
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  // Redirect handles checking the role in the middleware
  redirect('/tenant/home')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { createClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Directly create the user bypassing the SMTP rate limits (over_email_send_rate_limit)
  // By assigning email_confirm: true, we completely skip the email sending portion during this B2B dev phase.
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'pending_admin',
    }
  })

  if (error) {
    console.error("Signup Error:", error);
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  // We redirect to /login with success message
  redirect(`/login?message=${encodeURIComponent('가입 신청이 성공적으로 접수되었습니다. (자동 인증 완료)')}`);
}
