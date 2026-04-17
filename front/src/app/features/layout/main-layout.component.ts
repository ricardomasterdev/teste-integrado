import { Component, inject, signal, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem { path: string; icon: string; label: string; }
interface MenuSection { title?: string; items: MenuItem[]; }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, RouterOutlet,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, MatDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private bp = inject(BreakpointObserver);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  /** Menu agrupado em seções — Sistema separado dos demais. */
  readonly sections: MenuSection[] = [
    {
      items: [
        { path: '/app/dashboard',      icon: 'dashboard',      label: 'Painel' },
        { path: '/app/beneficios',     icon: 'card_giftcard',  label: 'Benefícios' },
        { path: '/app/transferencias', icon: 'compare_arrows', label: 'Transferências' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { path: '/app/usuarios', icon: 'group',   label: 'Usuários' },
        { path: '/app/logs',     icon: 'history', label: 'Log de Acessos' },
      ]
    }
  ];

  readonly now = signal(new Date());
  readonly isHandset = signal(false);

  private timer?: ReturnType<typeof setInterval>;
  private bpSub?: { unsubscribe(): void };

  ngOnInit() {
    this.timer = setInterval(() => this.now.set(new Date()), 1000);
    this.bpSub = this.bp
      .observe([Breakpoints.Handset, Breakpoints.Small])
      .subscribe(r => this.isHandset.set(r.matches));
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.bpSub?.unsubscribe();
  }

  toggleSidenav() { this.sidenav?.toggle(); }

  onNavItemClick() {
    if (this.isHandset()) this.sidenav?.close();
  }

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
