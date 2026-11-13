import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, User } from '../services/auth';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard = (roles: User['role'][]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.getUser() && roles.includes(auth.getUser()!.role) ? true : router.createUrlTree(['/dashboard']);
};
