import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storageKey = 'userData';
  private tokenKey = 'token';

  userSubject: BehaviorSubject<any | null>;
  public user$: Observable<any | null>;

  constructor(private http: HttpClient) {
    
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

  async register(username: string, email: string, password: string): Promise<any> {
    const body = { username, email, password };

    try {

        const response: any = await this.http
            .post(`${environment.apiUrl}/auth/register`, body, {
                headers: { 'Content-Type': 'application/json' },
            })
            .toPromise();

        console.log("response", response);

        // let tokenResponse = response.user.original.access_token;


        // if (tokenResponse) {

        //     const token = tokenResponse.includes('|') 
        //         ? tokenResponse.split('|')[1] 
        //         : tokenResponse;
       
        //     sessionStorage.setItem(this.tokenKey, token);

        //     const userData = { ...response.user };
        //     delete userData.password;

        //     this.guardarSesion(response.user);

        //     return response.user;
        // } else {
        //   console.log('No se recibió token en la respuesta.');
        // }
    } catch (error) {
        console.error('Error en registro: 1', error);
        throw error;
    }
  }

  public getUserObservable(): Observable<any> {
    return this.userSubject.asObservable();
  }

  public logOut(): void {
    sessionStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
    localStorage.clear();
  }


  public guardarSesion(userData: any): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(userData));
    this.userSubject.next(userData);
  }
}
