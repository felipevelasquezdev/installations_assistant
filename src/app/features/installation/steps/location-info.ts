// src/app/features/installation/steps/location-info.ts

import { Component, inject, output, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationType } from '../../../core/models/client.model';
import { LocationFormData } from '../installation-form';
import { StepComponent } from '../../../core/models/step.model';

@Component({
  selector: 'app-location-info',
  imports: [ReactiveFormsModule],
  templateUrl: './location-info.html',
  styleUrl: './location-info.css',
})
export class LocationInfo implements StepComponent<LocationFormData>, OnInit {

  readonly formCompleted = output<void>();
  readonly goBack = output<void>();
  readonly savedData = input<LocationFormData | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    locationType:       this.fb.control<LocationType>('neighborhood', Validators.required),
    locationName:       this.fb.control('', Validators.required),
    addressOrReference: this.fb.control('', Validators.required),
  });

  get isNeighborhood(): boolean {
    return this.form.controls.locationType.value === 'neighborhood';
  }

  get locationNameLabel(): string {
    return this.isNeighborhood ? 'Barrio' : 'Vereda';
  }

  get addressLabel(): string {
    return this.isNeighborhood ? 'Direccion completa' : 'Referencia de ubicacion';
  }

  get addressPlaceholder(): string {
    return this.isNeighborhood
      ? 'Ej: Calle 10 # 5-23'
      : 'Ej: A 200 metros de la escuela, casa roja';
  }

  ngOnInit(): void {
    const data = this.savedData();
    if (data) this.setData(data);
  }

  getData(): LocationFormData {
    return {
      locationType:       this.form.controls.locationType.value!,
      locationName:       this.form.controls.locationName.value ?? '',
      addressOrReference: this.form.controls.addressOrReference.value ?? '',
    };
  }

  setData(data: LocationFormData): void {
    this.form.patchValue(data);
  }

  onLocationTypeChange(type: LocationType): void {
    this.form.controls.locationName.reset('');
    this.form.controls.addressOrReference.reset('');
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.formCompleted.emit();
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
