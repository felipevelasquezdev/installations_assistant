// src/app/features/installation/steps/client-info.ts

import { Component, inject, output, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientType } from '../../../core/models/client.model';
import { ClientFormData } from '../installation-form';
import { StepComponent } from '../../../core/models/step.model';

@Component({
  selector: 'app-client-info',
  imports: [ReactiveFormsModule],
  templateUrl: './client-info.html',
  styleUrl: './client-info.css',
})
export class ClientInfo implements StepComponent<ClientFormData>, OnInit {

  readonly formCompleted = output<void>();
  readonly savedData = input<ClientFormData | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    clientType:  this.fb.control<ClientType>('natural', Validators.required),
    firstName:   this.fb.control('', Validators.required),
    lastName:    this.fb.control('', Validators.required),
    companyName: this.fb.control(''),
    phone:       this.fb.control('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/)
    ]),
    email:       this.fb.control('', [
      Validators.required,
      Validators.email,
    ]),
  });

  get isNatural(): boolean {
    return this.form.controls.clientType.value === 'natural';
  }

  ngOnInit(): void {
    const data = this.savedData();
    if (data) this.setData(data);
  }

  getData(): ClientFormData {
    return {
      clientType:  this.form.controls.clientType.value!,
      firstName:   this.form.controls.firstName.value ?? '',
      lastName:    this.form.controls.lastName.value ?? '',
      companyName: this.form.controls.companyName.value ?? '',
      phone:       this.form.controls.phone.value ?? '',
      email:       this.form.controls.email.value ?? '',
    };
  }

  setData(data: ClientFormData): void {
    this.form.patchValue(data);
    this.onClientTypeChange(data.clientType);
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
    this.formCompleted.emit();
  }
}
