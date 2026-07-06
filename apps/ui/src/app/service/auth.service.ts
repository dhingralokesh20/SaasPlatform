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

  logout() {
    return this.http.post('/auth/logout', {});
  }

  me() {
    return this.http.get<User>('/auth/me');
  }
}