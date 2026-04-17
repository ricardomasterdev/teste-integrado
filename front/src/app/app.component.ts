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
    // Pulso de loader em toda mudança de rota para feedback de navegação,
    // mesmo quando a rota não dispara HTTP (ex: entrar no dashboard).
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.loader.inc();
      } else if (e instanceof NavigationEnd) {
        // garante mínimo de 800ms de exibição via LoaderService
        this.loader.dec();
      }
    });
  }
}
