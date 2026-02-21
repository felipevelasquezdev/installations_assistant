// src/app/core/models/step.model.ts

export interface StepComponent<T> {
  getData(): T;
  setData(data: T): void;
}
