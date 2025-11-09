import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnviosService } from '../../../services/envios.service';
import { ToastrService } from 'ngx-toastr';

interface HistorialEstado {
  estadoAnterior: string;
  estadoNuevo: string;
  comentario?: string;
  fechaCambio: string;
}

interface Persona {
  nombre: string;
  correo: string;
  telefono: string;
  calle: string;
  calle2?: string | null;
  numero: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  pais: string;
}

interface DetalleEnvio {
  id: string;
  trackingCode: string;
  provider: string;
  estadoActual: string;
  posiblesEstadosSiguientes: string[];
  costo: number;
  fechaEnvio: string;
  fechaEntregaEstimada?: string | null;
  fechaEntregado?: string | null;
  remitente: Persona;
  destinatario: Persona;
  historialEstados: HistorialEstado[];
  createdAt: string;
}

@Component({
  selector: 'app-detalle-estado-envio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-estado-envio.component.html',
  styleUrl: './detalle-estado-envio.component.scss'
})
export class DetalleEstadoEnvioComponent implements OnInit {
  
  envio?: DetalleEnvio;
  loading = true;
  error = false;
  mensajeError = '';

  // Formulario de actualización
  estadoSeleccionado = '';
  comentario = '';
  actualizando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private enviosService: EnviosService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Obtener el tracking code de la URL
    const trackingCode = this.route.snapshot.paramMap.get('trackingCode');
    
    if (trackingCode) {
      this.cargarDetalleEnvio(trackingCode);
    } else {
      this.error = true;
      this.mensajeError = 'No se proporcionó un código de tracking válido';
      this.loading = false;
    }
  }

  async cargarDetalleEnvio(trackingCode: string): Promise<void> {
    this.loading = true;
    this.error = false;

    try {
      const response = await this.enviosService.getEnvioByTrackingCode(trackingCode);
      this.envio = response;
      console.log('Detalle del envío:', this.envio);
      this.toastr.success('Información del envío cargada correctamente', 'Éxito');
    } catch (error: any) {
      this.error = true;
      
      if (error.status === 404) {
        this.mensajeError = 'No se encontró ningún envío con ese código de tracking';
        this.toastr.error('Envío no encontrado', 'Error');
      } else {
        this.mensajeError = 'Error al cargar la información del envío. Por favor, intenta de nuevo.';
        this.toastr.error('Error al cargar la información', 'Error');
      }
      
      console.error('Error al cargar detalle:', error);
    } finally {
      this.loading = false;
    }
  }

  async actualizarEstado(): Promise<void> {
    if (!this.estadoSeleccionado) {
      this.toastr.warning('Por favor, selecciona un estado', 'Advertencia');
      return;
    }

    if (!this.envio) {
      return;
    }

    this.actualizando = true;

    try {
      const response = await this.enviosService.actualizarEstadoEnvio(
        this.envio.id,
        this.estadoSeleccionado,
        this.comentario || undefined
      );

      console.log('Estado actualizado:', response);
      this.toastr.success('Estado del envío actualizado correctamente', 'Éxito');

      // Limpiar formulario
      this.estadoSeleccionado = '';
      this.comentario = '';

      // Recargar la información del envío
      await this.cargarDetalleEnvio(this.envio.trackingCode);

    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      
      if (error.status === 400) {
        const mensaje = error.error?.message || 'Transición de estado no válida';
        this.toastr.error(mensaje, 'Error de validación');
      } else if (error.status === 404) {
        this.toastr.error('Envío no encontrado', 'Error');
      } else {
        this.toastr.error('Error al actualizar el estado. Por favor, intenta de nuevo.', 'Error');
      }
    } finally {
      this.actualizando = false;
    }
  }

  // Helpers
  get esEstadoFinal(): boolean {
    return this.envio?.posiblesEstadosSiguientes?.length === 0;
  }

  get direccionCompletaRemitente(): string {
    if (!this.envio?.remitente) return '';
    const d = this.envio.remitente;
    const calle2 = d.calle2 ? `, ${d.calle2}` : '';
    const numero = d.numero ? ` ${d.numero}` : '';
    return `${d.calle}${numero}${calle2}, ${d.colonia}, ${d.ciudad}, ${d.estado}, CP ${d.codigoPostal}`;
  }

  get direccionCompletaDestinatario(): string {
    if (!this.envio?.destinatario) return '';
    const d = this.envio.destinatario;
    const calle2 = d.calle2 ? `, ${d.calle2}` : '';
    const numero = d.numero ? ` ${d.numero}` : '';
    return `${d.calle}${numero}${calle2}, ${d.colonia}, ${d.ciudad}, ${d.estado}, CP ${d.codigoPostal}`;
  }

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return 'No disponible';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearCosto(costo: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(costo);
  }

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'Generado': 'secondary',
      'En Preparacion': 'info',
      'En Viaje': 'primary',
      'En Sucursal': 'warning',
      'Entregado': 'success',
      'Extraviado': 'danger',
      'Cancelado': 'dark',
      'Error': 'danger'
    };
    
    return colores[estado] || 'secondary';
  }

  volverEscaneo(): void {
    this.router.navigate(['/escaneo-qr']);
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
