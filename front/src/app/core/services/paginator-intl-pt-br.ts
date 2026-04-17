import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

/**
 * Internacionalização do MatPaginator para português do Brasil.
 * Substitui os rótulos padrão em inglês em todas as tabelas paginadas do sistema.
 */
@Injectable()
export class PaginatorIntlPtBr extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Itens por página:';
  override nextPageLabel     = 'Próxima página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel    = 'Primeira página';
  override lastPageLabel     = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) return `0 de ${length}`;
    const total = Math.max(length, 0);
    const start = page * pageSize;
    const end   = start < total ? Math.min(start + pageSize, total) : start + pageSize;
    return `${start + 1} – ${end} de ${total}`;
  };
}
