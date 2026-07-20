import { Component, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../service/auth.service';
import { AuthState } from '../../state/auth.state';
import { OtpVerificationComponent } from './otp-verification/otp-verification.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    OtpVerificationComponent,
  ],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthState);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild(OtpVerificationComponent)
  otpComponent!: OtpVerificationComponent;

  protected loading = false;
  protected verifyingOtp = false;

  protected errorMessage: string | null = null;
  protected hidePassword = true;

  protected showOtpChallenge = false;

  protected otpSuccess = false;
  protected otpSuccessMessage = 'Verification successful. Continuing...';

  protected otpErrorType: 'none' | 'invalid' | 'expired' | 'blocked' = 'none';

  protected otpAttempts = 0;

  private challengeId: string | null = null;

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

    const { email, password, rememberMe } = this.form.getRawValue();

    this.loading = true;
    this.errorMessage = null;

    this.authService
      .login({
        email,
        password,
        rememberMe,
      })
      .subscribe({
        next: (res: any) => {
          console.log('LOGIN RESPONSE', res);

          this.loading = false;

          if (res.data.requiresMfa) {
            this.showOtpChallenge = true;

            // IMPORTANT FIX
            this.challengeId = res.data.challengeId;

            console.log('MFA CHALLENGE ID', this.challengeId);

            this.otpErrorType = 'none';
            this.otpSuccess = false;
            this.otpAttempts = 0;

            this.cdr.detectChanges();

            return;
          }

          this.completeLogin();
        },

        error: (err) => {
          console.log('LOGIN ERROR', err);

          this.loading = false;

          this.errorMessage = err?.error?.message || 'Login failed. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }

  protected onVerifyOtp(code: string): void {
    console.log('VERIFY OTP START', code);

    if (!this.challengeId) {
      this.errorMessage = 'Invalid MFA session.';

      return;
    }

    this.verifyingOtp = true;

    this.otpErrorType = 'none';

    this.authService
      .verifyMFA({
        challengeId: this.challengeId,
        otp: code,
      })
      .subscribe({
        next: (res) => {
          console.log('MFA SUCCESS', res);

          this.verifyingOtp = false;

          this.otpSuccess = true;

          this.otpSuccessMessage = 'Verification successful. Continuing...';

          this.cdr.detectChanges();

          setTimeout(() => {
            this.completeLogin();
          }, 1000);
        },

        error: (err) => {
          console.log('MFA ERROR', err);

          this.verifyingOtp = false;

          const errorCode = err?.error?.code;

          console.log('ERROR CODE', errorCode);

          switch (errorCode) {
            case 'OTP_EXPIRED':
              this.otpErrorType = 'expired';

              break;

            case 'OTP_LOCKED':
              this.otpErrorType = 'blocked';

              break;

            case 'INVALID_OTP':
              this.otpErrorType = 'invalid';

              break;

            default:
              this.otpErrorType = 'invalid';
          }

          this.cdr.detectChanges();
        },
      });
  }

  protected onResendOtp(): void {
    if (!this.challengeId) {
      return;
    }

    this.authService
      .resendMFAOtp({
        challengeId: this.challengeId,
      })
      .subscribe({
        next: () => {
          this.otpComponent?.restartResendCooldown();

          this.otpErrorType = 'none';

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.log('RESEND ERROR', err);

          this.errorMessage = err?.error?.message || 'Failed to resend OTP.';

          this.cdr.detectChanges();
        },
      });
  }

  protected onBackToLogin(): void {
    this.showOtpChallenge = false;

    this.challengeId = null;

    this.otpErrorType = 'none';

    this.otpSuccess = false;

    this.errorMessage = null;
  }

  private completeLogin(): void {
    this.authService.me().subscribe({
      next: (user) => {
        if (!user) {
          return;
        }

        this.authState.setUser(user);

        this.router.navigate(['/dashboard']);
      },

      error: () => {
        this.errorMessage = 'Failed to fetch user profile.';

        this.showOtpChallenge = false;

        this.cdr.detectChanges();
      },
    });
  }
}
