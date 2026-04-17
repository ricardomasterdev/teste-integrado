import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const notify = inject(NotificationService);
  const token  = auth.token();

  // Rotas de login/auth nao mostram modal global — deixam o componente tratar
  const isAuthRoute = req.url.includes('/auth/login');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isAuthRoute) {
        return throwError(() => err);
      }

      if (err.status === 401 || err.status === 403) {
        if (auth.isAuthenticated()) {
          notify.warning({
            title: 'Sessão expirada',
            message: 'Sua sessão expirou ou o token é inválido. Faça login novamente para continuar.'
          });
        }
        auth.logout();
      } else if (err.status === 0) {
        notify.error({
          title: 'Falha de conexão',
          message: 'Não foi possível contatar o servidor. Verifique sua conexão e tente novamente.'
        });
      } else if (err.error?.message) {
        notify.error({
          title: titleForStatus(err.status),
          message: err.error.message,
          code: err.error.code,
          details: err.error.details?.join('\n')
        });
      } else {
        notify.error({
          title: 'Erro inesperado',
          message: `Ocorreu um erro (HTTP ${err.status}).`
        });
      }
      return throwError(() => err);
    })
  );
};

function titleForStatus(status: number): string {
  if (status === 400) return 'Dados inválidos';
  if (status === 404) return 'Não encontrado';
  if (status === 409) return 'Conflito de concorrência';
  if (status === 422) return 'Não foi possível processar';
  if (status >= 500)  return 'Erro no servidor';
  return 'Erro';
}
