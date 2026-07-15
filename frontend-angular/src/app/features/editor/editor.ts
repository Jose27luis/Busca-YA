import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../core/api.service';

type EstadoIA = 'idle' | 'cargando' | 'ok' | 'error';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class Editor {
  private readonly api = inject(ApiService);

  readonly texto = signal(
    '== Búsqueda semántica ==\n\nLa búsqueda semántica permite encontrar artículos por significado. A diferencia de la búsqueda por palabras clave, usa embeddings para comparar la intención de la consulta con el contenido.\n\nFalta ampliar los ejemplos y explicar mejor la diferencia con la búsqueda tradicional.',
  );
  readonly estado = signal<EstadoIA>('idle');
  readonly modo = signal<string>('');
  readonly resultado = signal('');
  readonly error = signal('');
  readonly guardado = signal(false);

  private readonly etiquetas: Record<string, string> = {
    redactar: 'Texto ampliado',
    resumir: 'Resumen',
    corregir: 'Texto corregido',
  };

  etiqueta(): string {
    return this.etiquetas[this.modo()] ?? '';
  }

  ejecutar(accion: string): void {
    if (!this.texto().trim() || this.estado() === 'cargando') {
      return;
    }
    this.modo.set(accion);
    this.estado.set('cargando');
    this.resultado.set('');
    this.error.set('');
    this.api.asistente(accion, this.texto()).subscribe({
      next: (r) => {
        this.resultado.set(r.resultado);
        this.estado.set('ok');
      },
      error: (e) => {
        this.error.set(e?.error?.mensaje ?? 'No se pudo generar la sugerencia.');
        this.estado.set('error');
      },
    });
  }

  aplicar(): void {
    this.texto.set(this.resultado());
    this.resultado.set('');
    this.estado.set('idle');
  }

  descartar(): void {
    this.resultado.set('');
    this.estado.set('idle');
  }

  enviar(): void {
    this.guardado.set(true);
    setTimeout(() => this.guardado.set(false), 2600);
  }
}
