import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css',
})
export class OtpVerificationComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() email = '';
  @Input() verificationType: 'mfa' | 'reset' | 'email' = 'mfa';

  @Input() loading = false;

  @Input() success = false;
  @Input() successMessage = 'Verification successful. Continuing...';

  @Input()
  errorType: 'none' | 'invalid' | 'expired' | 'blocked' = 'none';

  @Output() verify = new EventEmitter<string>();
  @Output() backToLogin = new EventEmitter<void>();
  @Output() resend = new EventEmitter<void>();

  @ViewChildren('otpInput')
  inputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected otpForm: FormGroup;

  protected readonly digits = [0, 1, 2, 3, 4, 5];

  protected resendCooldown = 60;
  protected resendDisabled = true;

  protected isShaking = false;

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    const group: Record<string, any> = {};

    this.digits.forEach((i) => {
      group[`digit${i}`] = ['', [Validators.required, Validators.pattern(/^[0-9]$/)]];
    });

    this.otpForm = this.fb.group(group);
  }

  ngOnInit(): void {
    if (!this.success) {
      this.startCooldown();
    }
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.focusInput(0);
    }, 300);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['errorType'] && this.errorType !== 'none') {
      this.triggerShake();
    }

    if (changes['loading'] || changes['success']) {
      if (this.loading || this.success) {
        this.otpForm.disable({
          emitEvent: false,
        });
      } else {
        this.otpForm.enable({
          emitEvent: false,
        });
      }
    }
  }

  ngOnDestroy(): void {
    this.clearCooldown();
  }

  protected getErrorMessage(): string | null {
    switch (this.errorType) {
      case 'invalid':
        return 'Invalid verification code.';

      case 'expired':
        return 'This code has expired.';

      case 'blocked':
        return 'Too many incorrect attempts. Please request a new code.';

      default:
        return null;
    }
  }

  protected onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (input.value) {
        this.setControlValue(index, '');
      } else if (index > 0) {
        this.setControlValue(index - 1, '');
        this.focusInput(index - 1);
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    }

    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  protected onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    this.setControlValue(index, value);

    if (value && index < 5) {
      this.focusInput(index + 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const text = event.clipboardData?.getData('text');

    if (!text) {
      return;
    }

    const otp = text.replace(/\D/g, '').substring(0, 6);

    for (let i = 0; i < otp.length; i++) {
      this.setControlValue(i, otp.charAt(i));
    }

    this.focusInput(Math.min(otp.length, 5));

    if (otp.length === 6) {
      this.onSubmit();
    }
  }

  protected isFormComplete(): boolean {
    return this.otpForm.valid;
  }
  protected onSubmit(): void {
    console.log('OTP SUBMIT CLICKED');

    console.log('FORM:', this.otpForm.value);
    console.log('VALID:', this.otpForm.valid);
    console.log('LOADING:', this.loading);
    console.log('SUCCESS:', this.success);

    if (this.otpForm.invalid || this.loading || this.success) {
      console.log('OTP SUBMIT BLOCKED');
      return;
    }

    let otp = '';

    for (let i = 0; i < 6; i++) {
      otp += this.otpForm.get(`digit${i}`)?.value || '';
    }

    console.log('EMITTING OTP:', otp);

    this.verify.emit(otp);
  }
  protected onBack(): void {
    this.backToLogin.emit();
  }

  protected onResend(): void {
    if (this.resendDisabled) {
      return;
    }

    this.resend.emit();
  }

  // Parent can call this after successful resend
  public restartResendCooldown(): void {
    this.startCooldown();
  }

  private startCooldown(): void {
    this.clearCooldown();

    this.resendCooldown = 60;
    this.resendDisabled = true;

    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;

      if (this.resendCooldown <= 0) {
        this.resendDisabled = false;
        this.clearCooldown();
      }
    }, 1000);
  }

  private clearCooldown(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
  }

  protected focusInput(index: number): void {
    const input = this.inputs.toArray()[index];

    if (input) {
      input.nativeElement.focus();
      input.nativeElement.select();
    }
  }

  private setControlValue(index: number, value: string): void {
    const control = this.otpForm.get(`digit${index}`);

    control?.setValue(value);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  private triggerShake(): void {
    this.isShaking = true;

    setTimeout(() => {
      this.isShaking = false;
    }, 500);
  }
}
