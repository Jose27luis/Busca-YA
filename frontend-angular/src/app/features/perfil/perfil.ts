import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { HistorialService } from '../../core/historial.service';

@Component({
  selector: 'app-perfil',
  imports: [RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly historial = inject(HistorialService);

  readonly usuario = this.auth.usuario;
  readonly consultas = this.historial.consultas;
  readonly inicial = computed(() => (this.usuario()?.nombre ?? 'U').charAt(0).toUpperCase());

  private readonly etiquetas: Record<string, string> = {
    registrado: 'Usuario',
    editor: 'Editor',
    admin: 'Administrador',
  };

  rolEtiqueta(): string {
    return this.etiquetas[this.usuario()?.rol ?? 'registrado'] ?? 'Usuario';
  }

  formato(fecha: string): string {
    return new Date(fecha).toLocaleString('es', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  limpiar(): void {
    this.historial.limpiar();
  }
}
