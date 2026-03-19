import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type {
  AsignarCajaPayload,
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  UsuarioCaja,
  UsuarioDetalle,
  UsuarioTabla,
} from '../models';
import type { SimplePaginatedResponse } from '../../movements/models';

export interface UsuarioFilters {
  nombre?: string;
  rut?: string;
  role_id?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['users']}`;

  getAll(
    filters?: UsuarioFilters,
    page = 1,
  ): Observable<SimplePaginatedResponse<UsuarioTabla>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.nombre) {
      params = params.set('nombre', filters.nombre);
    }
    if (filters?.rut) {
      params = params.set('rut', filters.rut);
    }
    if (filters?.role_id) {
      params = params.set('role_id', filters.role_id.toString());
    }

    return this.http.get<SimplePaginatedResponse<UsuarioTabla>>(
      `${this.baseUrl}/table`,
      { params },
    );
  }

  getById(id: number): Observable<ApiResponse<UsuarioDetalle>> {
    return this.http.get<ApiResponse<UsuarioDetalle>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateUsuarioPayload): Observable<ApiResponse<UsuarioDetalle>> {
    return this.http.post<ApiResponse<UsuarioDetalle>>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateUsuarioPayload): Observable<ApiResponse<UsuarioDetalle>> {
    return this.http.put<ApiResponse<UsuarioDetalle>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  // ─── Cajas ───────────────────────────────────────────────────────────────

  getCajas(usuaId: number): Observable<ApiResponse<UsuarioCaja[]>> {
    return this.http.get<ApiResponse<UsuarioCaja[]>>(`${this.baseUrl}/${usuaId}/cajas`);
  }

  asignarCaja(usuaId: number, payload: AsignarCajaPayload): Observable<ApiResponse<UsuarioCaja>> {
    return this.http.post<ApiResponse<UsuarioCaja>>(
      `${this.baseUrl}/${usuaId}/cajas`,
      payload,
    );
  }

  quitarCaja(usuaId: number, cajaId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${usuaId}/cajas/${cajaId}`);
  }

  toggleCaja(usuaId: number, cajaId: number): Observable<ApiResponse<UsuarioCaja>> {
    return this.http.patch<ApiResponse<UsuarioCaja>>(
      `${this.baseUrl}/${usuaId}/cajas/${cajaId}/toggle`,
      {},
    );
  }
}
