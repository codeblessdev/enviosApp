import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnviosService } from '../../../services/envios.service';

@Component({
  selector: 'app-seguimiento-envio',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './seguimiento-envio.component.html',
  styleUrl: './seguimiento-envio.component.scss'
})
export class SeguimientoEnvioComponent {

  numeroEnvio = '';
  piezaId: string | null = null;
  movimientos: any[] = [];
  envioNoEncontrado: boolean = false;
  servicioInfo: any = null;
  estados: any[] = [];
  loading: boolean = false;
  proveedor: 'skydropx' | 'manuable' | 'otro' | null = null;

  enviosEjemplo: any = {
    '1880771228': {
      piezaId: '3055894059575704048056',
      servicio: 'Terrestre',
      fechaEntrega: '16/05/2025',
      estadoActual: 'En Tránsito',
      movimientos: [
        {
          fecha: new Date('2025-05-14T12:05:00'),
          estado: 'Recibido por Estafeta',
          planta: 'Lagos de Moreno',
          historia: ''
        },
        {
          fecha: new Date('2025-05-15T09:30:00'),
          estado: 'En Tránsito',
          planta: 'Centro de Distribución',
          historia: ''
        },
        {
          fecha: new Date('2025-05-16T08:15:00'),
          estado: 'En Proceso de Entrega a Domicilio',
          planta: 'Oficina Local',
          historia: ''
        }
      ]
    }
  };

  constructor(private enviosService: EnviosService) {
    this.estados = [
      { nombre: 'Recibido por Estafeta', completado: false, fecha: '' },
      { nombre: 'En Tránsito', completado: false, fecha: '' },
      { nombre: 'En Proceso de Entrega a Domicilio', completado: false, fecha: '' },
      { nombre: 'Entregado', completado: false, fecha: '' }
    ];
  }



  // consultar() {
  //   this.envioNoEncontrado = false;
  //   this.servicioInfo = null;
    
  //   if (this.numeroEnvio.trim() === '') {
  //     return;
  //   }

  //   // Buscar en los envíos hardcodeados
  //   const envio = this.enviosEjemplo[this.numeroEnvio];
    
  //   if (envio) {
  //     this.movimientos = envio.movimientos;
  //     this.piezaId = envio.piezaId;
  //     this.servicioInfo = {
  //       numeroGuia: envio.piezaId,
  //       codigoRastreo: this.numeroEnvio,
  //       servicio: envio.servicio,
  //       fechaEntrega: envio.fechaEntrega
  //     };

  //     // Actualizar estados y fechas según los movimientos
  //     this.actualizarEstadosYFechas(envio.estadoActual);
  //   } else {
  //     this.movimientos = [];
  //     this.envioNoEncontrado = true;
  //   }
  // }

  consultar() {
    this.envioNoEncontrado = false;
    this.servicioInfo = null;
    this.movimientos = [];
    this.loading = true;
    this.proveedor = null;
    
    if (this.numeroEnvio.trim() === '') {
      this.loading = false;
      return;
    }

    // Identificar el proveedor basado en el formato del código
    this.proveedor = this.identificarProveedor(this.numeroEnvio);
    
    if (this.proveedor === 'skydropx') {
      this.consultarSkydropx();
    } else if (this.proveedor === 'manuable') {
      this.consultarManuable();
    } else {
      this.consultarOtro();
    }
  }

  private identificarProveedor(codigo: string): 'skydropx' | 'manuable' | 'otro' {
    // Patrones para identificar proveedores
    // Skydropx: UUIDs o códigos con formato específico
    const skydropxPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Manuable: códigos numéricos o alfanuméricos específicos
    const manuablePattern = /^[A-Z0-9]{8,15}$/;
    
    if (skydropxPattern.test(codigo)) {
      return 'skydropx';
    } else if (manuablePattern.test(codigo)) {
      return 'manuable';
    } else {
      return 'otro';
    }
  }

  private async consultarSkydropx() {
    try {
      const response = await this.enviosService.getEstadoEnvioSkydropx(this.numeroEnvio);
      console.log('Respuesta Skydropx:', response);

      if (response && response.data) {
        this.servicioInfo = {
          numeroGuia: response.data.id || this.numeroEnvio,
          codigoRastreo: this.numeroEnvio,
          servicio: response.data.service_name || 'Skydropx',
          fechaEntrega: response.data.estimated_delivery_date || 'No disponible',
          urlSeguimiento: response.data.tracking_url
        };

        // Procesar movimientos si están disponibles
        if (response.data.tracking_events) {
          this.movimientos = response.data.tracking_events.map((event: any) => ({
            fecha: new Date(event.timestamp),
            estado: event.status,
            planta: event.location || '',
            historia: event.description || ''
          }));
        }

        this.actualizarEstadosYFechas(response.data.status || '');
      } else {
        this.envioNoEncontrado = true;
      }
    } catch (error) {
      console.error('Error al consultar Skydropx:', error);
      this.envioNoEncontrado = true;
    } finally {
      this.loading = false;
    }
  }

  private consultarManuable() {
    // Implementar lógica para Manuable
    console.log('Consultando Manuable para:', this.numeroEnvio);
    this.loading = false;
    this.envioNoEncontrado = true; // Temporal hasta implementar
  }

  private consultarOtro() {
    // Implementar lógica para otros proveedores
    console.log('Consultando otro proveedor para:', this.numeroEnvio);
    this.loading = false;
    this.envioNoEncontrado = true; // Temporal hasta implementar
  }

  actualizarEstadosYFechas(estadoActual: string) {
    // Primero resetear todas las fechas
    this.estados.forEach(estado => estado.fecha = '');
    
    // Llenar las fechas según los movimientos registrados
    this.movimientos.forEach(movimiento => {
      const estadoEncontrado = this.estados.find(e => e.nombre === movimiento.estado);
      if (estadoEncontrado) {
        estadoEncontrado.fecha = this.formatFecha(movimiento.fecha);
      }
    });

    // Actualizar el estado de completado y actual
    let estadoAlcanzado = false;
    this.estados.forEach(estado => {
      if (estado.nombre === estadoActual) {
        estado.completado = true;
        estado.actual = true;
        estadoAlcanzado = true;
      } else if (estadoAlcanzado) {
        estado.completado = false;
        estado.actual = false;
      } else {
        estado.completado = true;
        estado.actual = false;
      }
    });
  }

  formatFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  imprimir() {
    window.print();
  }


}
