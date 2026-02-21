// src/app/features/installation/steps/service-info.ts

import { Component, inject, output, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceType } from '../../../core/models/client.model';
import { InstallationFormService } from '../installation-form';

@Component({
  selector: 'app-service-info',
  imports: [ReactiveFormsModule],
  templateUrl: './service-info.html',
  styleUrl: './service-info.css',
})
export class ServiceInfo implements OnInit {

  readonly formCompleted = output<void>();
  readonly goBack = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly formService = inject(InstallationFormService);

  readonly form = this.fb.group({
    serviceType: this.fb.control<ServiceType>('fiber', Validators.required),
    hasInternet: this.fb.control<boolean>(true),
    mbps:        this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    hasTv:       this.fb.control<boolean>(false),
    tvCount:     this.fb.control<number | null>(null),
  });

  // Signals para controlar visibilidad
  readonly isFiber = signal(true);
  readonly showMbps = signal(true);
  readonly hasTv = signal(false);

  ngOnInit(): void {
    // Primero restaurar datos guardados
    const saved = this.formService.serviceData();
    if (saved) {
      this.form.patchValue(saved);
    }

    // Sincronizar signals con el estado actual del form
    this.syncSignals();

    // Aplicar validaciones según el estado restaurado
    this.updateMbpsValidation();
    if (this.hasTv()) {
      this.form.controls.tvCount.setValidators([Validators.required, Validators.min(1)]);
      this.form.controls.tvCount.updateValueAndValidity();
    }

    // Escuchar cambios del form para mantener signals sincronizados
    this.form.valueChanges.subscribe(() => this.syncSignals());
  }

  private syncSignals(): void {
    const fiber = this.form.controls.serviceType.value === 'fiber';
    const internet = this.form.controls.hasInternet.value === true;
    const tv = this.form.controls.hasTv.value === true;

    this.isFiber.set(fiber);
    this.hasTv.set(tv);
    this.showMbps.set(fiber ? internet : true);
  }

  onServiceTypeChange(type: ServiceType): void {
    if (type === 'radio') {
      this.form.controls.hasInternet.reset(true);
      this.form.controls.hasTv.reset(false);
      this.form.controls.tvCount.clearValidators();
      this.form.controls.tvCount.reset(null);
      this.form.controls.tvCount.updateValueAndValidity();
    }
    this.updateMbpsValidation();
  }

  onHasInternetChange(): void {
    this.updateMbpsValidation();
  }

  onHasTvChange(value: boolean): void {
    const tvCount = this.form.controls.tvCount;
    if (value) {
      tvCount.setValidators([Validators.required, Validators.min(1)]);
    } else {
      tvCount.clearValidators();
      tvCount.reset(null);
    }
    tvCount.updateValueAndValidity();
  }

  private updateMbpsValidation(): void {
    const mbps = this.form.controls.mbps;
    if (this.showMbps()) {
      mbps.setValidators([Validators.required, Validators.min(1)]);
    } else {
      mbps.clearValidators();
      mbps.reset(null);
    }
    mbps.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.formService.saveServiceData({
      serviceType: this.form.controls.serviceType.value!,
      hasInternet: this.form.controls.hasInternet.value ?? true,
      mbps:        this.form.controls.mbps.value,
      hasTv:       this.form.controls.hasTv.value ?? false,
      tvCount:     this.form.controls.tvCount.value,
    });

    this.formCompleted.emit();
  }

  onGoBack(): void {
    // Guardar los datos actuales aunque el form esté incompleto
    this.formService.saveServiceData({
      serviceType: this.form.controls.serviceType.value!,
      hasInternet: this.form.controls.hasInternet.value ?? true,
      mbps:        this.form.controls.mbps.value,
      hasTv:       this.form.controls.hasTv.value ?? false,
      tvCount:     this.form.controls.tvCount.value,
    });

    this.goBack.emit();
  }
}
