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

@Component({
  selector: 'app-transferencias-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule,
    MatChipsModule, MatIconModule, MatProgressBarModule,
    PageHeaderComponent
  ],
  templateUrl: './transferencias-list.component.html',
  styleUrl: './transferencias-list.component.scss'
})
export class TransferenciasListComponent implements OnInit {
  private svc = inject(BeneficioService);

  displayed = ['id', 'origem', 'destino', 'valor', 'usuario', 'status', 'mensagem', 'data'];
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
}
