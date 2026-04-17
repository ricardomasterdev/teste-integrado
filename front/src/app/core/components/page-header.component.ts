import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Header padrão usado em toda a área autenticada:
 * título + subtítulo + slot de ações à direita.
 * Garante consistência visual em Painel, Benefícios e Transferências.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <div>
        <h2>{{ title }}</h2>
        @if (subtitle) { <p class="text-muted">{{ subtitle }}</p> }
      </div>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;

      h2 { margin: 0 0 4px; color: var(--ti-primary-dark); font-size: 1.5rem; font-weight: 500; }
      p  { margin: 0; }
      .actions { display: flex; gap: 12px; flex-wrap: wrap; }
    }
    @media (max-width: 640px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
        margin-bottom: 16px;
        h2 { font-size: 1.2rem; }
        .actions { flex-wrap: wrap; }
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
