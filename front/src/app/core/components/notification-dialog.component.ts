import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface NotificationData {
  type: NotificationType;
  title?: string;
  message: string;
  details?: string;
  code?: string;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
}

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="notif" [attr.data-type]="data.type">
      <div class="notif-header">
        <div class="icon-wrap" [class]="'icon-' + data.type">
          <mat-icon>{{ iconFor(data.type) }}</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>{{ data.title || titleFor(data.type) }}</h2>
          @if (data.code) {
            <span class="code-badge">{{ data.code }}</span>
          }
        </div>
        <button mat-icon-button class="close-btn" (click)="close(false)" aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <p class="message">{{ data.message }}</p>
        @if (data.details) {
          <pre class="details">{{ data.details }}</pre>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        @if (data.isConfirm) {
          <button mat-button (click)="close(false)">{{ data.cancelText || 'Cancelar' }}</button>
          <button mat-raised-button [color]="data.type === 'error' ? 'warn' : 'primary'"
                  (click)="close(true)" cdkFocusInitial>
            {{ data.confirmText || 'Confirmar' }}
          </button>
        } @else {
          <button mat-raised-button color="primary" (click)="close(true)" cdkFocusInitial>OK</button>
        }
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .notif {
      position: relative;
      padding: 0;
      min-width: 380px;
      max-width: 560px;
    }
    .notif-header {
      display: grid;
      grid-template-columns: 64px 1fr auto;
      align-items: center;
      gap: 14px;
      padding: 20px 20px 8px;
    }
    h2 { margin: 0; font-size: 1.15rem; font-weight: 500; letter-spacing: 0.2px; }
    .code-badge {
      display: inline-block;
      margin-top: 4px;
      font-size: 0.72rem;
      font-family: 'Roboto Mono', monospace;
      background: #eef2ff;
      color: #3949ab;
      padding: 2px 8px;
      border-radius: 6px;
      letter-spacing: 0.3px;
    }
    .close-btn { color: #6b7280; }

    .icon-wrap {
      width: 48px; height: 48px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: #fff; }
    }
    .icon-success { background: linear-gradient(135deg,#16a34a,#15803d); }
    .icon-error   { background: linear-gradient(135deg,#dc2626,#991b1b); }
    .icon-warning { background: linear-gradient(135deg,#f59e0b,#b45309); }
    .icon-info    { background: linear-gradient(135deg,#0284c7,#075985); }
    .icon-confirm { background: linear-gradient(135deg,#6366f1,#4338ca); }

    mat-dialog-content {
      padding: 8px 20px 8px 20px !important;
      max-height: 360px;
      overflow: auto;
    }
    .message {
      margin: 4px 0 0;
      font-size: 0.96rem;
      color: #374151;
      line-height: 1.5;
    }
    .details {
      margin-top: 12px;
      padding: 10px 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-family: 'Roboto Mono', monospace;
      font-size: 0.78rem;
      color: #4b5563;
      white-space: pre-wrap;
      word-break: break-word;
    }
    mat-dialog-actions {
      padding: 8px 20px 20px !important;
      gap: 8px;
    }

    /* Faixa colorida lateral segundo o tipo */
    .notif[data-type="success"] { border-left: 4px solid #16a34a; }
    .notif[data-type="error"]   { border-left: 4px solid #dc2626; }
    .notif[data-type="warning"] { border-left: 4px solid #f59e0b; }
    .notif[data-type="info"]    { border-left: 4px solid #0284c7; }
    .notif[data-type="confirm"] { border-left: 4px solid #6366f1; }
  `]
})
export class NotificationDialogComponent {
  constructor(
    private ref: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NotificationData
  ) {}

  close(result: boolean) { this.ref.close(result); }

  iconFor(type: NotificationType): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      case 'warning': return 'warning';
      case 'info':    return 'info';
      case 'confirm': return 'help';
    }
  }

  titleFor(type: NotificationType): string {
    switch (type) {
      case 'success': return 'Sucesso';
      case 'error':   return 'Erro';
      case 'warning': return 'Atenção';
      case 'info':    return 'Informação';
      case 'confirm': return 'Confirmar ação';
    }
  }
}
