import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Articulo } from '../../core/models';

@Component({
  selector: 'app-articulo',
  imports: [RouterLink],
  templateUrl: './articulo.html',
  styleUrl: './articulo.css',
})
export class ArticuloPagina {
  private readonly api = inject(ApiService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly auth = inject(AuthService);

  readonly puedeEditar = this.auth.puedeEditar;
  readonly articulo = signal<Articulo | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly cuerpo = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.articulo()?.html ?? ''),
  );

  private readonly titulo = toSignal(
    this.ruta.paramMap.pipe(map((p) => p.get('titulo') ?? '')),
    { initialValue: '' },
  );

  constructor() {
    const t = this.titulo();
    if (t) {
      this.api.articulo(t).subscribe({
        next: (a) => {
          this.articulo.set(a);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
    }
  }

  preguntar(): void {
    const a = this.articulo();
    if (a) {
      this.router.navigate(['/chat'], {
        queryParams: { q: `¿Qué es ${a.titulo} y para qué sirve?` },
      });
    }
  }
}
