// src/app/features/installation/steps/extra-data/extra-data.ts

import { Component, inject, output, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ExtraFormData } from '../../installation-form';
import { StepComponent } from '../../../../core/models/step.model';

@Component({
  selector: 'app-extra-data',
  imports: [ReactiveFormsModule],
  templateUrl: './extra-data.html',
})
export class ExtraData implements StepComponent<ExtraFormData>, OnInit {

  readonly formCompleted = output<void>();
  readonly goBack = output<void>();
  readonly savedData = input<ExtraFormData | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    observations: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    const data = this.savedData();
    if (data) this.setData(data);
  }

  getData(): ExtraFormData {
    return {
      observations: this.form.controls.observations.value || null,
    };
  }

  setData(data: ExtraFormData): void {
    this.form.patchValue(data);
  }

  onSubmit(): void {
    this.formCompleted.emit();
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
