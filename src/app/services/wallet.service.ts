import { Injectable, Injector } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private authService!: AuthService;
  private montoDeposito: number = 0;

  constructor(private http: HttpClient, private injector: Injector) {}

  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService); 
    }
    return this.authService;
  }

  getBalance(): Observable<any> {
    const token = this.getAuthService().getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrl}/wallet/balance`, { headers });
  }

  getManuableBalance(): Observable<any> {
    const token = this.getAuthService().getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${environment.apiUrl}/accounts/balance`, { headers });
  }

  setMontoDeposito(monto: number) {
    this.montoDeposito = monto;
  }

  getMontoDeposito(): number {
    return this.montoDeposito;
  }

  clearMontoDeposito() {
    this.montoDeposito = 0;
  }


}
