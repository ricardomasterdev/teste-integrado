import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BeneficioService } from '../../core/services/beneficio.service';
import { Beneficio } from '../../core/models/models';

@Component({
  selector: 'app-beneficio-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSlideToggleModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data?.id ? 'edit' : 'add' }}</mat-icon>
      {{ data?.id ? 'Editar benefício' : 'Novo benefício' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="nome" maxlength="100" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="descricao" rows="2" maxlength="255"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valor</mat-label>
          <span matTextPrefix>R$&nbsp;</span>
          <input matInput type="number" step="0.01" min="0" formControlName="valor" required>
        </mat-form-field>

        <mat-slide-toggle formControlName="ativo" color="primary">
          {{ form.value.ativo ? 'Ativo' : 'Inativo' }}
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              (click)="save()" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Salvando...' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    mat-dialog-title { display: flex; align-items: center; gap: 8px; }
  `]
})
export class BeneficioDialogComponent {
  private fb     = inject(FormBuilder);
  private svc    = inject(BeneficioService);
  private ref    = inject(MatDialogRef<BeneficioDialogComponent>);
  private snack  = inject(MatSnackBar);

  loading = signal(false);
  form = this.fb.nonNullable.group({
    nome:      ['', [Validators.required, Validators.maxLength(100)]],
    descricao: [''],
    valor:     [0, [Validators.required, Validators.min(0)]],
    ativo:     [true]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data?: Beneficio) {
    if (data) {
      this.form.patchValue({
        nome: data.nome,
        descricao: data.descricao ?? '',
        valor: Number(data.valor),
        ativo: data.ativo ?? true
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const body: Beneficio = this.form.getRawValue();
    const obs = this.data?.id
      ? this.svc.update(this.data.id, body)
      : this.svc.create(body);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Salvo com sucesso', 'Ok', { duration: 2500 });
        this.ref.close(true);
      },
      error: () => this.loading.set(false)
    });
  }
}
