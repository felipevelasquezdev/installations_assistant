// src/app/features/installation/supabase.ts

import { Injectable, signal } from '@angular/core';
import { ClientFormData } from './installation-form';

const SUPABASE_URL = 'https://ettosunrcsmwvgyywppp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0dG9zdW5yY3Ntd3ZneXl3cHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDQwMjYsImV4cCI6MjA4ODA4MDAyNn0.6bktAGL637wwjsQNEIgflhzrHOuq3ee7XUM-X2qZ6Ok';

export type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  readonly saveStatus = signal<SaveStatus>('idle');
  readonly errorMessage = signal<string | null>(null);

  async saveClient(client: ClientFormData): Promise<void> {
    if (client.clientType !== 'natural') return;

    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/Clients`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          given_names:   client.firstName,
          family_names:  client.lastName,
          phone_number:  Number(client.phone),
          email:         client.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message ?? `Error ${response.status}`);
      }

      this.saveStatus.set('success');

    } catch (error) {
      this.saveStatus.set('error');
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Error al conectar con el servidor'
      );
    }
  }

  resetStatus(): void {
    this.saveStatus.set('idle');
    this.errorMessage.set(null);
  }
}
