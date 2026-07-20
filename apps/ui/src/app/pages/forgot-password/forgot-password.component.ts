import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected loading = false;
  protected success = false;
  protected errorMessage: string | null = null;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onSubmit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    const { email } = this.form.getRawValue();

    this.loading = true;
    this.errorMessage = null;
    this.success = false;

    this.authService
      .forgotPassword({ email })
      .subscribe({
        next: (res: any) => {
          console.log('FORGOT PASSWORD RESPONSE', res);
          this.loading = false;
          this.success = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('FORGOT PASSWORD ERROR', err);
          this.loading = false;
          
          // Match existing LoginComponent error structure
          this.errorMessage = err?.error?.message || 'An error occurred. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }
}
