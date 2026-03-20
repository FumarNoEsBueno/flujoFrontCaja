import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type { CreateRolPayload, PermisoOption, RolTabla, UpdateRolPayload } from '../models';
import type { SimplePaginatedResponse } from '../../movements/models';

export interface RolFilters {
  nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['roles']}`;

  getAll(filters?: RolFilters, page = 1): Observable<SimplePaginatedResponse<RolTabla>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.nombre) {
      params = params.set('nombre', filters.nombre);
    }

    return this.http.get<SimplePaginatedResponse<RolTabla>>(`${this.baseUrl}/table`, { params });
  }

  getById(id: number): Observable<ApiResponse<RolTabla>> {
    return this.http.get<ApiResponse<RolTabla>>(`${this.baseUrl}/${id}`);
  }

  getPermisos(): Observable<ApiResponse<PermisoOption[]>> {
    return this.http.get<ApiResponse<PermisoOption[]>>(`${this.baseUrl}/permisos`);
  }

  create(payload: CreateRolPayload): Observable<ApiResponse<RolTabla>> {
    return this.http.post<ApiResponse<RolTabla>>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateRolPayload): Observable<ApiResponse<RolTabla>> {
    return this.http.put<ApiResponse<RolTabla>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
