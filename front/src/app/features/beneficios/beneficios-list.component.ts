import { AfterViewInit, Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { BeneficioService } from '../../core/services/beneficio.service';
import { Beneficio } from '../../core/models/models';
import { BeneficioDialogComponent } from './beneficio-dialog.component';
import { TransferDialogComponent } from './transfer-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-beneficios-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatDialogModule, MatProgressBarModule, MatChipsModule, MatTooltipModule
  ],
  templateUrl: './beneficios-list.component.html',
  styleUrl: './beneficios-list.component.scss'
})
export class BeneficiosListComponent implements AfterViewInit {
  private svc    = inject(BeneficioService);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);

  displayed = ['id', 'nome', 'descricao', 'valor', 'ativo', 'acoes'];
  data = new MatTableDataSource<Beneficio>([]);
  total = signal(0);
  loading = signal(false);
  page = 0;
  size = 10;
  filter = '';

  private filter$ = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.filter$.pipe(debounceTime(300)).subscribe(() => { this.page = 0; this.load(); });
  }

  ngAfterViewInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.list(this.filter, this.page, this.size).subscribe({
      next: p => {
        this.data.data = p.content;
        this.total.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPage(e: PageEvent) {
    this.page = e.pageIndex;
    this.size = e.pageSize;
    this.load();
  }

  onFilterChange(v: string) { this.filter = v; this.filter$.next(v); }

  openForm(b?: Beneficio) {
    this.dialog.open(BeneficioDialogComponent, { width: '520px', data: b })
      .afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(b: Beneficio) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Remover benefício',
              message: `Confirma remoção de "${b.nome}"?` }
    }).afterClosed().subscribe(ok => {
      if (!ok || !b.id) return;
      this.svc.delete(b.id).subscribe(() => {
        this.snack.open('Benefício removido', 'Ok', { duration: 2500 });
        this.load();
      });
    });
  }

  openTransfer() {
    this.dialog.open(TransferDialogComponent, { width: '560px', data: this.data.data })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}
