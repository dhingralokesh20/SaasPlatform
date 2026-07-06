import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { User } from '../interfaces/user.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private userSubject = new BehaviorSubject<User | null>(null);
  private initialized = false;

  user$ = this.userSubject.asObservable();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  setUser(user: User | null) {
    this.userSubject.next(user);
  }

  getUser() {
    return this.userSubject.value;
  }

  isReady() {
    return this.initialized;
  }

  isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  loadUser() {
    return this.authService.me().subscribe({
      next: (user: any) => {
        this.setUser(user.data);
        this.initialized = true;
      },
      error: () => {
        this.setUser(null);
        this.initialized = true;
      },
    });
  }

  clear() {
    this.userSubject.next(null);
    this.initialized = false;
  }

  logout() {
    return this.authService.logout().subscribe({
      next: () => {
        this.clear();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        // even if backend fails, clear local state
        this.clear();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
    });
  }
}
