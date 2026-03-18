import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { LoginRequest, LoginResponse, MeResponse } from '../models';
import type { ApiResponse } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}${environment.auth.loginUrl}`,
      credentials,
    );
  }

  me(): Observable<ApiResponse<MeResponse>> {
    return this.http.get<ApiResponse<MeResponse>>(
      `${this.baseUrl}${environment.auth.meUrl}`,
    );
  }

  refreshToken(): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}${environment.auth.refreshUrl}`,
      {},
    );
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}${environment.auth.logoutUrl}`,
      {},
    );
  }
}
