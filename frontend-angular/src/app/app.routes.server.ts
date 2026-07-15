import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'articulos/:titulo', renderMode: RenderMode.Server },
  { path: 'buscar', renderMode: RenderMode.Server },
  { path: 'chat', renderMode: RenderMode.Server },
  { path: 'editor', renderMode: RenderMode.Server },
  { path: 'perfil', renderMode: RenderMode.Server },
  { path: 'admin', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];
