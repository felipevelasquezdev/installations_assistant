// src/app/features/installation/steps/installation-summary.ts

import { Component, input, output, inject } from '@angular/core';
import { ClientFormData, ServiceFormData, LocationFormData, TechnicalFormData } from '../installation-form';
import { SummaryFormatterService } from '../summary-formatter';

@Component({
  selector: 'app-installation-summary',
  imports: [],
  templateUrl: './installation-summary.html',
  styleUrl: './installation-summary.css',
})
export class InstallationSummary {

  readonly clientData    = input.required<ClientFormData>();
  readonly serviceData   = input.required<ServiceFormData>();
  readonly locationData  = input.required<LocationFormData>();
  readonly technicalData = input.required<TechnicalFormData>();
  readonly goBack = output<void>();

  private readonly formatter = inject(SummaryFormatterService);

  copied = false;

  get clientName(): string {
    return this.formatter.getClientName(this.clientData());
  }

  get clientTypeName(): string {
    return this.formatter.getClientTypeName(this.clientData());
  }

  get serviceTypeName(): string {
    return this.formatter.getServiceTypeName(this.serviceData());
  }

  get isFiber(): boolean {
    return this.serviceData().serviceType === 'fiber';
  }

  get locationTypeName(): string {
    return this.locationData().locationType === 'neighborhood' ? 'Barrio' : 'Vereda';
  }

  get addressLabel(): string {
    return this.locationData().locationType === 'neighborhood'
      ? 'Direccion'
      : 'Referencia';
  }

  get routerBoardProfile(): string {
    return this.formatter.buildRouterBoardProfile(
      this.clientData(),
      this.serviceData(),
      this.locationData(),
      this.technicalData()
    );
  }

  get smartOltProfile(): string {
    return this.formatter.buildSmartOltProfile(
      this.clientData(),
      this.serviceData(),
      this.locationData(),
      this.technicalData()
    );
  }

  async onCopy(): Promise<void> {
    const text = this.formatter.buildWhatsAppText(
      this.clientData(),
      this.serviceData(),
      this.locationData(),
      this.technicalData()
    );
    await navigator.clipboard.writeText(text);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  onWhatsApp(): void {
    const text = this.formatter.buildWhatsAppText(
      this.clientData(),
      this.serviceData(),
      this.locationData(),
      this.technicalData()
    );
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
