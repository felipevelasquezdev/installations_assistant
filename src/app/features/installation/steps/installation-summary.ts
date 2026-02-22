// src/app/features/installation/steps/installation-summary.ts

import { Component, input, output, viewChild, ElementRef } from '@angular/core';
import { ClientFormData, ServiceFormData } from '../installation-form';

@Component({
  selector: 'app-installation-summary',
  imports: [],
  templateUrl: './installation-summary.html',
  styleUrl: './installation-summary.css',
})
export class InstallationSummary {

  readonly clientData = input.required<ClientFormData>();
  readonly serviceData = input.required<ServiceFormData>();
  readonly goBack = output<void>();

  readonly summaryRef = viewChild<ElementRef<HTMLElement>>('summaryContent');

  copied = false;

  get clientName(): string {
    const client = this.clientData();
    return client.clientType === 'natural'
      ? `${client.firstName} ${client.lastName}`
      : client.companyName;
  }

  get clientTypeName(): string {
    return this.clientData().clientType === 'natural'
      ? 'Persona Natural'
      : 'Persona Juridica';
  }

  get serviceTypeName(): string {
    return this.serviceData().serviceType === 'fiber'
      ? 'Fibra Optica'
      : 'Radio Enlace';
  }

  get isFiber(): boolean {
    return this.serviceData().serviceType === 'fiber';
  }

  private buildWhatsAppText(): string {
    const client = this.clientData();
    const service = this.serviceData();

    const lines: string[] = [
      '*Nueva Instalacion AJ Global*',
      '',
      '*Datos del Cliente*',
      `Tipo: ${this.clientTypeName}`,
      `Nombre: ${this.clientName}`,
      `Telefono: ${client.phone}`,
      '',
      '*Servicio*',
      `Tipo: ${this.serviceTypeName}`,
    ];

    if (service.serviceType === 'fiber') {
      lines.push(`Internet: ${service.hasInternet ? 'Si' : 'No'}`);
    }

    if (service.mbps) {
      lines.push(`Velocidad: ${service.mbps} Mbps`);
    }

    if (service.serviceType === 'fiber') {
      lines.push(`TV: ${service.hasTv ? `Si (${service.tvCount} ${service.tvCount === 1 ? 'TV' : 'TVs'})` : 'No'}`);
    }

    return lines.join('\n');
  }

  async onCopy(): Promise<void> {
    await navigator.clipboard.writeText(this.buildWhatsAppText());
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  onWhatsApp(): void {
    const encoded = encodeURIComponent(this.buildWhatsAppText());
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
