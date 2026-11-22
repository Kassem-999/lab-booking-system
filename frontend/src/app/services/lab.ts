import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lab {
  _id: string;
  id: number;
  name: string;
  capacity: number;
  equipment: string[];
  description: string;
  imageUrl?: string;
  availability: 'available' | 'unavailable';
  isAvailable: boolean;
}

@Injectable({ providedIn: 'root' })
export class LabService {
  private apiUrl = 'http://localhost:5000/api/labs';
  private http = inject(HttpClient);

  list(): Observable<{ data: Lab[] }> {
    return this.http.get<{ data: Lab[] }>(this.apiUrl);
  }
  createWithImage(formData: FormData): Observable<{ data: Lab }> {
    return this.http.post<{ data: Lab }>(this.apiUrl, formData);
  }
  updateWithImage(id: string, formData: FormData): Observable<{ data: Lab }> {
    return this.http.put<{ data: Lab }>(`${this.apiUrl}/${id}`, formData);
  }
}
