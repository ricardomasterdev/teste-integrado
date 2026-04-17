import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Beneficio, BeneficioTransferencia, TransferRequest } from '../models/models';
import { PageRequest, PageResponse, buildPageParams } from '../models/pagination';

@Injectable({ providedIn: 'root' })
export class BeneficioService {
  private http  = inject(HttpClient);
  private base  = `${environment.apiBaseUrl}/api/v1/beneficios`;
  private baseT = `${environment.apiBaseUrl}/api/v1/transferencias`;

  /** Listagem paginada de benefícios (server-side). */
  list(req: PageRequest = {}): Observable<PageResponse<Beneficio>> {
    return this.http.get<PageResponse<Beneficio>>(this.base, { params: buildPageParams(req) });
  }

  get(id: number): Observable<Beneficio> {
    return this.http.get<Beneficio>(`${this.base}/${id}`);
  }

  create(b: Beneficio): Observable<Beneficio> {
    return this.http.post<Beneficio>(this.base, b);
  }

  update(id: number, b: Beneficio): Observable<Beneficio> {
    return this.http.put<Beneficio>(`${this.base}/${id}`, b);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  transfer(req: TransferRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/transfer`, req);
  }

  /** Histórico/auditoria de transferências — mesmo contrato de paginação. */
  transferencias(req: PageRequest = {}): Observable<PageResponse<BeneficioTransferencia>> {
    return this.http.get<PageResponse<BeneficioTransferencia>>(this.baseT, { params: buildPageParams(req) });
  }
}
