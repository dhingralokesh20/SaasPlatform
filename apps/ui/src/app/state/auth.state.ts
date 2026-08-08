import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../service/auth.service';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly initializedSubject = new BehaviorSubject<boolean>(false);

  readonly user$ = this.userSubject.asObservable();
  readonly initialized$ = this.initializedSubject.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  setUser(user: User | null): void {
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  isReady(): boolean {
    return this.initializedSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  /**
   * Called by the application auth initializer
   * after authentication restoration is complete.
   */
  setInitialized(): void {
    this.initializedSubject.next(true);
  }

  /**
   * Clears the current authentication state.
   */
  clear(): void {
    this.userSubject.next(null);
    this.initializedSubject.next(true);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.clear();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        // Even if backend logout fails, clear local state.
        this.clear();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
    });
  }
}
