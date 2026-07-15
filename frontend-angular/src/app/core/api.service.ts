import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Articulo,
  ListaArticulos,
  RespuestaChat,
  ResultadoSemantico,
  Sesion,
  Usuario,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = isPlatformServer(inject(PLATFORM_ID))
    ? environment.apiBaseServer
    : environment.apiBase;

  articulos(limite = 12, continuar?: string): Observable<ListaArticulos> {
    let url = `${this.base}/articulos?limit=${limite}`;
    if (continuar) {
      url += `&continuar=${encodeURIComponent(continuar)}`;
    }
    return this.http.get<ListaArticulos>(url);
  }

  articulo(titulo: string): Observable<Articulo> {
    return this.http.get<Articulo>(`${this.base}/articulos/${encodeURIComponent(titulo)}`);
  }

  busquedaSemantica(q: string, k = 10): Observable<{ resultados: ResultadoSemantico[] }> {
    return this.http.post<{ resultados: ResultadoSemantico[] }>(`${this.base}/busqueda-semantica`, {
      q,
      k,
    });
  }

  chat(pregunta: string): Observable<RespuestaChat> {
    return this.http.post<RespuestaChat>(`${this.base}/chat`, { pregunta });
  }

  login(email: string, password: string): Observable<Sesion> {
    return this.http.post<Sesion>(`${this.base}/login`, { email, password });
  }

  registro(name: string, email: string, password: string): Observable<Sesion> {
    return this.http.post<Sesion>(`${this.base}/register`, { name, email, password });
  }

  me(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/me`);
  }

  logout(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.base}/logout`, {});
  }

  asistente(accion: string, texto: string): Observable<{ resultado: string }> {
    return this.http.post<{ resultado: string }>(`${this.base}/asistente/redaccion`, {
      accion,
      texto,
    });
  }

  estadisticasAdmin(): Observable<EstadisticasAdmin> {
    return this.http.get<EstadisticasAdmin>(`${this.base}/admin/estadisticas`);
  }
}

export interface EstadisticasAdmin {
  articulos_wiki: number;
  ediciones_wiki: number;
  articulos_indexados: number;
  fragmentos_vectoriales: number;
  modelo_embeddings: string | null;
}
