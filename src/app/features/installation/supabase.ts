// src/app/features/installation/supabase.ts

import { Injectable, signal, inject } from '@angular/core';
import { ClientFormData } from './installation-form';
import { AuthService } from '../../core/auth';

export type SaveStatus = 'idle' | 'loading' | 'success' | 'error';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private readonly authService = inject(AuthService);

  readonly saveStatus = signal<SaveStatus>('idle');
  readonly errorMessage = signal<string | null>(null);

  async saveClient(client: ClientFormData): Promise<void> {
    if (client.clientType !== 'natural') return;

    this.saveStatus.set('loading');
    this.errorMessage.set(null);

    try {
      // LOG TEMPORAL
      const { data: session } = await this.authService.supabaseClient.auth.getSession();
      console.log('Sesión activa:', session);

      const { error } = await this.authService.supabaseClient
        .from('Clients')
        .insert({
          given_names:  client.firstName,
          family_names: client.lastName,
          phone_number: Number(client.phone),
          email:        client.email,
        });

      if (error) throw new Error(error.message);
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
