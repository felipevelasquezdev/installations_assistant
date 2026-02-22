// src/app/features/installation/steps/location-info.ts

import {
  Component, inject, output, input,
  OnInit, OnDestroy, AfterViewInit,
  signal, ElementRef, viewChild, NgZone
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocationType } from '../../../core/models/client.model';
import { LocationFormData } from '../installation-form';
import { StepComponent } from '../../../core/models/step.model';
import * as L from 'leaflet';

const MAP_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_LAT = 5.6338;
const DEFAULT_LNG = -73.5235;
const DEFAULT_ZOOM = 15;

@Component({
  selector: 'app-location-info',
  imports: [ReactiveFormsModule],
  templateUrl: './location-info.html',
  styleUrl: './location-info.css',
})
export class LocationInfo implements StepComponent<LocationFormData>, OnInit, AfterViewInit, OnDestroy {

  readonly formCompleted = output<void>();
  readonly goBack = output<void>();
  readonly savedData = input<LocationFormData | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly ngZone = inject(NgZone);

  readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  readonly isLoadingLocation = signal(false);
  readonly locationError = signal<string | null>(null);
  readonly locationConfirmed = signal(false);
  readonly requiresManualConfirmation = signal(false);

  readonly latitudeDisplay = signal<string>('');
  readonly longitudeDisplay = signal<string>('');

  readonly form = this.fb.group({
    locationType:       this.fb.control<LocationType>('neighborhood', Validators.required),
    locationName:       this.fb.control('', Validators.required),
    addressOrReference: this.fb.control('', Validators.required),
    latitude:           this.fb.control<number | null>(null, Validators.required),
    longitude:          this.fb.control<number | null>(null, Validators.required),
  });

  // El formulario es válido solo si tiene coordenadas confirmadas
  get canSubmit(): boolean {
    return this.form.valid && this.locationConfirmed();
  }

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

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 150);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  private initMap(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const savedLat = this.form.controls.latitude.value;
    const savedLng = this.form.controls.longitude.value;

    const initialLat = savedLat ?? DEFAULT_LAT;
    const initialLng = savedLng ?? DEFAULT_LNG;

    this.map = L.map(container, {
      center: [initialLat, initialLng],
      zoom: DEFAULT_ZOOM,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: MAP_ICON,
    }).addTo(this.map);

    this.map.invalidateSize();

    this.ngZone.runOutsideAngular(() => {

      this.marker!.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.ngZone.run(() => {
          this.setCoordinates(pos.lat, pos.lng);
          // Al mover el marcador manualmente se resetea la confirmación
          if (this.requiresManualConfirmation()) {
            this.locationConfirmed.set(false);
          }
        });
      });

      this.map!.on('click', (e: L.LeafletMouseEvent) => {
        this.ngZone.run(() => {
          this.updateMarkerPosition(e.latlng.lat, e.latlng.lng);
          this.setCoordinates(e.latlng.lat, e.latlng.lng);
          if (this.requiresManualConfirmation()) {
            this.locationConfirmed.set(false);
          }
        });
      });

    });

    if (savedLat !== null && savedLng !== null) {
      this.setCoordinates(savedLat, savedLng);
      // Si ya tenía datos guardados, la ubicación ya fue confirmada antes
      this.locationConfirmed.set(true);
    } else {
      this.getCurrentLocation();
    }
  }

  private getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('Tu dispositivo no soporta geolocalizacion');
      this.requiresManualConfirmation.set(true);
      return;
    }

    this.isLoadingLocation.set(true);
    this.locationError.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.ngZone.run(() => {
          this.updateMarkerPosition(latitude, longitude);
          this.setCoordinates(latitude, longitude);
          this.isLoadingLocation.set(false);
          // Permiso concedido: confirmar automáticamente
          this.locationConfirmed.set(true);
          this.requiresManualConfirmation.set(false);
        });
      },
      () => {
        this.ngZone.run(() => {
          this.isLoadingLocation.set(false);
          this.locationError.set('No se pudo obtener tu ubicacion automaticamente');
          // Permiso denegado: requiere confirmación manual
          this.requiresManualConfirmation.set(true);
          this.locationConfirmed.set(false);
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  private updateMarkerPosition(lat: number, lng: number): void {
    if (!this.map || !this.marker) return;
    this.marker.setLatLng([lat, lng]);
    this.map.setView([lat, lng], DEFAULT_ZOOM);
    this.map.invalidateSize();
  }

  private setCoordinates(lat: number, lng: number): void {
    this.form.controls.latitude.setValue(lat);
    this.form.controls.longitude.setValue(lng);
    this.latitudeDisplay.set(lat.toFixed(6));
    this.longitudeDisplay.set(lng.toFixed(6));
  }

  onConfirmLocation(): void {
    this.locationConfirmed.set(true);
  }

  onRetryLocation(): void {
    this.locationConfirmed.set(false);
    this.getCurrentLocation();
  }

  getData(): LocationFormData {
    return {
      locationType:       this.form.controls.locationType.value!,
      locationName:       this.form.controls.locationName.value ?? '',
      addressOrReference: this.form.controls.addressOrReference.value ?? '',
      latitude:           this.form.controls.latitude.value,
      longitude:          this.form.controls.longitude.value,
    };
  }

  setData(data: LocationFormData): void {
    this.form.patchValue(data);
    if (data.latitude !== null && data.longitude !== null) {
      this.latitudeDisplay.set(data.latitude.toFixed(6));
      this.longitudeDisplay.set(data.longitude.toFixed(6));
    }
  }

  onLocationTypeChange(type: LocationType): void {
    this.form.controls.locationName.reset('');
    this.form.controls.addressOrReference.reset('');
  }

  onSubmit(): void {
    if (!this.canSubmit) return;
    this.formCompleted.emit();
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
