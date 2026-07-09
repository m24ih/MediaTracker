import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Functional HTTP Interceptor (Angular 17+ style).
 * Reads the JWT from localStorage and injects it as a Bearer token
 * on every outgoing HTTP request, unless no token is present.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  return next(req);
};
