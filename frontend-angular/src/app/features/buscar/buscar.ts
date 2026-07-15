import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ResultadoSemantico } from '../../core/models';

type Estado = 'idle' | 'cargando' | 'ok' | 'vacio' | 'error';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.html',
  styleUrl: './buscar.css',
})
export class Buscar {
  private readonly api = inject(ApiService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly consulta = signal('');
  readonly estado = signal<Estado>('idle');
  readonly resultados = signal<ResultadoSemantico[]>([]);
  readonly errorMsg = signal('');
  readonly chips = [
    'cómo entiende el sistema el significado',
    'dónde se guardan los vectores',
    'qué tecnología usa el backend',
  ];

  constructor() {
    const q = this.ruta.snapshot.queryParamMap.get('q');
    if (q) {
      this.consulta.set(q);
      this.ejecutar();
    }
  }

  ejecutar(termino?: string): void {
    const q = (termino ?? this.consulta()).trim();
    if (!q) {
      return;
    }
    this.consulta.set(q);
    this.estado.set('cargando');
    this.resultados.set([]);
    this.api.busquedaSemantica(q, 10).subscribe({
      next: (r) => {
        this.resultados.set(r.resultados);
        this.estado.set(r.resultados.length ? 'ok' : 'vacio');
      },
      error: (e) => {
        this.errorMsg.set(e?.error?.mensaje ?? 'error de conexión');
        this.estado.set('error');
      },
    });
  }

  abrir(titulo: string): void {
    this.router.navigate(['/articulos', titulo]);
  }
}
