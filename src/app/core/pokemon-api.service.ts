import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ListPokemonParams, PokemonDetail, PokemonPage } from './pokemon.models';

/**
 * Talks only to the BFF. `/api` is relative: nginx (Docker) or the dev-server proxy
 * forward it to NestJS, so the app needs no environment-specific URLs or CORS.
 */
@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/pokemon';

  list({ page, pageSize, search }: ListPokemonParams): Observable<PokemonPage> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<PokemonPage>(this.baseUrl, { params });
  }

  getDetail(name: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${this.baseUrl}/${encodeURIComponent(name)}`);
  }
}
