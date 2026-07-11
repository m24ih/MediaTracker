import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(res => this.setSession(res)));
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, password })
      .pipe(tap(res => this.setSession(res)));
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('jwt_token', authResult.token);
    localStorage.setItem('username', authResult.username);
  }
}
