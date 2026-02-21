// src/app/features/installation/steps/client-info.ts

import { Component, inject, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientType } from '../../../core/models/client.model';
import { InstallationFormService } from '../installation-form';

@Component({
  selector: 'app-client-info',
  imports: [ReactiveFormsModule],
  templateUrl: './client-info.html',
  styleUrl: './client-info.css',
})
export class ClientInfo implements OnInit {

  readonly formCompleted = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly formService = inject(InstallationFormService);

  readonly form = this.fb.group({
    clientType:  this.fb.control<ClientType>('natural', Validators.required),
    firstName:   this.fb.control('', Validators.required),
    lastName:    this.fb.control('', Validators.required),
    companyName: this.fb.control(''),
    phone:       this.fb.control('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/)
    ]),
  });

  get isNatural(): boolean {
    return this.form.controls.clientType.value === 'natural';
  }

  ngOnInit(): void {
    // Restaurar datos si el usuario volvió al paso 1
    const saved = this.formService.clientData();
    if (saved) {
      this.form.patchValue(saved);
      // Restaurar validaciones según el tipo guardado
      this.onClientTypeChange(saved.clientType);
    }
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

    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
    companyName.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    // Guardar datos antes de avanzar
    this.formService.saveClientData({
      clientType:  this.form.controls.clientType.value!,
      firstName:   this.form.controls.firstName.value ?? '',
      lastName:    this.form.controls.lastName.value ?? '',
      companyName: this.form.controls.companyName.value ?? '',
      phone:       this.form.controls.phone.value ?? '',
    });

    this.formCompleted.emit();
  }
}
