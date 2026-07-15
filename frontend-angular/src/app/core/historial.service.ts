import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { ConsultaHistorial } from './models';

const CLAVE = 'buscaya_historial';
const LIMITE = 30;

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  readonly consultas = signal<ConsultaHistorial[]>(this.leer());

  agregar(pregunta: string, respuesta: string): void {
    const item: ConsultaHistorial = {
      pregunta,
      respuesta: respuesta.slice(0, 200),
      fecha: new Date().toISOString(),
    };
    const nuevas = [item, ...this.consultas()].slice(0, LIMITE);
    this.consultas.set(nuevas);
    this.escribir(nuevas);
  }

  limpiar(): void {
    this.consultas.set([]);
    if (this.esNavegador) {
      localStorage.removeItem(CLAVE);
    }
  }

  private leer(): ConsultaHistorial[] {
    if (!this.esNavegador) {
      return [];
    }
    try {
      const crudo = localStorage.getItem(CLAVE);
      const datos = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  private escribir(datos: ConsultaHistorial[]): void {
    if (this.esNavegador) {
      localStorage.setItem(CLAVE, JSON.stringify(datos));
    }
  }
}
