import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../service/auth.service';

export const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected token: string | null = null;
  protected loading = false;
  protected success = false;
  protected errorMessage: string | null = null;

  protected hidePassword = true;
  protected hideConfirmPassword = true;

  protected readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: passwordsMatchValidator });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.errorMessage = 'Reset token is missing or invalid. Please check your email link or request a new reset request.';
    }
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Cannot reset password without a valid reset token.';
      return;
    }

    const { password } = this.form.getRawValue();

    this.loading = true;
    this.errorMessage = null;
    this.success = false;

    this.authService
      .resetPassword({ token: this.token, password })
      .subscribe({
        next: (res: any) => {
          console.log('RESET PASSWORD RESPONSE', res);
          this.loading = false;
          this.success = true;
          this.cdr.detectChanges();

          // Success redirect to login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          console.log('RESET PASSWORD ERROR', err);
          this.loading = false;
          
          // Match existing LoginComponent error structure
          this.errorMessage = err?.error?.message || 'An error occurred. Please try again.';
          this.cdr.detectChanges();
        },
      });
  }
}
