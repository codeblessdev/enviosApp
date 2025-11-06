import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storageKey = 'userData';
  private tokenKey = 'token';

  userSubject: BehaviorSubject<any | null>;
  public user$: Observable<any | null>;

  constructor(private http: HttpClient, private router: Router) {
    
    const data = sessionStorage.getItem(this.storageKey);
    const parsedData = data ? JSON.parse(data) : null;

   
    this.userSubject = new BehaviorSubject<any | null>(parsedData);

    
    this.user$ = this.userSubject.asObservable();
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  async login(email: string, password: string): Promise<any> {
    const body = { email, password };

    try {
      const response: any = await this.http
        .post(`${environment.apiUrl}/auth/login`, body, {
          headers: { 'Content-Type': 'application/json' },
        })
        .toPromise();

        console.log(response);

      if (response.session.access_token) {

        const token = response.session.access_token.includes('|') 
        ? response.session.access_token.split('|')[1] 
        : response.session.access_token;

        console.log('Token recibido:', response.session.access_token);

        console.log('Token:', response.session.access_token);
        
        sessionStorage.setItem(this.tokenKey, response.session.access_token);

        const userData = { ...response.user };
        delete userData.password;

        this.guardarSesion(response.user);

      }
      else{
        console.log('No se recibió token en la respuesta.');
      }

      return response.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async register(nombre: string, apellido: string, email: string, password: string): Promise<any> {
    const body = { nombre, apellido, email, password };

    try {
      const response: any = await this.http
        .post(`${environment.apiUrl}/auth/register`, body, {
          headers: { 'Content-Type': 'application/json' },
        })
        .toPromise();

      console.log("response", response);

      // Si la respuesta tiene session.access_token, usarlo directamente
      if (response.session?.access_token) {
        const token = response.session.access_token.includes('|') 
          ? response.session.access_token.split('|')[1] 
          : response.session.access_token;

        console.log('Token recibido en registro:', response.session.access_token);
        
        sessionStorage.setItem(this.tokenKey, response.session.access_token);

        const userData = { ...response.user };
        delete userData.password;

        this.guardarSesion(response.user);

        return response.user;
      } 
      // Si no hay token, hacer login automático con las credenciales
      else if (response.user) {
        console.log('No se recibió token en registro, haciendo login automático...');
        
        // Hacer login automático para obtener el token
        try {
          const loginResponse = await this.login(email, password);
          return loginResponse;
        } catch (loginError) {
          // Si el login falla, al menos guardar el usuario
          console.error('Error en login automático después de registro:', loginError);
          this.guardarSesion(response.user);
          return response.user;
        }
      } else {
        console.log('No se recibió token ni usuario en la respuesta.');
        throw new Error('No se pudo completar el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  public getUserObservable(): Observable<any> {
    return this.userSubject.asObservable();
  }

  public logOut(): void {
    sessionStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
    sessionStorage.clear();
    localStorage.clear();
  }


  public guardarSesion(userData: any): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(userData));
    this.userSubject.next(userData);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.length > 10; // podés ajustar esto según el formato real del token
  }

  logoutAndRedirect(): void {
    this.logOut(); // Limpia sessionStorage, localStorage y el subject
    this.router.navigate(['/login']);
  }


}
