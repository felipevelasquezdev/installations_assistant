// src/app/features/installation/steps/technical-info.ts

import { Component, inject, output, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TechnicalFormData } from '../installation-form';
import { StepComponent } from '../../../core/models/step.model';
import { InstallationFormService } from '../installation-form';

@Component({
  selector: 'app-technical-info',
  imports: [ReactiveFormsModule],
  templateUrl: './technical-info.html',
  styleUrl: './technical-info.css',
})
export class TechnicalInfo implements StepComponent<TechnicalFormData>, OnInit {

  readonly formCompleted = output<void>();
  readonly goBack = output<void>();
  readonly savedData = input<TechnicalFormData | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly formService = inject(InstallationFormService);

  // Necesitamos saber el tipo de servicio del step 2
  readonly isFiber = signal(true);

  readonly form = this.fb.group({
    seal: this.fb.control<number | null>(null),
    wire: this.fb.control<number | null>(null),
    node: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    // Leer el tipo de servicio guardado en el step 2
    const serviceType = this.formService.serviceData()?.serviceType;
    this.isFiber.set(serviceType === 'fiber');

    // Aplicar validaciones según el tipo de servicio
    this.applyValidations();

    const data = this.savedData();
    if (data) this.setData(data);
  }

  private applyValidations(): void {
    const { seal, wire, node } = this.form.controls;

    if (this.isFiber()) {
      seal.setValidators([Validators.required, Validators.min(1)]);
      wire.setValidators([Validators.required, Validators.min(1)]);
      node.clearValidators();
      node.reset(null);
    } else {
      node.setValidators(Validators.required);
      seal.clearValidators();
      wire.clearValidators();
      seal.reset(null);
      wire.reset(null);
    }

    seal.updateValueAndValidity();
    wire.updateValueAndValidity();
    node.updateValueAndValidity();
  }

  getData(): TechnicalFormData {
    return {
      seal: this.form.controls.seal.value,
      wire: this.form.controls.wire.value,
      node: this.form.controls.node.value,
    };
  }

  setData(data: TechnicalFormData): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.formCompleted.emit();
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
