import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private authService = inject(AuthService);

  private refreshing = false;

  private refreshSubject = new BehaviorSubject<boolean>(false);

  refresh() {
    if (this.refreshing) {
      return this.refreshSubject.pipe(
        filter((value) => value === true),
        take(1),
      );
    }

    this.refreshing = true;

    return this.authService.refreshToken();
  }

  complete() {
    this.refreshing = false;

    this.refreshSubject.next(true);
  }
}
