import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptor: HttpInterceptorFn = (req: any, next: any) => {
  // Provera da li smo u browser okruženju
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem('authToken');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};

