// src/app/features/installation/installation.ts

import { Component, signal } from '@angular/core';
import { ClientInfo } from './steps/client-info';
import { ServiceInfo } from './steps/service-info';

@Component({
  selector: 'app-installation',
  imports: [ClientInfo, ServiceInfo],
  templateUrl: './installation.html',
  styleUrl: './installation.css',
})
export class Installation {
  readonly currentStep = signal(1);

  nextStep(): void {
    this.currentStep.update(step => step + 1);
  }

  prevStep(): void {
    this.currentStep.update(step => step - 1);
  }
}
