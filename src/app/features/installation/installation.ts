// src/app/features/installation/installation.ts

import { Component, signal, viewChild, computed, inject } from '@angular/core';
import { ClientInfo } from './steps/client-info';
import { ServiceInfo } from './steps/service-info';
import { InstallationFormService } from './installation-form';

@Component({
  selector: 'app-installation',
  imports: [ClientInfo, ServiceInfo],
  templateUrl: './installation.html',
  styleUrl: './installation.css',
})
export class Installation {

  private readonly formService = inject(InstallationFormService);

  readonly clientInfoRef = viewChild(ClientInfo);
  readonly serviceInfoRef = viewChild(ServiceInfo);

  readonly currentStep = signal(1);

  readonly clientData = this.formService.clientData;
  readonly serviceData = this.formService.serviceData;

  // computed deriva su valor del signal currentStep automáticamente
  readonly stepTitle = computed(() => {
    const titles: Record<number, string> = {
      1: 'Información del cliente',
      2: 'Información del servicio',
    };
    return titles[this.currentStep()] ?? '';
  });

  nextStep(): void {
    if (this.currentStep() === 1) {
      const data = this.clientInfoRef()?.getData();
      if (data) this.formService.saveClientData(data);
    }
    if (this.currentStep() === 2) {
      const data = this.serviceInfoRef()?.getData();
      if (data) this.formService.saveServiceData(data);
    }
    this.currentStep.update(step => step + 1);
  }

  prevStep(): void {
    if (this.currentStep() === 2) {
      const data = this.serviceInfoRef()?.getData();
      if (data) this.formService.saveServiceData(data);
    }
    this.currentStep.update(step => step - 1);
  }
}
