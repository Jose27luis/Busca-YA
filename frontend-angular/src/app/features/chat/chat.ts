import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { HistorialService } from '../../core/historial.service';

interface Mensaje {
  rol: 'usuario' | 'asistente';
  texto: string;
  fuentes?: string[];
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private readonly api = inject(ApiService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly historial = inject(HistorialService);

  readonly mensajes = signal<Mensaje[]>([]);
  readonly entrada = signal('');
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly vacio = computed(() => this.mensajes().length === 0 && !this.cargando());

  readonly sugerencias = [
    '¿Qué es RAG y cómo lo usa el chatbot?',
    '¿Qué riesgos éticos plantea la inteligencia artificial?',
    '¿Cómo funciona el aprendizaje profundo?',
  ];

  constructor() {
    const q = this.ruta.snapshot.queryParamMap.get('q');
    if (q) {
      this.entrada.set(q);
      this.enviar();
    }
  }

  enviar(texto?: string): void {
    const pregunta = (texto ?? this.entrada()).trim();
    if (!pregunta || this.cargando()) {
      return;
    }
    this.mensajes.update((m) => [...m, { rol: 'usuario', texto: pregunta }]);
    this.entrada.set('');
    this.error.set('');
    this.cargando.set(true);

    this.api.chat(pregunta).subscribe({
      next: (r) => {
        this.mensajes.update((m) => [
          ...m,
          { rol: 'asistente', texto: r.respuesta, fuentes: r.fuentes },
        ]);
        this.historial.agregar(pregunta, r.respuesta);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.mensaje ?? 'No se pudo generar la respuesta.');
        this.cargando.set(false);
      },
    });
  }

  nueva(): void {
    this.mensajes.set([]);
    this.error.set('');
  }

  abrir(titulo: string): void {
    this.router.navigate(['/articulos', titulo]);
  }
}
