import { Routes } from '@angular/router';
import { guardAdmin, guardAutenticado, guardEditor } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Busca-YA',
  },
  {
    path: 'articulos',
    loadComponent: () => import('./features/explorar/explorar').then((m) => m.Explorar),
    title: 'Artículos — Busca-YA',
  },
  {
    path: 'articulos/:titulo',
    loadComponent: () => import('./features/articulo/articulo').then((m) => m.ArticuloPagina),
  },
  {
    path: 'buscar',
    loadComponent: () => import('./features/buscar/buscar').then((m) => m.Buscar),
    title: 'Búsqueda semántica — Busca-YA',
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat').then((m) => m.Chat),
    title: 'Chatbot — Busca-YA',
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth').then((m) => m.Auth),
    title: 'Acceder — Busca-YA',
  },
  {
    path: 'editor',
    loadComponent: () => import('./features/editor/editor').then((m) => m.Editor),
    canActivate: [guardEditor],
    title: 'Editor asistido — Busca-YA',
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/perfil/perfil').then((m) => m.Perfil),
    canActivate: [guardAutenticado],
    title: 'Perfil — Busca-YA',
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
    canActivate: [guardAdmin],
    title: 'Administración — Busca-YA',
  },
  { path: '**', redirectTo: '' },
];
