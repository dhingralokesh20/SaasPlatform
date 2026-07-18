import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { AuthState } from '../../state/auth.state';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    OtpVerificationComponent
  ],
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
  protected hidePassword = true;

  // MFA / OTP step state
  protected showOtpChallenge = false;
  protected verifyingOtp = false;
  protected otpSuccess = false;
  protected otpSuccessMessage = 'Verification successful. Continuing...';
  protected otpErrorType: 'none' | 'invalid' | 'expired' | 'blocked' = 'none';
  private otpAttempts = 0;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  protected togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

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

        // If email includes 'mfa', trigger the simulated OTP challenge
        if (email.includes('mfa')) {
          this.showOtpChallenge = true;
          this.errorMessage = null;
          this.otpErrorType = 'none';
          this.otpAttempts = 0;
          this.otpSuccess = false;
          return;
        }

        this.completeLogin();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  // OTP Verification event handlers
  protected onVerifyOtp(code: string): void {
    this.verifyingOtp = true;
    this.otpErrorType = 'none';

    // Simulate OTP server validation check
    setTimeout(() => {
      this.verifyingOtp = false;

      if (code === '123456') {
        this.otpSuccess = true;
        this.otpSuccessMessage = 'Verification successful. Continuing...';
        
        // Complete sign-in after a short success-checkmark display duration
        setTimeout(() => {
          this.completeLogin();
        }, 1500);
      } else if (code === '000000') {
        this.otpErrorType = 'expired';
      } else if (code === '999999') {
        this.otpErrorType = 'blocked';
      } else {
        this.otpAttempts++;
        if (this.otpAttempts >= 3) {
          this.otpErrorType = 'blocked';
        } else {
          this.otpErrorType = 'invalid';
        }
      }
    }, 1500);
  }

  protected onBackToLogin(): void {
    this.showOtpChallenge = false;
    this.otpErrorType = 'none';
    this.otpAttempts = 0;
    this.otpSuccess = false;
    this.errorMessage = null;
  }

  protected onResendOtp(): void {
    this.otpErrorType = 'none';
    this.otpAttempts = 0;
    // Mock resending logic
  }

  private completeLogin(): void {
    this.authService.me().subscribe({
      next: (user) => {
        if (!user) return;
        this.authState.setUser(user);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Failed to fetch user profile.';
        this.showOtpChallenge = false;
      }
    });
  }
}
