import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type {
  CreateMovimientoRequest,
  Movimiento,
  MovimientoFilters,
  SimplePaginatedResponse,
} from '../models';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['movimientos']}`;

  getAll(
    filters?: MovimientoFilters,
    page = 1,
  ): Observable<SimplePaginatedResponse<Movimiento>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.movi_id_transaccion) {
      params = params.set('movi_id_transaccion', filters.movi_id_transaccion);
    }

    if (filters?.caja_id) {
      params = params.set('caja_id', filters.caja_id.toString());
    }

    if (filters?.usua_id) {
      params = params.set('usua_id', filters.usua_id.toString());
    }

    if (filters?.movi_fecha_ingreso) {
      params = params.set('movi_fecha_ingreso', filters.movi_fecha_ingreso);
    }

    return this.http.get<SimplePaginatedResponse<Movimiento>>(
      `${this.baseUrl}/table`,
      { params },
    );
  }

  getById(id: number): Observable<ApiResponse<Movimiento>> {
    return this.http.get<ApiResponse<Movimiento>>(`${this.baseUrl}/${id}`);
  }

  create(
    payload: CreateMovimientoRequest,
  ): Observable<ApiResponse<Movimiento>> {
    return this.http.post<ApiResponse<Movimiento>>(this.baseUrl, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  // ─── Excel ───────────────────────────────────────────────────────────────

  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/plantilla`, { responseType: 'blob' });
  }

  exportar(params: {
    desde?: string;
    hasta?: string;
    todos: boolean;
    limite?: number;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('todos', String(params.todos));

    if (params.desde) httpParams = httpParams.set('desde', params.desde);
    if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
    if (!params.todos && params.limite) {
      httpParams = httpParams.set('limite', String(params.limite));
    }

    return this.http.get(`${this.baseUrl}/exportar`, {
      responseType: 'blob',
      params: httpParams,
    });
  }

  importar(
    archivo: File,
    emailReporte: string,
  ): Observable<ApiResponse<{ importados: number; errores: number; total: number }>> {
    const form = new FormData();
    form.append('archivo', archivo);
    form.append('email_reporte', emailReporte);
    return this.http.post<ApiResponse<{ importados: number; errores: number; total: number }>>(
      `${this.baseUrl}/importar`,
      form,
    );
  }
}
