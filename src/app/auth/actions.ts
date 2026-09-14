'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

function readCredentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/?error=Enter%20your%20email%20and%20password');
  }

  if (password.length < 8) {
    redirect('/?error=Password%20must%20be%20at%20least%208%20characters');
  }

  return { email, password };
}

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect('/?error=Supabase%20is%20not%20configured');
  }

  const { email, password } = readCredentials(formData);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect('/?error=Supabase%20is%20not%20configured');
  }

  const { email, password } = readCredentials(formData);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: email.split('@')[0],
      },
    },
  });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    redirect('/dashboard');
  }

  redirect('/?message=Account%20created.%20Check%20your%20email%20to%20confirm%20your%20address.');
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect('/');
}
