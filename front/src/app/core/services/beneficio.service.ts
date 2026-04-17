import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Beneficio, BeneficioTransferencia, PageResponse, TransferRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BeneficioService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/api/v1/beneficios`;
  private baseT = `${environment.apiBaseUrl}/api/v1/transferencias`;

  list(nome?: string, page = 0, size = 10, sort = 'id,asc'): Observable<PageResponse<Beneficio>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', sort);
    if (nome) params = params.set('nome', nome);
    return this.http.get<PageResponse<Beneficio>>(this.base, { params });
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

  transferencias(page = 0, size = 20): Observable<PageResponse<BeneficioTransferencia>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<BeneficioTransferencia>>(this.baseT, { params });
  }
}
