import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

export type QueryParam = {
  q: string,
  page: number,
  limit: number
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  readonly baseUrl = 'https://api.storerestapi.com';

  constructor(private httpClient: HttpClient) {}

  getProducts(queryParams?: Partial<QueryParam>): Observable<any> {
    const httoOptions = {
      params: queryParams
    }
    return this.httpClient.get(this.baseUrl + '/products', httoOptions)
  }
}
