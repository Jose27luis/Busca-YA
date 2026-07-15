import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ArticuloResumen } from '../../core/models';

@Component({
  selector: 'app-explorar',
  templateUrl: './explorar.html',
  styleUrl: './explorar.css',
})
export class Explorar {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly articulos = signal<ArticuloResumen[]>([]);
  readonly continuar = signal<string | null>(null);
  readonly cargando = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) {
      return;
    }
    this.cargando.set(true);
    this.api.articulos(30, this.continuar() ?? undefined).subscribe({
      next: (r) => {
        this.articulos.update((prev) => [...prev, ...r.articulos]);
        this.continuar.set(r.continuar);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrir(titulo: string): void {
    this.router.navigate(['/articulos', titulo]);
  }
}
