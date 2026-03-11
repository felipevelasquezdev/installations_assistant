// src/app/core/auth.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { createClient, SupabaseClient, User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Router } from '@angular/router';

const SUPABASE_URL = 'https://ettosunrcsmwvgyywppp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0dG9zdW5yY3Ntd3ZneXl3cHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDQwMjYsImV4cCI6MjA4ODA4MDAyNn0.6bktAGL637wwjsQNEIgflhzrHOuq3ee7XUM-X2qZ6Ok';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly router = inject(Router);
  readonly supabaseClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly loading = signal(true);

  constructor() {
    this.supabaseClient.auth.getSession().then(({ data }) => {
      this.currentUser.set(data.session?.user ?? null);
      this.loading.set(false);
    });

    this.supabaseClient.auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  async login(email: string, password: string): Promise<string | null> {
    const { error } = await this.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return this.mapError(error.message);
    return null;
  }

  async logout(): Promise<void> {
    await this.supabaseClient.auth.signOut();
    this.router.navigate(['/login']);
  }

  private mapError(message: string): string {
    if (message.includes('Invalid login credentials')) {
      return 'Correo o contraseña incorrectos';
    }
    if (message.includes('Email not confirmed')) {
      return 'Correo no confirmado';
    }
    return 'Error al iniciar sesión. Intenta de nuevo.';
  }
}
