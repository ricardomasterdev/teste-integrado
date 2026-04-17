import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { LoginLogService } from '../../../core/services/login-log.service';
import { LoginLog } from '../../../core/models/models';
import { PageHeaderComponent } from '../../../core/components/page-header.component';
import { DetailsDialogComponent } from '../../../core/components/details-dialog.component';

@Component({
  selector: 'app-logs-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatIconModule, MatProgressBarModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule,
    MatDialogModule, MatButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './logs-list.component.html',
  styleUrl: './logs-list.component.scss'
})
export class LogsListComponent implements OnInit {
  private svc    = inject(LoginLogService);
  private dialog = inject(MatDialog);

  displayed = ['id', 'usuario', 'ip', 'userAgent', 'status', 'mensagem', 'createdAt', 'acoes'];
  rows = signal<LoginLog[]>([]);
  total = signal(0);
  loading = signal(false);
  page = 0;
  size = 20;
  filterUser = '';
  filterStatus: '' | 'true' | 'false' = '';

  private filter$ = new Subject<void>();

  constructor() {
    this.filter$.pipe(debounceTime(300)).subscribe(() => { this.page = 0; this.load(); });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const filters: Record<string, string | null> = {
      username: this.filterUser?.trim() || null,
      sucesso: this.filterStatus === '' ? null : this.filterStatus
    };
    this.svc.list({ page: this.page, size: this.size, sort: 'id,desc', filters }).subscribe({
      next: p => {
        this.rows.set(p.content);
        this.total.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }
  onFilterChange() { this.filter$.next(); }

  shortUA(ua?: string): string {
    if (!ua) return '—';
    // Extrai browser/OS basicos
    const mChrome  = ua.match(/Chrome\/([\d.]+)/);
    const mFirefox = ua.match(/Firefox\/([\d.]+)/);
    const mSafari  = ua.match(/Version\/([\d.]+).*Safari/);
    const mEdge    = ua.match(/Edg\/([\d.]+)/);
    let browser = 'Navegador';
    if (mEdge)         browser = 'Edge ' + mEdge[1];
    else if (mChrome)  browser = 'Chrome ' + mChrome[1];
    else if (mFirefox) browser = 'Firefox ' + mFirefox[1];
    else if (mSafari)  browser = 'Safari ' + mSafari[1];
    const os =
      ua.includes('Windows')  ? 'Windows' :
      ua.includes('Mac OS')   ? 'macOS'  :
      ua.includes('Android')  ? 'Android':
      ua.includes('iPhone')   ? 'iOS'    :
      ua.includes('Linux')    ? 'Linux'  : '';
    return os ? `${browser} · ${os}` : browser;
  }

  openDetails(l: LoginLog) {
    this.dialog.open(DetailsDialogComponent, {
      width: '560px',
      data: {
        title: 'Acesso #' + l.id,
        subtitle: l.sucesso ? 'Login realizado com sucesso' : 'Tentativa de login mal sucedida',
        icon: l.sucesso ? 'login' : 'gpp_bad',
        fields: [
          { label: 'ID',             value: l.id,       type: 'mono' },
          { label: 'Username',       value: l.username, type: 'mono' },
          { label: 'Nome',           value: l.nome },
          { label: 'IP',             value: l.ip,       type: 'mono' },
          { label: 'Dispositivo',    value: this.shortUA(l.userAgent) },
          { label: 'User-Agent',     value: l.userAgent, type: 'multiline' },
          { label: 'Status',         value: l.sucesso ? 'Sucesso' : 'Falha',
                                     type: l.sucesso ? 'chip-ok' : 'chip-err' },
          { label: 'Mensagem',       value: l.mensagem },
          { label: 'Data / Hora',    value: l.createdAt, type: 'datetime' }
        ]
      }
    });
  }
}
