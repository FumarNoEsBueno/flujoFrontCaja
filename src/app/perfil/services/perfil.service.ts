import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type { PerfilData, UpdateCorreoPayload, UpdatePasswordPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api.perfil}`;

  // ─── Consultas ────────────────────────────────────────────────────────────

  getPerfil(): Observable<ApiResponse<PerfilData>> {
    return this.http.get<ApiResponse<PerfilData>>(this.baseUrl);
  }

  // ─── Mutaciones ───────────────────────────────────────────────────────────

  updateCorreo(payload: UpdateCorreoPayload): Observable<ApiResponse<PerfilData>> {
    return this.http.patch<ApiResponse<PerfilData>>(`${this.baseUrl}/correo`, payload);
  }

  updatePassword(payload: UpdatePasswordPayload): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.baseUrl}/password`, payload);
  }
}
