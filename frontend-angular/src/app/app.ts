import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly auth = inject(AuthService);

  readonly usuario = this.auth.usuario;
  readonly autenticado = this.auth.autenticado;
  readonly puedeEditar = this.auth.puedeEditar;
  readonly esAdmin = this.auth.esAdmin;
  readonly rolEtiqueta = computed(() => this.etiqueta(this.auth.rol()));
  readonly inicial = computed(() => this.rolEtiqueta().charAt(0));

  private etiqueta(rol: string): string {
    const mapa: Record<string, string> = {
      visitante: 'Visitante',
      registrado: 'Usuario',
      editor: 'Editor',
      admin: 'Administrador',
    };
    return mapa[rol] ?? 'Visitante';
  }

  cerrarSesion(): void {
    this.auth.logout();
  }
}
