import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from './equipment';

export interface Reservation {
  _id: string;
  equipment: Equipment;
  user?: { name: string; email: string; role: string };
  startDate: string;
  endDate: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = 'http://localhost:5000/api/reservations';
  private http = inject(HttpClient);
  list(): Observable<{ data: Reservation[] }> { return this.http.get<{ data: Reservation[] }>(this.apiUrl); }
  create(data: { equipment: string; startDate: string; endDate: string; notes: string }): Observable<{ data: Reservation }> {
    return this.http.post<{ data: Reservation }>(this.apiUrl, data);
  }
  updateStatus(id: string, status: Reservation['status']): Observable<{ data: Reservation }> {
    return this.http.put<{ data: Reservation }>(`${this.apiUrl}/${id}/status`, { status });
  }
}
