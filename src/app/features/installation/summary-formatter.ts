// src/app/features/installation/summary-formatter.ts

import { Injectable } from '@angular/core';
import { ClientFormData, ServiceFormData, LocationFormData } from './installation-form';

@Injectable({
  providedIn: 'root'
})
export class SummaryFormatterService {

  getClientTypeName(data: ClientFormData): string {
    return data.clientType === 'natural' ? 'Persona Natural' : 'Persona Juridica';
  }

  getClientName(data: ClientFormData): string {
    return data.clientType === 'natural'
      ? `${data.firstName} ${data.lastName}`
      : data.companyName;
  }

  getServiceTypeName(data: ServiceFormData): string {
    return data.serviceType === 'fiber' ? 'Fibra Optica' : 'Radio Enlace';
  }

  buildWhatsAppText(
    client: ClientFormData,
    service: ServiceFormData,
    location: LocationFormData
  ): string {
    const locationTypeName = location.locationType === 'neighborhood' ? 'Barrio' : 'Vereda';
    const addressLabel = location.locationType === 'neighborhood' ? 'Direccion' : 'Referencia';

    const lines: string[] = [
      '*Nueva Instalacion AJ Global*',
      '',
      '*Datos del Cliente*',
      `Tipo: ${this.getClientTypeName(client)}`,
      `Nombre: ${this.getClientName(client)}`,
      `Telefono: ${client.phone}`,
      '',
      '*Servicio*',
      `Tipo: ${this.getServiceTypeName(service)}`,
    ];

    if (service.serviceType === 'fiber') {
      lines.push(`Internet: ${service.hasInternet ? 'Si' : 'No'}`);
    }

    if (service.mbps) {
      lines.push(`Velocidad: ${service.mbps} Mbps`);
    }

    if (service.serviceType === 'fiber') {
      lines.push(`TV: ${service.hasTv
        ? `Si (${service.tvCount} ${service.tvCount === 1 ? 'TV' : 'TVs'})`
        : 'No'
      }`);
    }

    if (service.pointNumber) {
      lines.push(`Punto: ${service.pointNumber}`);
    }

    lines.push('');
    lines.push('*Ubicacion*');
    lines.push(`Tipo: ${locationTypeName}`);
    lines.push(`${locationTypeName}: ${location.locationName}`);
    lines.push(`${addressLabel}: ${location.addressOrReference}`);

    return lines.join('\n');
  }
}
