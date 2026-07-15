import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './models';

function guardConRoles(roles: Rol[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (roles.includes(auth.rol())) {
      return true;
    }
    return router.createUrlTree(['/auth']);
  };
}

export const guardAutenticado: CanActivateFn = guardConRoles(['registrado', 'editor', 'admin']);
export const guardEditor: CanActivateFn = guardConRoles(['editor', 'admin']);
export const guardAdmin: CanActivateFn = guardConRoles(['admin']);
