import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ArticuloResumen } from '../../core/models';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly consulta = signal('');
  readonly destacados = signal<ArticuloResumen[]>([]);

  private readonly sugerencias = [
    'riesgos de que la IA supere a los humanos',
    'cómo aprende una máquina sola',
    'inteligencia artificial que compone música',
  ];
  readonly chips = this.sugerencias;

  constructor() {
    this.api.articulos(6).subscribe({
      next: (r) => this.destacados.set(r.articulos.slice(0, 3)),
      error: () => this.destacados.set([]),
    });
  }

  buscar(termino?: string): void {
    const q = (termino ?? this.consulta()).trim();
    if (q) {
      this.router.navigate(['/buscar'], { queryParams: { q } });
    }
  }

  abrir(titulo: string): void {
    this.router.navigate(['/articulos', titulo]);
  }
}
