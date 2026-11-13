import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'student' | 'user';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private userSubject = new BehaviorSubject<User | null>(this.readUser());
  user$ = this.userSubject.asObservable();

  private http = inject(HttpClient);

  login(credentials: { email: string; password: string }): Observable<{ token: string; user: User }> {
    this.clearSession();
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  register(userData: { name: string; email: string; password: string }): Observable<{ token: string; user: User }> {
    return this.http.post<{ token: string; user: User }>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => this.saveSession(response))
    );
  }

  saveToken(token: string): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem('token', token);
  }

  saveSession(response: { token: string; user: User }): void {
    this.saveToken(response.token);
    if (typeof localStorage !== 'undefined') localStorage.setItem('user', JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  logout(): void {
    this.clearSession();
  }

  private clearSession(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    this.userSubject.next(null);
  }

  private readUser(): User | null {
    try {
      const value = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
}