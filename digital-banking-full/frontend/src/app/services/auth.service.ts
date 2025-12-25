import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private userKey = 'currentUser';

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string, password: string): Observable<any> {
    const loginRequest: LoginRequest = { email, password };
    return this.http.post<any>(`${this.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap((response: any) => {
          if (this.isBrowser && response && response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            if (response.user) {
              localStorage.setItem(this.userKey, JSON.stringify(response.user));
            }
          }
        })
      );
  }

  register(customer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, customer);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    if (!this.isBrowser) return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  logout(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }
}

