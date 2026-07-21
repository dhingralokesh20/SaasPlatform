import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = async(route, state) => {
  const authState = inject(AuthState);
  const router = inject(Router);

  while (!authState.isReady()) {
    await new Promise((r) => setTimeout(r, 50));
  }
  
  if (authState.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
