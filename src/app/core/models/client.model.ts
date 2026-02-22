// src/app/core/models/client.model.ts

export type ClientType = 'natural' | 'legal';
export type ServiceType = 'fiber' | 'radio';
export type LocationType = 'neighborhood' | 'village';

export interface NaturalPersonClient {
  type: 'natural';
  firstName: string;
  lastName: string;
}

export interface LegalPersonClient {
  type: 'legal';
  companyName: string;
}

export type Client = NaturalPersonClient | LegalPersonClient;

export interface ServiceInfo {
  serviceType: ServiceType;
  hasInternet: boolean;
  mbps: number;
  hasTv: boolean;
  tvCount: number | null;
}
