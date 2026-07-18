import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, ViewChildren, QueryList, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css'
})
export class OtpVerificationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() email: string = '';
  @Input() verificationType: 'mfa' | 'reset' | 'email' = 'mfa';
  @Input() loading: boolean = false;
  
  @Input() success: boolean = false;
  @Input() successMessage: string = 'Verification successful. Continuing...';
  @Input() errorType: 'none' | 'invalid' | 'expired' | 'blocked' = 'none';

  @Output() verify = new EventEmitter<string>();
  @Output() backToLogin = new EventEmitter<void>();
  @Output() resend = new EventEmitter<void>();

  @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected otpForm: FormGroup;
  protected readonly digits = [0, 1, 2, 3, 4, 5];

  protected resendCooldown = 60;
  protected resendDisabled = true;
  private cooldownTimer: any;

  protected isShaking = false;

  constructor(private fb: FormBuilder) {
    const group: any = {};
    this.digits.forEach(i => {
      group[`digit${i}`] = ['', [Validators.required, Validators.pattern(/^[0-9]$/)]];
    });
    this.otpForm = this.fb.group(group);
  }

  ngOnInit(): void {
    this.startCooldown();
  }

  ngAfterViewInit(): void {
    // Focus the first input automatically
    setTimeout(() => {
      this.focusInput(0);
    }, 300);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['errorType'] && changes['errorType'].currentValue !== 'none' && changes['errorType'].currentValue !== null) {
      this.triggerShake();
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
    const key = event.key;

    if (key === 'Backspace') {
      event.preventDefault();
      
      if (input.value) {
        this.setControlValue(index, '');
      } else if (index > 0) {
        this.setControlValue(index - 1, '');
        this.focusInput(index - 1);
      }
    } else if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    } else if (key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  protected onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    
    val = val.replace(/\D/g, '');
    if (val.length > 1) {
      val = val.charAt(val.length - 1);
    }
    
    this.setControlValue(index, val);

    if (val && index < 5) {
      this.focusInput(index + 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('text').trim();
    const digitsOnly = pastedText.replace(/\D/g, '').substring(0, 6);

    if (digitsOnly.length > 0) {
      for (let i = 0; i < digitsOnly.length; i++) {
        this.setControlValue(i, digitsOnly.charAt(i));
      }
      
      const nextFocus = Math.min(digitsOnly.length, 5);
      this.focusInput(nextFocus);
      
      if (digitsOnly.length === 6) {
        this.onSubmit();
      }
    }
  }

  protected focusInput(index: number): void {
    const inputsArray = this.inputs.toArray();
    if (inputsArray[index]) {
      inputsArray[index].nativeElement.focus();
      inputsArray[index].nativeElement.select();
    }
  }

  private setControlValue(index: number, val: string): void {
    this.otpForm.get(`digit${index}`)?.setValue(val);
  }

  protected isFormComplete(): boolean {
    return this.otpForm.valid;
  }

  protected onSubmit(): void {
    if (this.otpForm.invalid || this.loading || this.success) return;

    let otpCode = '';
    for (let i = 0; i < 6; i++) {
      otpCode += this.otpForm.get(`digit${i}`)?.value || '';
    }

    this.verify.emit(otpCode);
  }

  protected onBack(): void {
    this.backToLogin.emit();
  }

  protected onResend(): void {
    if (this.resendDisabled) return;
    this.resend.emit();
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

  private triggerShake(): void {
    this.isShaking = true;
    setTimeout(() => {
      this.isShaking = false;
    }, 500);
  }
}
