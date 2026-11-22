import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lab {
  _id: string;
  name: string;
  capacity: number;
  equipment: string[];
  description: string;
  isAvailable: boolean;
  imageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class LabService {
  private apiUrl = 'http://localhost:5000/api/labs';
  private http = inject(HttpClient);

  list(): Observable<{ data: Lab[] }> {
    return this.http.get<{ data: Lab[] }>(this.apiUrl);
  }

  create(data: {
    name: string;
    capacity: number;
    equipment: string;
    description: string;
    status: 'available' | 'maintenance';
    photo?: File | null;
  }): Observable<{ data: Lab }> {
    const form = new FormData();
    form.set('name', data.name);
    form.set('capacity', String(data.capacity));
    form.set('equipment', data.equipment);
    form.set('description', data.description);
    form.set('status', data.status);
    if (data.photo) form.set('photo', data.photo);
    return this.http.post<{ data: Lab }>(this.apiUrl, form);
  }
}
