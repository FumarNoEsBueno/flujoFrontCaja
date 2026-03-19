import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ApiResponse } from '../../core/models';
import type { RolOption } from '../models';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['roles']}`;

  getRolesAutocomplete(): Observable<ApiResponse<RolOption[]>> {
    return this.http.get<ApiResponse<RolOption[]>>(`${this.baseUrl}/autocomplete`);
  }
}
