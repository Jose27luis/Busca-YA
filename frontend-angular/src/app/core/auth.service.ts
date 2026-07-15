import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { Rol, Sesion, Usuario } from './models';

const CLAVE = 'buscaya_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly usuario = signal<Usuario | null>(this.leerSesion()?.usuario ?? null);
  readonly rol = computed<Rol>(() => this.usuario()?.rol ?? 'visitante');
  readonly autenticado = computed(() => this.usuario() !== null);
  readonly puedeEditar = computed(() => ['editor', 'admin'].includes(this.rol()));
  readonly esAdmin = computed(() => this.rol() === 'admin');

  token(): string | null {
    return this.leerSesion()?.token ?? null;
  }

  login(email: string, password: string) {
    return this.api.login(email, password).pipe(tap((sesion) => this.guardar(sesion)));
  }

  registro(nombre: string, email: string, password: string) {
    return this.api.registro(nombre, email, password).pipe(tap((sesion) => this.guardar(sesion)));
  }

  logout(): void {
    this.api.logout().subscribe({ next: () => {}, error: () => {} });
    this.usuario.set(null);
    if (this.esNavegador) {
      localStorage.removeItem(CLAVE);
    }
  }

  private guardar(sesion: Sesion): void {
    this.usuario.set(sesion.usuario);
    if (this.esNavegador) {
      localStorage.setItem(CLAVE, JSON.stringify(sesion));
    }
  }

  private leerSesion(): Sesion | null {
    if (!this.esNavegador) {
      return null;
    }
    try {
      const crudo = localStorage.getItem(CLAVE);
      return crudo ? (JSON.parse(crudo) as Sesion) : null;
    } catch {
      return null;
    }
  }
}
