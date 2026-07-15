export type Rol = 'visitante' | 'registrado' | 'editor' | 'admin';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

export interface ArticuloResumen {
  titulo: string;
  pageid: number;
}

export interface ListaArticulos {
  articulos: ArticuloResumen[];
  continuar: string | null;
}

export interface Articulo {
  titulo: string;
  titulo_html: string;
  revid: number | null;
  html: string;
  wikitext: string;
}

export interface ResultadoSemantico {
  titulo: string;
  pageid: number | null;
  score: number;
  fragmento: string;
}

export interface RespuestaChat {
  respuesta: string;
  fuentes: string[];
}

export interface ConsultaHistorial {
  pregunta: string;
  respuesta: string;
  fecha: string;
}
