import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EnviosService {

  private authService!: AuthService;

  constructor(private http: HttpClient, private injector: Injector) {}

  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService); 
    }
    return this.authService;
  }

  
  private buildHeaders(): HttpHeaders {
    const token = this.getAuthService().getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  cotizar(payload: any): Promise<any> {

    console.log("payload", payload);
    return this.http
      .post(`${environment.apiUrl}/shipping/cotizar`, payload, {
        headers: { 'Content-Type': 'application/json' }
      })
      .toPromise();
  }
  
  getCotizacion(id: string): Promise<any> {
    return this.http
      .get(`${environment.apiUrl}/skydropx/quotation/${id}`)
      .toPromise();
  }

  getEnvios(page: number = 1, limit: number = 10, all: boolean = false): Promise<any> {
    const headers = this.buildHeaders();
    const params: any = {
      page: page.toString(),
      limit: limit.toString()
    };
    
    if (all) {
      params.all = 'true';
    }

    return this.http
      .get(`${environment.apiUrl}/shipping/envios`, { 
        headers,
        params 
      })
      .toPromise();
  }


  crearEnvio(payload: any): Promise<any> {
    const headers = this.buildHeaders();  

    return this.http
      .post(
        `${environment.apiUrl}/shipping/crear-envio`,
        payload,
        { headers }
      )
      .toPromise();
  }

  // Nuevo método unificado para crear envíos con cualquier proveedor
  crearEnvioUnificado(datosEnvio: any, proveedor: 'skydropx' | 'manuable' | 'enkrgo'): Promise<any> {
    const headers = this.buildHeaders();
    
    // Agregar el campo provider al payload
    const payload = {
      provider: proveedor,
      ...datosEnvio
    };

    return this.http
      .post(
        `${environment.apiUrl}/shipping/crear-envio`,
        payload,
        { headers }
      )
      .toPromise();
  }

  getEtiquetas(trackingNumber: string): Promise<any> {
    const headers = this.buildHeaders();
    const params = { tracking_number: trackingNumber };

    return this.http.get(
      'http://ec2-54-188-18-143.us-west-2.compute.amazonaws.com:4000/api/labels',
      { headers, params }
    ).toPromise();
  }

  crearRemitente(data: any) {
    const token = this.getAuthService().getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${environment.apiUrl}/skydropx/remitentes`, data, { headers });
  }

  traerRemitentes() {
    const token = this.getAuthService().getToken();
    console.log("token", token);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${environment.apiUrl}/skydropx/remitentes`, { headers });
  }

  crearDestinatario(data: any) {
    const token = this.getAuthService().getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${environment.apiUrl}/skydropx/destinatarios`, data, { headers });
  }

  traerDestinatarios() {
    const token = this.getAuthService().getToken();

    console.log("token", token);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${environment.apiUrl}/skydropx/destinatarios`, { headers });
  }

  buscarConsignmentNotes(q: string) {
    const token = this.getAuthService().getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${environment.apiUrl}/shipping/consignment-notes/search?q=${q}`, { headers });
  }

  buscarPackageTypes(q: string) {
    const token = this.getAuthService().getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(`${environment.apiUrl}/shipping/package-types/search?q=${q}`, { headers });
  }

  crearEnvioSkydropx(payload: any) {
    const token = this.getAuthService().getToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${environment.apiUrl}/skydropx/shipments`, payload, { headers });
  }

  // Obtener estado de envío de Skydropx
  getEstadoEnvioSkydropx(id: string): Promise<any> {
    const headers = this.buildHeaders();
    
    return this.http
      .get(`${environment.apiUrl}/skydropx/shipments/${id}/status`, { headers })
      .toPromise();
  }

  // Cancelar envío
  cancelarEnvio(shipmentId: string, reason: string): Promise<any> {
    const headers = this.buildHeaders();
    const payload = {
      shipmentId: shipmentId,
      reason: reason
    };
    
    return this.http
      .delete(`${environment.apiUrl}/shipping/cancel`, { 
        headers,
        body: payload 
      })
      .toPromise();
  }

  // Obtener configuración de Enkrgo
  getEnkrgoConfig(): Promise<any> {
    const headers = this.buildHeaders();
    return this.http
      .get(`${environment.apiUrl}/enkrgo/config`, { headers })
      .toPromise();
  }

  // Actualizar configuración de Enkrgo
  updateEnkrgoConfig(config: any): Promise<any> {
    const headers = this.buildHeaders();
    return this.http
      .put(`${environment.apiUrl}/enkrgo/config`, config, { headers })
      .toPromise();
  }

  // Descargar PDF de envío Enkrgo
  descargarPDFEnvio(envioId: string): Promise<Blob> {
    const headers = this.buildHeaders();
    return this.http
      .get(`${environment.apiUrl}/shipping/envios/${envioId}/pdf`, { 
        headers,
        responseType: 'blob' 
      })
      .toPromise() as Promise<Blob>;
  }

  // Obtener detalle del envío por código de tracking (sin autenticación)
  getEnvioByTrackingCode(trackingCode: string): Promise<any> {
    return this.http
      .get(`${environment.apiUrl}/shipping/envios/codigo/${trackingCode}`)
      .toPromise();
  }

  // Actualizar estado del envío (sin autenticación)
  actualizarEstadoEnvio(envioId: string, nuevoEstado: string, comentario?: string): Promise<any> {
    const payload: any = {
      nuevoEstado: nuevoEstado
    };
    
    if (comentario) {
      payload.comentario = comentario;
    }

    return this.http
      .patch(
        `${environment.apiUrl}/shipping/envios/${envioId}/estado`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      )
      .toPromise();
  }
  
}
