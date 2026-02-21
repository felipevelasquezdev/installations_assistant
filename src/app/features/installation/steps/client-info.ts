// src/app/features/installation/steps/client-info.ts

import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientType } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-info',
  imports: [ReactiveFormsModule],
  templateUrl: './client-info.html',
  styleUrl: './client-info.css',
})
export class ClientInfo {

  // output() es la forma moderna de EventEmitter en Angular 21
  readonly formCompleted = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    clientType: this.fb.control<ClientType>('natural', Validators.required),
    firstName:  this.fb.control('', Validators.required),
    lastName:   this.fb.control('', Validators.required),
    companyName: this.fb.control(''),
  });

  // Getter reactivo que lee el valor del control directamente
  get isNatural(): boolean {
    return this.form.controls.clientType.value === 'natural';
  }

  onClientTypeChange(type: ClientType): void {
    const { firstName, lastName, companyName } = this.form.controls;

    if (type === 'natural') {
      firstName.setValidators(Validators.required);
      lastName.setValidators(Validators.required);
      companyName.clearValidators();
      companyName.reset('');
    } else {
      companyName.setValidators(Validators.required);
      firstName.clearValidators();
      lastName.clearValidators();
      firstName.reset('');
      lastName.reset('');
    }

    // Necesario para que Angular recalcule el estado de validación
    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
    companyName.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.formCompleted.emit();
  }
}
