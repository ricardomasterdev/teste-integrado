import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BeneficioService } from '../../core/services/beneficio.service';
import { BeneficioTransferencia } from '../../core/models/models';
import { PageHeaderComponent } from '../../core/components/page-header.component';
import { DetailsDialogComponent } from '../../core/components/details-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-transferencias-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule,
    MatChipsModule, MatIconModule, MatProgressBarModule,
    MatDialogModule, MatButtonModule, MatTooltipModule,
    PageHeaderComponent
  ],
  templateUrl: './transferencias-list.component.html',
  styleUrl: './transferencias-list.component.scss'
})
export class TransferenciasListComponent implements OnInit {
  private svc    = inject(BeneficioService);
  private dialog = inject(MatDialog);

  displayed = ['id', 'origem', 'destino', 'valor', 'usuario', 'status', 'mensagem', 'data', 'acoes'];
  rows = signal<BeneficioTransferencia[]>([]);
  total = signal(0);
  loading = signal(false);
  page = 0;
  size = 20;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.transferencias({ page: this.page, size: this.size, sort: 'id,desc' }).subscribe({
      next: p => { this.rows.set(p.content); this.total.set(p.totalElements); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex; this.size = e.pageSize; this.load(); }

  chipColor(status: string): 'primary' | 'warn' {
    return status === 'SUCCESS' ? 'primary' : 'warn';
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'SUCCESS':              return 'Sucesso';
      case 'FAILED_INSUFFICIENT':  return 'Saldo insuficiente';
      case 'FAILED_LOCK':          return 'Conflito de concorrência';
      case 'FAILED_VALIDATION':    return 'Validação';
      case 'FAILED':               return 'Falha';
      default:                     return status;
    }
  }

  statusIcon(status: string): string {
    return status === 'SUCCESS' ? 'check_circle' : 'error';
  }

  openDetails(t: BeneficioTransferencia) {
    this.dialog.open(DetailsDialogComponent, {
      width: '560px',
      data: {
        title: 'Transferência #' + t.id,
        subtitle: 'Registro da operação',
        icon: 'compare_arrows',
        fields: [
          { label: 'ID',          value: t.id,                 type: 'mono' },
          { label: 'Origem',      value: (t.beneficioOrigemNome || '—')
                                         + ' (#' + (t.beneficioOrigemId ?? '—') + ')' },
          { label: 'Destino',     value: (t.beneficioDestinoNome || '—')
                                         + ' (#' + (t.beneficioDestinoId ?? '—') + ')' },
          { label: 'Valor',       value: t.valor,              type: 'currency' },
          { label: 'Usuário',     value: t.usuario },
          { label: 'Status',      value: this.statusLabel(t.status),
                                  type: t.status === 'SUCCESS' ? 'chip-ok' : 'chip-err' },
          { label: 'Mensagem',    value: t.mensagem,           type: 'multiline' },
          { label: 'Realizada em', value: t.createdAt,         type: 'datetime' }
        ]
      }
    });
  }
}
