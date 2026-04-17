import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginLog } from '../models/models';
import { PageRequest, PageResponse, buildPageParams } from '../models/pagination';

@Injectable({ providedIn: 'root' })
export class LoginLogService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/api/v1/login-logs`;

  list(req: PageRequest = {}): Observable<PageResponse<LoginLog>> {
    return this.http.get<PageResponse<LoginLog>>(this.base, { params: buildPageParams(req) });
  }
}
