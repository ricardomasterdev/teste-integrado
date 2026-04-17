import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/models';

const STORAGE_KEY = 'ti.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly _session = signal<LoginResponse | null>(this.restore());
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly user = computed(() => this._session());

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/v1/auth/login`, req)
      .pipe(tap(r => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
        this._session.set(r);
      }));
  }

  logout(redirect = true): void {
    localStorage.removeItem(STORAGE_KEY);
    this._session.set(null);
    if (redirect) this.router.navigate(['/login']);
  }

  token(): string | null { return this._session()?.token ?? null; }

  private restore(): LoginResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as LoginResponse; } catch { return null; }
  }
}
