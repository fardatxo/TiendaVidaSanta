/**
 * Auth service — 100% Supabase Auth & Database (Profiles)
 */

import { supabase } from './supabase';

// ── Types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phonePrefix?: string;
  birthDate?: string;
  newsletter: boolean;
  onboardingComplete: boolean;
  provider: 'email' | 'google';
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isNew?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────

export async function getUserById(uid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();

  if (error || !data) return null;
  return data as User;
}

// ── Public API ─────────────────────────────────────────────────────

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('User already registered') || error.status === 400) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Registration failed: No user returned.' };
    }

    const user: User = {
      id: data.user.id,
      email: email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      newsletter: false,
      onboardingComplete: false,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert(user);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    return { success: true, user, isNew: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Registration failed.' };
  }
}

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Incorrect email or password.' };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed: User not found.' };
    }

    const user = await getUserById(data.user.id);
    if (!user) {
      // Create user record in Supabase Profiles if it doesn't exist (failsafe)
      const mockUser: User = {
        id: data.user.id,
        email: data.user.email ?? email.toLowerCase().trim(),
        firstName: '',
        lastName: '',
        newsletter: false,
        onboardingComplete: false,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      await supabase.from('profiles').upsert(mockUser);
      return { success: true, user: mockUser };
    }
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Login failed.' };
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Google sign-in failed.' };
  }
}

export async function updateProfile(
  updates: Partial<Omit<User, 'id' | 'email' | 'provider' | 'createdAt'>>,
): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;

  if (!uid) return null;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', uid);

  if (error) {
    console.error('[updateProfile] error:', error.message);
    return null;
  }

  return getUserById(uid);
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function emailExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    return !error && data && data.length > 0;
  } catch {
    return false;
  }
}
