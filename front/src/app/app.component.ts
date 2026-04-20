import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoaderOverlayComponent } from './core/components/loader-overlay.component';
import { LoaderService } from './core/services/loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderOverlayComponent],
  template: `
    <router-outlet></router-outlet>
    <app-loader-overlay></app-loader-overlay>
  `
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private loader = inject(LoaderService);

  ngOnInit(): void {
    // Pulso de loader em mudança de rota — apenas dentro da área autenticada.
    // A tela de login tem feedback próprio (barra de progresso no botão) e
    // não aciona o overlay global, evitando travas visuais durante autenticação.
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        if (this.isAuthArea(e.url)) this.loader.inc();
      } else if (e instanceof NavigationEnd) {
        if (this.isAuthArea(e.urlAfterRedirects)) this.loader.dec();
      }
    });
  }

  private isAuthArea(url: string): boolean {
    // Tudo que começa com /app é área autenticada; login/raiz não ativam loader
    return url.startsWith('/app');
  }
}
