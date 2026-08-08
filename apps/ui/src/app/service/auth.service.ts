import { Injectable } from '@angular/core';

import { HttpClientService } from '../api/httpClient';
import { User } from '../interfaces/user.interface';
import { AUTH_APIS } from '../constants/authApis';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly http: HttpClientService) {}

  login(data: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) {
    return this.http.post(AUTH_APIS.LOGIN, data);
  }

  verifyMFA(data: {
    challengeId: string;
    otp: string;
  }) {
    return this.http.post(AUTH_APIS.VERIFY_MFA, data);
  }

  resendMFAOtp(data: {
    challengeId: string;
  }) {
    return this.http.post(AUTH_APIS.RESEND_MFA, data);
  }

  logout() {
    return this.http.post(AUTH_APIS.LOGOUT, {});
  }

  me() {
    return this.http.get<User>(AUTH_APIS.ME);
  }

  refreshToken() {
    return this.http.post(AUTH_APIS.REFRESH_TOKEN, {});
  }

  forgotPassword(data: {
    email: string;
  }) {
    return this.http.post(AUTH_APIS.FORGOT_PASSWORD, data);
  }

  resetPassword(data: {
    token: string;
    password: string;
  }) {
    return this.http.post(AUTH_APIS.RESET_PASSWORD, data);
  }
}