import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { AuthState } from '../state/auth.state';

export const authRedirectGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};