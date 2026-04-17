import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  loading = signal(false);
  hidePw  = signal(true);
  readonly year = new Date().getFullYear();

  form = this.fb.nonNullable.group({
    username: ['teste', [Validators.required]],
    password: ['123456', [Validators.required, Validators.minLength(4)]]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (r) => {
        this.loading.set(false);
        this.notify.success({
          title: `Bem-vindo, ${r.nome}!`,
          message: 'Autenticação realizada com sucesso. Redirecionando para o sistema...'
        });
        setTimeout(() => this.router.navigate(['/app']), 600);
      },
      error: (err) => {
        this.loading.set(false);
        this.notify.error({
          title: 'Falha na autenticação',
          message: err?.error?.message || 'Usuário ou senha inválidos.',
          code: err?.error?.code || `HTTP ${err?.status}`
        });
      }
    });
  }
}
