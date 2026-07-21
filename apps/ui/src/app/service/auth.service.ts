import { Injectable } from '@angular/core';
import { HttpClientService } from '../api/httpClient';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClientService) {}

  login(data: { email: string; password: string; rememberMe?: boolean }) {
    return this.http.post('/auth/login', data);
  }

  verifyMFA(data: { challengeId: string; otp: string }) {
    return this.http.post('/auth/verifyMFA', data);
  }

  resendMFAOtp(data: { challengeId: string }) {
    return this.http.post('/auth/resendMFA', data);
  }

  logout() {
    return this.http.post('/auth/logout', {});
  }

  me() {
    return this.http.get<User>('/auth/me');
  }

  refreshToken() {
    return this.http.post('/auth/refreshToken', {});
  }

  forgotPassword(data: { email: string }) {
    return this.http.post('/auth/forgot-password', data);
  }

  resetPassword(data: { token: string; password: string }) {
    return this.http.post('/auth/reset-password', data);
  }
}
