// src/app/features/installation/installation.ts

import { Component } from '@angular/core';
import { ClientInfo } from './steps/client-info';

@Component({
  selector: 'app-installation',
  imports: [ClientInfo],
  templateUrl: './installation.html',
  styleUrl: './installation.css',
})
export class Installation {}
