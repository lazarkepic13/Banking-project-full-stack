import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const employeeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isEmployee() || authService.isAdmin()) {
    return true;
  } else {
    // Ako nije employee ili admin, preusmeri na dashboard
    router.navigate(['/dashboard']);
    return false;
  }
};

