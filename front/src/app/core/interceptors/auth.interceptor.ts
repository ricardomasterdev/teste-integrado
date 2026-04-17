import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const snack = inject(MatSnackBar);
  const token = auth.token();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        if (auth.isAuthenticated()) {
          snack.open('Sessão expirada. Faça login novamente.', 'Fechar', { duration: 4000 });
        }
        auth.logout();
      } else if (err.status === 0) {
        snack.open('Falha de conexão com o servidor.', 'Fechar', { duration: 4000 });
      } else if (err.error?.message) {
        snack.open(err.error.message, 'Fechar', { duration: 4000, panelClass: ['snack-error'] });
      }
      return throwError(() => err);
    })
  );
};
