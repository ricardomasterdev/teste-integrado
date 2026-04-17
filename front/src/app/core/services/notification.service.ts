import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { NotificationDialogComponent, NotificationType } from '../components/notification-dialog.component';

export interface NotifyOptions {
  title?: string;
  message: string;
  details?: string;
  confirmText?: string;
  cancelText?: string;
  code?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private dialog = inject(MatDialog);

  success(opts: NotifyOptions | string): void {
    this.open('success', typeof opts === 'string' ? { message: opts } : opts);
  }

  error(opts: NotifyOptions | string): void {
    this.open('error', typeof opts === 'string' ? { message: opts } : opts);
  }

  warning(opts: NotifyOptions | string): void {
    this.open('warning', typeof opts === 'string' ? { message: opts } : opts);
  }

  info(opts: NotifyOptions | string): void {
    this.open('info', typeof opts === 'string' ? { message: opts } : opts);
  }

  confirm(opts: NotifyOptions | string): Observable<boolean> {
    const base = typeof opts === 'string' ? { message: opts } : opts;
    return this.dialog.open(NotificationDialogComponent, {
      width: '460px',
      disableClose: true,
      data: { ...base, type: 'confirm' as NotificationType, isConfirm: true }
    }).afterClosed();
  }

  private open(type: NotificationType, opts: NotifyOptions): void {
    this.dialog.open(NotificationDialogComponent, {
      width: '460px',
      autoFocus: 'dialog',
      data: { ...opts, type, isConfirm: false }
    });
  }
}
