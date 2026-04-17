import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DetailField {
  label: string;
  value: unknown;
  /** 'text' (default) | 'mono' | 'currency' | 'datetime' | 'chip-ok' | 'chip-err' | 'multiline' */
  type?: 'text' | 'mono' | 'currency' | 'datetime' | 'chip-ok' | 'chip-err' | 'multiline';
}

export interface DetailsDialogData {
  title: string;
  icon?: string;
  subtitle?: string;
  fields: DetailField[];
}

/**
 * Diálogo de detalhes padronizado — reutilizado em todas as listas
 * (benefícios, transferências, usuários, logs) para exibir o registro completo.
 */
@Component({
  selector: 'app-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, DatePipe, CurrencyPipe],
  template: `
    <div class="details">
      <div class="details-header">
        <div class="ico-wrap">
          <mat-icon>{{ data.icon || 'info' }}</mat-icon>
        </div>
        <div class="header-text">
          <h2 mat-dialog-title>{{ data.title }}</h2>
          @if (data.subtitle) { <small>{{ data.subtitle }}</small> }
        </div>
      </div>

      <mat-dialog-content>
        <dl class="fields">
          @for (f of data.fields; track f.label) {
            <div class="field">
              <dt>{{ f.label }}</dt>
              <dd [ngSwitch]="f.type">
                @if (f.value === null || f.value === undefined || f.value === '') {
                  <span class="empty">—</span>
                } @else {
                  <ng-container *ngSwitchCase="'mono'">
                    <code>{{ f.value }}</code>
                  </ng-container>
                  <ng-container *ngSwitchCase="'currency'">
                    {{ asNumber(f.value) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </ng-container>
                  <ng-container *ngSwitchCase="'datetime'">
                    {{ asDate(f.value) | date:'dd/MM/yyyy HH:mm:ss':'':'pt-BR' }}
                  </ng-container>
                  <ng-container *ngSwitchCase="'multiline'">
                    <pre class="multiline">{{ f.value }}</pre>
                  </ng-container>
                  <ng-container *ngSwitchCase="'chip-ok'">
                    <span class="status-chip status-ok">
                      <mat-icon>check_circle</mat-icon>{{ f.value }}
                    </span>
                  </ng-container>
                  <ng-container *ngSwitchCase="'chip-err'">
                    <span class="status-chip status-err">
                      <mat-icon>error</mat-icon>{{ f.value }}
                    </span>
                  </ng-container>
                  <ng-container *ngSwitchDefault>{{ f.value }}</ng-container>
                }
              </dd>
            </div>
          }
        </dl>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-raised-button color="primary" mat-dialog-close cdkFocusInitial>Fechar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .details { padding: 0; min-width: 340px; }
    .details-header {
      display: grid;
      grid-template-columns: 56px 1fr;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 8px;
      border-left: 4px solid #3949ab;

      .ico-wrap {
        width: 44px; height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg,#3949ab,#1a237e);
        display: flex; align-items: center; justify-content: center;
        mat-icon { color: #fff; font-size: 24px; width: 24px; height: 24px; }
      }
      h2 { margin: 0; font-size: 1.1rem; font-weight: 500; }
      small { color: #6b7280; }
    }
    mat-dialog-content { padding: 8px 20px !important; max-height: 60vh; }
    mat-dialog-actions { padding: 8px 20px 20px !important; }
    .fields {
      margin: 0;
      display: flex;
      flex-direction: column;
    }
    .field {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px dashed #e5e7eb;
      &:last-child { border-bottom: none; }
      dt { color: #6b7280; font-size: 0.82rem; font-weight: 500; }
      dd { margin: 0; color: #1f2937; font-size: 0.92rem; word-break: break-word; }
    }
    .empty { color: #9ca3af; }
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Roboto Mono', monospace;
      font-size: 0.85rem;
    }
    .multiline {
      margin: 0;
      font-family: 'Roboto Mono', monospace;
      font-size: 0.78rem;
      white-space: pre-wrap;
      word-break: break-word;
    }
    @media (max-width: 600px) {
      .field { grid-template-columns: 1fr; gap: 2px; }
    }
  `]
})
export class DetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DetailsDialogData) {}

  asNumber(v: unknown): number { return typeof v === 'number' ? v : Number(v); }
  asDate(v: unknown): string | number | Date | null {
    if (v == null) return null;
    if (v instanceof Date) return v;
    if (typeof v === 'string' || typeof v === 'number') return v;
    return String(v);
  }
}
