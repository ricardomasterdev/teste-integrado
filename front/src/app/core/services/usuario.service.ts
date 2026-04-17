import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, AppUserCreateRequest, AppUserUpdateRequest } from '../models/models';
import { PageRequest, PageResponse, buildPageParams } from '../models/pagination';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/api/v1/users`;

  list(req: PageRequest = {}): Observable<PageResponse<AppUser>> {
    return this.http.get<PageResponse<AppUser>>(this.base, { params: buildPageParams(req) });
  }

  get(id: number): Observable<AppUser> {
    return this.http.get<AppUser>(`${this.base}/${id}`);
  }

  create(req: AppUserCreateRequest): Observable<AppUser> {
    return this.http.post<AppUser>(this.base, req);
  }

  update(id: number, req: AppUserUpdateRequest): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.base}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
