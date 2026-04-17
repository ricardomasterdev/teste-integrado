import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PageHeaderComponent } from '../../../core/components/page-header.component';

/**
 * Tela que embarca o Swagger UI do backend dentro do próprio SGB,
 * com atalho para abrir em nova aba.
 */
@Component({
  selector: 'app-swagger',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <section class="swagger">
      <app-page-header title="API Swagger" subtitle="Documentação interativa dos endpoints REST">
        <a mat-stroked-button color="primary" [href]="swaggerUrl" target="_blank" rel="noopener">
          <mat-icon>open_in_new</mat-icon>
          Abrir em nova aba
        </a>
        <a mat-raised-button color="primary" [href]="openApiUrl" target="_blank" rel="noopener">
          <mat-icon>description</mat-icon>
          OpenAPI JSON
        </a>
      </app-page-header>

      <div class="ti-card no-padding">
        <iframe
          [src]="safeUrl"
          title="Swagger UI"
          class="swagger-frame"
          loading="lazy"
          referrerpolicy="no-referrer">
        </iframe>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .no-padding { padding: 0; overflow: hidden; }
    .swagger-frame {
      width: 100%;
      height: calc(100vh - 220px);
      min-height: 500px;
      border: 0;
      display: block;
      background: #fff;
    }
    @media (max-width: 640px) {
      .swagger-frame { height: calc(100vh - 180px); }
    }
  `]
})
export class SwaggerComponent {
  private sanitizer = inject(DomSanitizer);

  /** Path relativo para funcionar em dev e produção (mesma origem via proxy IIS). */
  readonly swaggerUrl = '/teste-integrado/swagger-ui/index.html';
  readonly openApiUrl = '/teste-integrado/v3/api-docs';
  readonly safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.swaggerUrl);
}
