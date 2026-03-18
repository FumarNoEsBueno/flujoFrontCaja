import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import type { ProductoAutocomplete } from '../models';

interface ProductoAutocompleteResponse {
  success: boolean;
  data: ProductoAutocomplete[];
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.api['productos']}`;

  autocomplete(): Observable<ProductoAutocompleteResponse> {
    return this.http.get<ProductoAutocompleteResponse>(`${this.baseUrl}/autocomplete`);
  }
}
