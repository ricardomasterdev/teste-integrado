import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../core/components/page-header.component';

import { BeneficioService } from '../../core/services/beneficio.service';
import { Beneficio, BeneficioTransferencia } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private svc = inject(BeneficioService);

  loading = signal(true);
  totalBeneficios = signal(0);
  totalValor      = signal(0);
  totalAtivos     = signal(0);
  totalInativos   = signal(0);
  ultimasTransf   = signal<BeneficioTransferencia[]>([]);
  topBeneficios   = signal<Beneficio[]>([]);

  ngOnInit() {
    this.svc.list({ page: 0, size: 200, sort: 'id,asc' }).subscribe(page => {
      this.totalBeneficios.set(page.totalElements);
      this.totalValor.set(page.content.reduce((s, b) => s + Number(b.valor || 0), 0));
      this.totalAtivos.set(page.content.filter(b => b.ativo).length);
      this.totalInativos.set(page.content.filter(b => !b.ativo).length);
      this.topBeneficios.set([...page.content]
        .sort((a, b) => Number(b.valor) - Number(a.valor))
        .slice(0, 5));
    });

    this.svc.transferencias({ page: 0, size: 5, sort: 'id,desc' }).subscribe(p => {
      this.ultimasTransf.set(p.content);
      this.loading.set(false);
    });
  }
}
