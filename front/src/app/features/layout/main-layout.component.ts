import { Component, inject, signal, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem { path: string; icon: string; label: string; }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule,
    MatDividerModule, MatExpansionModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  auth    = inject(AuthService);
  router  = inject(Router);
  private bp     = inject(BreakpointObserver);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly menu: MenuItem[] = [
    { path: '/app/dashboard',      icon: 'dashboard',      label: 'Painel' },
    { path: '/app/beneficios',     icon: 'card_giftcard',  label: 'Benefícios' },
    { path: '/app/transferencias', icon: 'compare_arrows', label: 'Transferências' },
  ];

  readonly sistemaMenu: MenuItem[] = [
    { path: '/app/usuarios', icon: 'group',   label: 'Usuários' },
    { path: '/app/logs',     icon: 'history', label: 'Log de Acessos' },
  ];

  readonly now = signal(new Date());
  readonly isHandset = signal(false);
  readonly sistemaExpanded = signal(false);

  private timer?: ReturnType<typeof setInterval>;
  private bpSub?: { unsubscribe(): void };
  private routerSub?: { unsubscribe(): void };

  ngOnInit() {
    this.timer = setInterval(() => this.now.set(new Date()), 1000);
    this.bpSub = this.bp
      .observe([Breakpoints.Handset, Breakpoints.Small])
      .subscribe(r => this.isHandset.set(r.matches));

    // Abre automaticamente o grupo "Sistema" se estivermos em uma das rotas filhas
    this.sistemaExpanded.set(this.isSistemaActive(this.router.url));
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        if (this.isSistemaActive(e.urlAfterRedirects)) this.sistemaExpanded.set(true);
      });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.bpSub?.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  toggleSistema() { this.sistemaExpanded.update(v => !v); }
  isSistemaActive(url: string): boolean {
    return this.sistemaMenu.some(i => url.startsWith(i.path));
  }

  toggleSidenav() { this.sidenav?.toggle(); }
  onNavItemClick() { if (this.isHandset()) this.sidenav?.close(); }

  logout() {
    if (this.isHandset()) this.sidenav?.close();
    this.auth.logout();
  }

  userInitials(): string {
    const nome = this.auth.user()?.nome || this.auth.user()?.username || '?';
    const parts = nome.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
