// src/app/features/installation/summary-formatter.ts

import { Injectable } from '@angular/core';
import { ClientFormData, ServiceFormData, LocationFormData, TechnicalFormData } from './installation-form';

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

  // ── HELPERS PRIVADOS ─────────────────────────────────────────

  private removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private toUpperNoSpaces(text: string): string {
    return this.removeAccents(text).toUpperCase().replace(/\s+/g, '');
  }

  private toLowerNoSpaces(text: string): string {
    return this.removeAccents(text).toLowerCase().replace(/\s+/g, '');
  }

  private padHilo(hilo: number): string {
    return hilo < 10 ? `0${hilo}` : `${hilo}`;
  }

  private getLocationPrefix(data: LocationFormData): string {
    return data.locationType === 'neighborhood' ? 'BARRIO' : 'VDA';
  }

  private getPointSuffix(pointNumber: number | null): string {
    return pointNumber ? `P${pointNumber}` : '';
  }

  // ── PERFIL SMART OLT ─────────────────────────────────────────

  buildSmartOltProfile(
    client: ClientFormData,
    service: ServiceFormData,
    location: LocationFormData,
    technical: TechnicalFormData
  ): string {
    const clientName = this.getClientName(client).toUpperCase();
    const pointSuffix = service.pointNumber ? ` PUNTO ${service.pointNumber}` : '';
    const hilo = this.padHilo(technical.wire ?? 0);
    const locationPrefix = this.getLocationPrefix(location);
    const locationName = location.locationName.toUpperCase();

    // Línea 1
    const line1 = `{codigoCliente} - ${clientName}${pointSuffix} - PRECINTO ${technical.seal} HILO ${hilo}`;

    // Línea 2
    const line2 = `(${locationPrefix} ${locationName} (${location.addressOrReference.toUpperCase()}))`;

    // Línea 3
    const line3 = client.phone;

    // Línea 4
    const line4 = `${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`;

    // Línea 5
    const internetPart = service.hasInternet ? 'solo internet' : '';
    const tvPart = service.hasTv ? ` +${service.tvCount}TV` : '';
    const line5 = `${internetPart}${tvPart} ${service.mbps}mbps`;

    return [line1, line2, line3, line4, line5].join('\n');
  }

  // ── PERFIL ROUTER BOARD ──────────────────────────────────────

  buildRouterBoardProfile(
    client: ClientFormData,
    service: ServiceFormData,
    location: LocationFormData
  ): string {
    const locationNoSpaces = this.toUpperNoSpaces(location.locationName);
    const clientName = this.getClientName(client);
    const pointSuffix = this.getPointSuffix(service.pointNumber);
    const locationPrefix = this.getLocationPrefix(location);
    const locationName = location.locationName.toUpperCase();

    let line1: string;
    let line2: string;

    if (client.clientType === 'natural') {
      // Línea 1: UBICACION.NOMBRECOMPLETO
      const fullNameNoSpaces = this.toUpperNoSpaces(clientName);
      line1 = `${locationNoSpaces}.${fullNameNoSpaces}${pointSuffix}`;

      // Línea 2: nombres.apellidos
      const nameParts = clientName.trim().split(' ');
      const midPoint = Math.ceil(nameParts.length / 2);
      const firstPart = this.toLowerNoSpaces(nameParts.slice(0, midPoint).join(' '));
      const secondPart = this.toLowerNoSpaces(nameParts.slice(midPoint).join(' '));
      line2 = `${firstPart}.${secondPart}${pointSuffix.toLowerCase()}`;

    } else {
      // Persona jurídica
      const fullNameNoSpaces = this.toUpperNoSpaces(clientName);
      line1 = `${locationNoSpaces}.${fullNameNoSpaces}${pointSuffix}`;

      // Línea 2: mitad.mitad en minúscula
      const nameLower = this.toLowerNoSpaces(clientName);
      const midPoint = Math.floor(nameLower.length / 2);
      const firstPart = nameLower.slice(0, midPoint);
      const secondPart = nameLower.slice(midPoint);
      line2 = `${firstPart}.${secondPart}${pointSuffix.toLowerCase()}`;
    }

    // Línea 3: {codigoCliente}: NOMBRE COMPLETO - (UBICACION (DIRECCION))
    const fullNameUpper = clientName.toUpperCase();
    const pointLabel = service.pointNumber ? ` PUNTO ${service.pointNumber}` : '';
    const coordsPart = service.serviceType === 'radio'
      ? ` (${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)})`
      : '';
    const line3 = `{codigoCliente}: ${fullNameUpper}${pointLabel} - (${locationPrefix} ${locationName} (${location.addressOrReference.toUpperCase()}${coordsPart}))`;

    return [line1, line2, line3].join('\n');
  }

  // ── WHATSAPP TEXT ────────────────────────────────────────────

  buildWhatsAppText(
    client: ClientFormData,
    service: ServiceFormData,
    location: LocationFormData,
    technical: TechnicalFormData
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
    lines.push(`Coordenadas: ${location.latitude?.toFixed(6)}, ${location.longitude?.toFixed(6)}`);

    lines.push('');
    lines.push('*Datos Tecnicos*');
    if (service.serviceType === 'fiber') {
      lines.push(`Precinto: ${technical.seal}`);
      lines.push(`Hilo: ${technical.wire}`);
    } else {
      lines.push(`Nodo: ${technical.node}`);
    }

    // Perfiles
    lines.push('');
    lines.push('*Perfil Router Board*');
    lines.push(this.buildRouterBoardProfile(client, service, location));

    if (service.serviceType === 'fiber') {
      lines.push('');
      lines.push('*Perfil Smart OLT*');
      lines.push(this.buildSmartOltProfile(client, service, location, technical));
    }

    return lines.join('\n');
  }
}
