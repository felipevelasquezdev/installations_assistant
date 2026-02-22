// src/app/features/installation/installation.ts

import { Component, signal, viewChild, computed, inject } from '@angular/core';
import { ClientInfo } from './steps/client-info';
import { ServiceInfo } from './steps/service-info';
import { InstallationSummary } from './steps/installation-summary';
import { InstallationFormService } from './installation-form';

interface StepConfig {
  index: number;
  title: string;
}

const STEPS: StepConfig[] = [
  { index: 1, title: 'Informacion del cliente' },
  { index: 2, title: 'Informacion del servicio' },
];

@Component({
  selector: 'app-installation',
  imports: [ClientInfo, ServiceInfo, InstallationSummary],
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

  // totalSteps ahora es dinámico, se calcula del array STEPS
  readonly totalSteps = STEPS.length;

  readonly stepTitle = computed(() => {
    const step = STEPS.find(s => s.index === this.currentStep());
    return step?.title ?? 'Resumen de instalacion';
  });

  readonly isLastStep = computed(() => this.currentStep() > this.totalSteps);

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
