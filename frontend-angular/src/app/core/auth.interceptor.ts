import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

const CLAVE = 'buscaya_sesion';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }
  try {
    const crudo = localStorage.getItem(CLAVE);
    const token = crudo ? (JSON.parse(crudo).token as string) : null;
    if (token) {
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }
  } catch {
    /* sin sesión */
  }
  return next(req);
};
