import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { AuthState } from '../../state/auth.state';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthState);

  protected loading = false;
  protected errorMessage: string | null = null;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected onSubmit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading = true;
    this.errorMessage = null;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;

        this.authService.me().subscribe({
          next: (user) => {
            if (!user) return;

            this.authState.setUser(user);
            this.router.navigate(['/dashboard']);
          },
        });
      },
      error: (err) => {
        this.loading = false;

        this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
