// src/app/shared/barcode-scanner/barcode-scanner.ts

import {
  Component, output, OnDestroy, signal, ElementRef, viewChild, AfterViewInit
} from '@angular/core';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.html',
  styles: [`
    .scanner-container {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .scan-line {
      position: absolute;
      left: 10%;
      right: 10%;
      height: 2px;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      animation: scan 2s linear infinite;
    }
    @keyframes scan {
      0%   { top: 20%; }
      50%  { top: 80%; }
      100% { top: 20%; }
    }
    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: #22c55e;
      border-style: solid;
    }
    .corner-tl { top: 15%; left: 10%; border-width: 3px 0 0 3px; }
    .corner-tr { top: 15%; right: 10%; border-width: 3px 3px 0 0; }
    .corner-bl { bottom: 15%; left: 10%; border-width: 0 0 3px 3px; }
    .corner-br { bottom: 15%; right: 10%; border-width: 0 3px 3px 0; }
  `]
})
export class BarcodeScanner implements AfterViewInit, OnDestroy {

  readonly scanned = output<string>();
  readonly cancelled = output<void>();

  readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  readonly error = signal<string | null>(null);
  readonly scanning = signal(false);

  private reader = new BrowserMultiFormatReader();

  async ngAfterViewInit(): Promise<void> {
    await this.startScanning();
  }

  private async startScanning(): Promise<void> {
    this.error.set(null);
    this.scanning.set(true);

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!devices.length) {
        this.error.set('No se encontró cámara en este dispositivo');
        this.scanning.set(false);
        return;
      }

      // Preferir cámara trasera en móvil
      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('trasera')
      ) ?? devices[devices.length - 1];

      await this.reader.decodeFromVideoDevice(
        backCamera.deviceId,
        this.videoRef().nativeElement,
        (result, err) => {
          if (result) {
            this.scanning.set(false);
            this.scanned.emit(result.getText());
            this.stopScanning();
          }
          if (err && !(err instanceof NotFoundException)) {
            this.error.set('Error al leer el código. Intenta de nuevo.');
            this.scanning.set(false);
          }
        }
      );
    } catch (e) {
      this.error.set('No se pudo acceder a la cámara. Verifica los permisos.');
      this.scanning.set(false);
    }
  }

  private stopScanning(): void {
    BrowserMultiFormatReader.releaseAllStreams();
  }

  onCancel(): void {
    this.stopScanning();
    this.cancelled.emit();
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }
}
