import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppUser } from '../../../core/models/models';

@Component({
  selector: 'app-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatIconModule, MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEdit ? 'edit' : 'person_add' }}</mat-icon>
      {{ isEdit ? 'Editar usuário' : 'Novo usuário' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" maxlength="100" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nome completo</mat-label>
          <input matInput formControlName="nome" maxlength="150" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Perfil</mat-label>
          <mat-select formControlName="role" required>
            <mat-option value="ADMIN">Administrador</mat-option>
            <mat-option value="USER">Usuário</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>{{ isEdit ? 'Nova senha (opcional)' : 'Senha' }}</mat-label>
          <input matInput type="password" formControlName="password"
                 [required]="!isEdit" minlength="4" maxlength="255">
          <mat-hint>{{ isEdit ? 'Deixe em branco para manter a senha atual' : 'Mínimo 4 caracteres' }}</mat-hint>
        </mat-form-field>

        <mat-slide-toggle formControlName="ativo" color="primary">
          {{ form.value.ativo ? 'Usuário ativo' : 'Usuário inativo' }}
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
export class UsuarioDialogComponent {
  private fb     = inject(FormBuilder);
  private svc    = inject(UsuarioService);
  private ref    = inject(MatDialogRef<UsuarioDialogComponent>);
  private notify = inject(NotificationService);

  loading = signal(false);
  isEdit = false;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    nome:     ['', [Validators.required, Validators.maxLength(150)]],
    role:     ['USER' as 'ADMIN' | 'USER', Validators.required],
    password: [''],
    ativo:    [true]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data?: AppUser) {
    this.isEdit = !!data?.id;
    if (data) {
      this.form.patchValue({
        username: data.username,
        nome: data.nome,
        role: data.role,
        ativo: data.ativo ?? true
      });
      this.form.get('username')?.disable();
      // Em edição, senha opcional
      this.form.get('password')?.setValidators([Validators.minLength(4), Validators.maxLength(255)]);
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(4)]);
    }
  }

  save() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const v = this.form.getRawValue();

    const obs = this.isEdit && this.data?.id
      ? this.svc.update(this.data.id, {
          nome: v.nome, role: v.role, ativo: v.ativo,
          password: v.password?.trim() ? v.password : undefined
        })
      : this.svc.create({
          username: v.username, password: v.password,
          nome: v.nome, role: v.role, ativo: v.ativo
        });

    obs.subscribe({
      next: (saved) => {
        this.loading.set(false);
        this.notify.success({
          title: this.isEdit ? 'Usuário atualizado' : 'Usuário criado',
          message: `"${saved.username}" foi salvo com sucesso.`
        });
        this.ref.close(true);
      },
      error: () => this.loading.set(false)
    });
  }
}
