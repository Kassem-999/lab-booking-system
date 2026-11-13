import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './auth';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  list(): Observable<{ data: User[] }> {
    return this.http.get<{ data: User[] }>('http://localhost:5000/api/users');
  }
  create(data: { name: string; email: string; password: string; role: User['role'] }): Observable<{ data: User }> {
    return this.http.post<{ data: User }>('http://localhost:5000/api/users', data);
  }
}
