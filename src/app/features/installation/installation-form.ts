// src/app/features/installation/installation-form.ts

import { Injectable, signal } from '@angular/core';
import { ClientType, ServiceType, LocationType } from '../../core/models/client.model';

export interface ClientFormData {
  clientType: ClientType;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  email: string;
}

export interface ServiceFormData {
  serviceType: ServiceType;
  hasInternet: boolean;
  mbps: number | null;
  hasTv: boolean;
  tvCount: number | null;
  pointNumber: number | null;
}

export interface LocationFormData {
  locationType: LocationType;
  locationName: string;
  addressOrReference: string;
  latitude: number | null;
  longitude: number | null;
}

export interface TechnicalFormData {
  seal: number | null;
  wire: number | null;
  node: string | null;
  napBox: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class InstallationFormService {
  readonly clientData    = signal<ClientFormData | null>(null);
  readonly serviceData   = signal<ServiceFormData | null>(null);
  readonly locationData  = signal<LocationFormData | null>(null);
  readonly technicalData = signal<TechnicalFormData | null>(null);

  saveClientData(data: ClientFormData): void {
    this.clientData.set(data);
  }

  saveServiceData(data: ServiceFormData): void {
    this.serviceData.set(data);
  }

  saveLocationData(data: LocationFormData): void {
    this.locationData.set(data);
  }

  saveTechnicalData(data: TechnicalFormData): void {
    this.technicalData.set(data);
  }
}
