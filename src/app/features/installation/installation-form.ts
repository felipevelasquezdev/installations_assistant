// src/app/features/installation/installation-form.ts

import { Injectable, signal } from '@angular/core';
import { ClientType, ServiceType } from '../../core/models/client.model';

export interface ClientFormData {
  clientType: ClientType;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
}

export interface ServiceFormData {
  serviceType: ServiceType;
  hasInternet: boolean;
  mbps: number | null;
  hasTv: boolean;
  tvCount: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class InstallationFormService {
  readonly clientData = signal<ClientFormData | null>(null);
  readonly serviceData = signal<ServiceFormData | null>(null);

  saveClientData(data: ClientFormData): void {
    this.clientData.set(data);
  }

  saveServiceData(data: ServiceFormData): void {
    this.serviceData.set(data);
  }
}
