// src/app/features/installation/steps/technical-info.ts

import { Component, inject, output, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TechnicalFormData } from '../installation-form';
import { StepComponent } from '../../../core/models/step.model';
import { InstallationFormService } from '../installation-form';
import { BarcodeScanner } from '../../../shared/barcode-scanner/barcode-scanner';

type ScanTarget = 'ponSn' | 'serialNumber' | null;

@Component({
  selector: 'app-technical-info',
  imports: [ReactiveFormsModule, BarcodeScanner],
  templateUrl: './technical-info.html',
  styleUrl: './technical-info.css',
})
export class TechnicalInfo implements StepComponent<TechnicalFormData>, OnInit {

  readonly formCompleted = output<void>();
  readonly goBack = output<void>();
  readonly savedData = input<TechnicalFormData | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly formService = inject(InstallationFormService);

  readonly isFiber = signal(true);
  readonly activeScanTarget = signal<ScanTarget>(null);

  readonly form = this.fb.group({
    // Fibra
    napBox:       this.fb.control<number | null>(null),
    seal:         this.fb.control<number | null>(null),
    wire:         this.fb.control<number | null>(null),
    brand:        this.fb.control<string | null>(null),
    onuType:      this.fb.control<string | null>(null),
    ponSn:        this.fb.control<string | null>(null),

    // Radio Enlace
    node:         this.fb.control<string | null>(null),
    antennaMac:   this.fb.control<string | null>(null),
    routerBrand:  this.fb.control<string | null>(null),
    serialNumber: this.fb.control<string | null>(null),
    mac:          this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    const serviceType = this.formService.serviceData()?.serviceType;
    this.isFiber.set(serviceType === 'fiber');
    this.applyValidations();

    const data = this.savedData();
    if (data) this.setData(data);
  }

  private applyValidations(): void {
    const { napBox, seal, wire, brand, onuType, ponSn, node, antennaMac, routerBrand, serialNumber, mac } = this.form.controls;

    if (this.isFiber()) {
      napBox.setValidators([Validators.required, Validators.min(1)]);
      seal.setValidators([Validators.required, Validators.min(1)]);
      wire.setValidators([Validators.required, Validators.min(1)]);
      brand.setValidators(Validators.required);
      onuType.setValidators(Validators.required);
      ponSn.setValidators(Validators.required);

      node.clearValidators();
      antennaMac.clearValidators();
      routerBrand.clearValidators();
      serialNumber.clearValidators();
      mac.clearValidators();

      node.reset(null);
      antennaMac.reset(null);
      routerBrand.reset(null);
      serialNumber.reset(null);
      mac.reset(null);
    } else {
      node.setValidators(Validators.required);
      antennaMac.setValidators(Validators.required);
      routerBrand.setValidators(Validators.required);
      serialNumber.setValidators(Validators.required);

      napBox.clearValidators();
      seal.clearValidators();
      wire.clearValidators();
      brand.clearValidators();
      onuType.clearValidators();
      ponSn.clearValidators();

      napBox.reset(null);
      seal.reset(null);
      wire.reset(null);
      brand.reset(null);
      onuType.reset(null);
      ponSn.reset(null);
    }

    Object.values(this.form.controls).forEach(c => c.updateValueAndValidity());
  }

  getData(): TechnicalFormData {
    return {
      napBox:       this.form.controls.napBox.value,
      seal:         this.form.controls.seal.value,
      wire:         this.form.controls.wire.value,
      brand:        this.form.controls.brand.value,
      onuType:      this.form.controls.onuType.value,
      ponSn:        this.form.controls.ponSn.value,
      node:         this.form.controls.node.value,
      antennaMac:   this.form.controls.antennaMac.value,
      routerBrand:  this.form.controls.routerBrand.value,
      serialNumber: this.form.controls.serialNumber.value,
      mac:          this.form.controls.mac.value,
    };
  }

  setData(data: TechnicalFormData): void {
    this.form.patchValue(data);
  }

  openScanner(target: ScanTarget): void {
    this.activeScanTarget.set(target);
  }

  onScanned(value: string): void {
    const target = this.activeScanTarget();
    if (target) {
      this.form.controls[target].setValue(value);
      this.form.controls[target].markAsDirty();
    }
    this.activeScanTarget.set(null);
  }

  onScanCancelled(): void {
    this.activeScanTarget.set(null);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.formCompleted.emit();
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
