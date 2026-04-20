import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

/**
 * Mostra o loader global enquanto houver qualquer chamada HTTP em andamento.
 * Exceção: a tela de login tem feedback próprio (barra de progresso) e não
 * deve ativar o overlay global — evita travas visuais quando o login falha.
 */
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  // Pula o overlay global para endpoints públicos chamados da tela de login
  if (req.url.includes('/auth/login')) {
    return next(req);
  }
  const loader = inject(LoaderService);
  loader.inc();
  return next(req).pipe(finalize(() => loader.dec()));
};
