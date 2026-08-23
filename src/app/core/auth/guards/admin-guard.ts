import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.currentUser();

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return currentUser?.roles.some((role) => role.toLowerCase() === 'admin')
    ? true
    : router.createUrlTree(['/']);
};
