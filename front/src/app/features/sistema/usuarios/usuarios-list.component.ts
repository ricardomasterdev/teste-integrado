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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppUser } from '../../../core/models/models';
import { PageHeaderComponent } from '../../../core/components/page-header.component';
import { UsuarioDialogComponent } from './usuario-dialog.component';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatDialogModule, MatProgressBarModule, MatTooltipModule,
    PageHeaderComponent
  ],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss'
})
export class UsuariosListComponent implements AfterViewInit {
  private svc    = inject(UsuarioService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  displayed = ['id', 'username', 'nome', 'role', 'ativo', 'createdAt', 'acoes'];
  data = new MatTableDataSource<AppUser>([]);
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
    this.svc.list({
      page: this.page,
      size: this.size,
      sort: 'id,asc',
      filters: { q: this.filter || null }
    }).subscribe({
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

  openForm(u?: AppUser) {
    this.dialog.open(UsuarioDialogComponent, { width: '520px', data: u })
      .afterClosed().subscribe(saved => { if (saved) this.load(); });
  }

  delete(u: AppUser) {
    this.notify.confirm({
      title: 'Remover usuário',
      message: `Confirma remoção do usuário "${u.username}" (${u.nome})?`,
      details: 'Esta operação não pode ser desfeita.',
      confirmText: 'Remover',
      cancelText: 'Cancelar'
    }).subscribe(ok => {
      if (!ok || !u.id) return;
      this.svc.delete(u.id).subscribe(() => {
        this.notify.success({
          title: 'Usuário removido',
          message: `O usuário "${u.username}" foi removido com sucesso.`
        });
        this.load();
      });
    });
  }
}
