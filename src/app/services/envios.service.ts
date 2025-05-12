import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnviosService {

  constructor(private http: HttpClient) {}

  cotizar(payload: any): Promise<any> {
    return this.http
      .post(`${environment.apiUrl}/skydropx/quotations`, payload, { headers: { 'Content-Type': 'application/json' } })
      .toPromise();
  }

  
  getCotizacion(id: string): Promise<any> {
    return this.http
      .get(`${environment.apiUrl}/skydropx/quotation/${id}`)
      .toPromise();
  }

  
}
