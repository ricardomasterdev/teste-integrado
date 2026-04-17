import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BeneficioService } from '../../core/services/beneficio.service';
import { Beneficio } from '../../core/models/models';

@Component({
  selector: 'app-transfer-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>compare_arrows</mat-icon>
      Transferir valor entre benefícios
    </h2>

    <mat-dialog-content>
      <p class="text-muted small">
        Operação atômica com locking pessimista. Rollback automático em caso de falha.
      </p>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>De (origem)</mat-label>
          <mat-select formControlName="fromId" required>
            @for (b of beneficios; track b.id) {
              <mat-option [value]="b.id">
                #{{ b.id }} — {{ b.nome }} ({{ b.valor | currency:'BRL' }})
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Para (destino)</mat-label>
          <mat-select formControlName="toId" required>
            @for (b of beneficios; track b.id) {
              <mat-option [value]="b.id" [disabled]="b.id === form.value.fromId">
                #{{ b.id }} — {{ b.nome }} ({{ b.valor | currency:'BRL' }})
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Valor a transferir</mat-label>
          <span matTextPrefix>R$&nbsp;</span>
          <input matInput type="number" step="0.01" min="0.01" formControlName="amount" required>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary"
              (click)="save()" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Processando...' : 'Transferir' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    mat-dialog-title { display: flex; align-items: center; gap: 8px; }
    .small { font-size: 0.85rem; margin: 0 0 12px; }
  `]
})
export class TransferDialogComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(BeneficioService);
  private ref    = inject(MatDialogRef<TransferDialogComponent>);
  private snack  = inject(MatSnackBar);

  beneficios: Beneficio[] = [];
  loading = signal(false);

  form = this.fb.nonNullable.group({
    fromId: [null as number | null, Validators.required],
    toId:   [null as number | null, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: Beneficio[]) {
    this.beneficios = data ?? [];
  }

  ngOnInit() {
    if (!this.beneficios.length) {
      this.svc.list(undefined, 0, 100).subscribe(p => this.beneficios = p.content);
    }
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (v.fromId === v.toId) {
      this.snack.open('Origem e destino não podem ser iguais', 'Ok', { duration: 3500 });
      return;
    }
    this.loading.set(true);
    this.svc.transfer({ fromId: v.fromId!, toId: v.toId!, amount: v.amount })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.snack.open('Transferência concluída', 'Ok', { duration: 2500 });
          this.ref.close(true);
        },
        error: () => this.loading.set(false)
      });
  }
}
