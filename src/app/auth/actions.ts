'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect('/?error=Supabase%20is%20not%20configured');
  }

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/?error=Enter%20your%20email%20and%20password');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect('/');
}
