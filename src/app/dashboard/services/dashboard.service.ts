import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type { DashboardData } from '../models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['dashboard']}`;

  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>(`${this.baseUrl}/data`);
  }
}
