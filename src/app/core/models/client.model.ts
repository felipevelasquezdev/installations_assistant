// src/app/core/models/client.model.ts

export type ClientType = 'natural' | 'legal';

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
