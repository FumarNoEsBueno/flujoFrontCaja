import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type { CreateProductoPayload, ProductoTabla, UpdateProductoPayload } from '../models';
import type { SimplePaginatedResponse } from '../../movements/models';

export interface ProductoFilters {
  nombre?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['productos']}`;

  getAll(
    filters?: ProductoFilters,
    page = 1,
  ): Observable<SimplePaginatedResponse<ProductoTabla>> {
    let params = new HttpParams().set('page', page.toString());

    if (filters?.nombre) {
      params = params.set('nombre', filters.nombre);
    }

    return this.http.get<SimplePaginatedResponse<ProductoTabla>>(
      `${this.baseUrl}/table`,
      { params },
    );
  }

  getById(id: number): Observable<ApiResponse<ProductoTabla>> {
    return this.http.get<ApiResponse<ProductoTabla>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateProductoPayload): Observable<ApiResponse<ProductoTabla>> {
    return this.http.post<ApiResponse<ProductoTabla>>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateProductoPayload): Observable<ApiResponse<ProductoTabla>> {
    return this.http.put<ApiResponse<ProductoTabla>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  // ─── Excel ───────────────────────────────────────────────────────────────

  descargarPlantilla(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/plantilla`, { responseType: 'blob' });
  }

  exportar(params: {
    nombre?: string;
    orden: 'asc' | 'desc';
    todos: boolean;
    limite?: number;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('orden', params.orden);

    if (params.nombre) httpParams = httpParams.set('nombre', params.nombre);
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
    email: string,
  ): Observable<ApiResponse<{ importados: number; errores: number; total: number }>> {
    const form = new FormData();
    form.append('archivo', archivo);
    form.append('email', email);
    return this.http.post<ApiResponse<{ importados: number; errores: number; total: number }>>(
      `${this.baseUrl}/importar`,
      form,
    );
  }
}
