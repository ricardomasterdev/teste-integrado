import { HttpParams } from '@angular/common/http';

/**
 * Contrato unificado de paginação retornado por todos os endpoints
 * paginados do backend. Espelha o padrão do Spring Data `Page<T>`,
 * garantindo que o frontend sempre consome a mesma estrutura.
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;        // índice 0-based da página atual
  size: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  numberOfElements?: number;
  sort?: { sorted: boolean; unsorted: boolean; empty: boolean };
}

/**
 * Requisição padronizada de paginação.
 * Todos os componentes e serviços do frontend utilizam este tipo,
 * e os parâmetros são enviados ao backend no formato exato esperado
 * pelo Spring Data (Pageable): `page`, `size` e `sort=campo,direcao`.
 */
export interface PageRequest {
  page?: number;     // default 0
  size?: number;     // default 10
  sort?: string;     // ex: 'id,asc'   |   'valor,desc'
  /** Filtros livres adicionais, mergeados nos query params. */
  filters?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Monta HttpParams de paginação para enviar ao backend, já no formato Spring Data.
 * Centraliza o protocolo cliente↔servidor em um único ponto e evita divergências.
 */
export function buildPageParams(req: PageRequest = {}): HttpParams {
  let p = new HttpParams()
    .set('page', String(req.page ?? 0))
    .set('size', String(req.size ?? 10));

  if (req.sort) p = p.set('sort', req.sort);

  if (req.filters) {
    for (const [k, v] of Object.entries(req.filters)) {
      if (v === null || v === undefined || v === '') continue;
      p = p.set(k, String(v));
    }
  }
  return p;
}

/** Página vazia padrão — útil como valor inicial reativo. */
export const EMPTY_PAGE: PageResponse<never> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 0,
  first: true,
  last: true,
  empty: true
};
