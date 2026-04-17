import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loader.service';

/** Mostra o loader global enquanto houver qualquer chamada HTTP em andamento. */
export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderService);
  loader.inc();
  return next(req).pipe(finalize(() => loader.dec()));
};
