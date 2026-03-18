import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type { Caja, CajaAutocomplete } from '../models';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['cajas']}`;

  getAll(): Observable<ApiResponse<Caja[]>> {
    return this.http.get<ApiResponse<Caja[]>>(this.baseUrl);
  }

  getById(id: number): Observable<ApiResponse<Caja>> {
    return this.http.get<ApiResponse<Caja>>(`${this.baseUrl}/${id}`);
  }

  autocomplete(): Observable<ApiResponse<CajaAutocomplete[]>> {
    return this.http.get<ApiResponse<CajaAutocomplete[]>>(
      `${this.baseUrl}/autocomplete`,
    );
  }
}
