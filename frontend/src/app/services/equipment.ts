import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Equipment {
  _id: string;
  name: string;
  category: string;
  description: string;
  condition: string;
  availability: 'available' | 'unavailable' | 'maintenance';
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private apiUrl = 'http://localhost:5000/api/equipment';
  private http = inject(HttpClient);

  list(filters: Record<string, string>): Observable<{ data: Equipment[]; pagination: { pages: number; total: number } }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params = params.set(key, value); });
    return this.http.get<{ data: Equipment[]; pagination: { pages: number; total: number } }>(this.apiUrl, { params });
  }
}
