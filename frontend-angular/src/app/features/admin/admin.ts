import { Component, inject, signal } from '@angular/core';
import { ApiService, EstadisticasAdmin } from '../../core/api.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private readonly api = inject(ApiService);

  readonly stats = signal<EstadisticasAdmin | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);

  constructor() {
    this.api.estadisticasAdmin().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
}
