import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EnviosService } from '../../../services/envios.service';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-misenvios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './misenvios.component.html',
  styleUrl: './misenvios.component.scss'
})
export class MisenviosComponent {

  envios: any[] = [];
  enviosFiltrados: any[] = [];
  activeTab: 'pendientes' | 'pagados' | 'usuario' = 'pendientes';
  fromDate: string | null = null;  // YYYY-MM-DD
  toDate:   string | null = null;  // YYYY-MM-DD
  expandedId: string | null = null;
  filtroOrden: string = '';
  filtroDestino: string = '';
  filtroEstado: string = '';
  user$!: Observable<any | null>;
  isLogged: boolean = false;
  
  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  loading: boolean = false;
  
  // Cancelación de envíos
  mostrarModalCancelacion: boolean = false;
  envioACancelar: any = null;

  constructor(
    private enviosService: EnviosService, 
    private auth: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    this.user$ = this.auth.getUserObservable();

    this.auth.user$.subscribe(user => {
      if (user) {
        this.isLogged = true;
        this.cargarEnvios();
      }
    });
  }

  async cargarEnvios() {
    try {
      this.loading = true;
      const resp = await this.enviosService.getEnvios(this.currentPage, this.pageSize);

      if (resp && Array.isArray(resp.data)) {
        this.envios = resp.data;
        this.enviosFiltrados = [...this.envios];
        this.totalItems = resp.total || resp.data.length;
        this.totalPages = resp.totalPages || Math.ceil(this.totalItems / this.pageSize);
      } else {
        console.error('Formato inesperado, esperaba resp.data array');
        this.envios = [];
        this.enviosFiltrados = [];
      }
    } catch (err) {
      console.error('Error al cargar envíos', err);
      this.envios = [];
      this.enviosFiltrados = [];
    } finally {
      this.loading = false;
    }
  }

  selectTab(tab: 'usuario') {
    this.activeTab = tab;
  }

  applyFilter() {
    const fromTs = this.fromDate
      ? new Date(this.fromDate).setHours(0, 0, 0, 0)
      : Number.MIN_SAFE_INTEGER;
    const toTs = this.toDate
      ? new Date(this.toDate).setHours(23, 59, 59, 999)
      : Number.MAX_SAFE_INTEGER;

    this.enviosFiltrados = this.envios.filter((e: { fechaEnvio: string | number | Date; }) => {
      const envTs = new Date(e.fechaEnvio).getTime();
      return envTs >= fromTs && envTs <= toTs;
    });
  }

  toggleExpand(envio: any) {
    // Si ya estaba expandido, colapsa; si no, expande
    this.expandedId = this.expandedId === envio.id ? null : envio.id;
  }

  clearFilter() {
    this.fromDate = null;
    this.toDate   = null;
    this.enviosFiltrados   = [...this.envios];
  }

  private logoMap: Record<string,string> = {
    '99minutos.com':     'ninetynineminutes.jpg',
    'fedex':             'fedex.jpg',
    'quiken':            'quiken.jpg',
    'paquetexpress':     'paquetexpress.jpg',
    'j&t express':       'jtexpress.jpg',
    'ampm':       'ampm.jpg',
    'dhl':       'dhl.jpg',
  };

  getLogoUrl(proveedor: string): string {
    const key = proveedor.toLowerCase();
    const file = this.logoMap[key] || `${key}.png`;
    return `assets/${file}`;
  }

  aplicarFiltros() {
    this.enviosFiltrados = this.envios.filter((e: { id: { toString: () => string | string[]; }; trackingCode: string; destinatarioNombre: string; destinatarioCalle: string; remitenteCiudad: string; estado: string; }) => {
      // Filtrar nro de orden: lo asumimos en id o trackingCode, ajusta según necesites
      const coincideOrden = this.filtroOrden
        ? e.id.toString().includes(this.filtroOrden) || 
          e.trackingCode?.toLowerCase().includes(this.filtroOrden.toLowerCase())
        : true;

      // Filtrar destino: podemos chequear destinatarioNombre, destinatarioCalle, remitenteCiudad
      const destinoBuscado = this.filtroDestino.toLowerCase();
      const coincideDestino = this.filtroDestino
        ? (
          (e.destinatarioNombre?.toLowerCase().includes(destinoBuscado)) ||
          (e.destinatarioCalle?.toLowerCase().includes(destinoBuscado)) ||
          (e.remitenteCiudad?.toLowerCase().includes(destinoBuscado))
        )
        : true;

      // Filtrar estado - comparar con el valor original en inglés
      const coincideEstado = this.filtroEstado
        ? e.estado?.toLowerCase() === this.filtroEstado.toLowerCase()
        : true;

      // Devuelve true solo si cumple todos los filtros
      return coincideOrden && coincideDestino && coincideEstado;
    });
  }

  // Métodos de paginación
  async cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
      await this.cargarEnvios();
    }
  }

  async cambiarTamanoPagina(tamano: number) {
    this.pageSize = tamano;
    this.currentPage = 1;
    await this.cargarEnvios();
  }

  get paginasVisibles(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.currentPage - 2);
    const fin = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  getMathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  traducirEstado(estado: string): string {
    const traducciones: { [key: string]: string } = {
      'success': 'Exitoso',
      'in_progress': 'En Progreso',
      'cancelled': 'Cancelado'
    };
    return traducciones[estado?.toLowerCase()] || estado;
  }

  getEstadosUnicos(): string[] {
    return ['success', 'in_progress', 'cancelled'];
  }

  puedeCancelar(envio: any): boolean {
    return envio.estado?.toLowerCase() === 'success';
  }

  confirmarCancelacion(envio: any) {
    this.envioACancelar = envio;
    this.mostrarModalCancelacion = true;
  }

  cerrarModalCancelacion() {
    this.mostrarModalCancelacion = false;
    this.envioACancelar = null;
  }

  async cancelarEnvio() {
    if (!this.envioACancelar) {
      return;
    }

    try {
      this.loading = true;
      await this.enviosService.cancelarEnvio(this.envioACancelar.id, 'Cliente solicitó cancelación');
      
      // Mostrar mensaje de éxito
      this.toastr.success('Envío cancelado exitosamente', '¡Éxito!', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        progressBar: true
      });
      
      // Cerrar modal
      this.cerrarModalCancelacion();
      
      // Recargar la lista de envíos
      await this.cargarEnvios();
      
    } catch (error) {
      console.error('Error al cancelar envío:', error);
      this.toastr.error('Error al cancelar el envío. Por favor, inténtalo de nuevo.', 'Error', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        progressBar: true
      });
    } finally {
      this.loading = false;
    }
  }

  // Método para ir al seguimiento
  irASeguimiento(envio: any) {
    if (envio.trackingUrlProvider) {
      // Abrir en nueva pestaña
      window.open(envio.trackingUrlProvider, '_blank', 'noopener,noreferrer');
    } else {
      // Si no hay URL, mostrar mensaje
      this.toastr.warning('No hay URL de seguimiento disponible para este envío', 'Advertencia', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        progressBar: true
      });
    }
  }

  // Verificar si el envío es de Enkrgo
  esEnvioEnkrgo(envio: any): boolean {
    return envio.proveedor?.toLowerCase() === 'enkrgo' || 
           envio.origen?.startsWith('ek-');
  }

  // Descargar PDF del envío de Enkrgo
  async descargarPDFEnvio(envio: any) {
    try {
      this.loading = true;
      const blob = await this.enviosService.descargarPDFEnvio(envio.id);
      
      // Crear un URL temporal para el blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal para descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.download = `Envio_${envio.trackingCode || envio.id}_Enkrgo.pdf`;
      
      // Agregar el link al DOM, hacer click y removerlo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el URL temporal
      window.URL.revokeObjectURL(url);
      
      this.toastr.success('PDF descargado exitosamente', '¡Éxito!', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        progressBar: true
      });
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      
      // Manejar los diferentes tipos de error según el código de respuesta
      let mensajeError = 'Error al descargar el PDF. Por favor, inténtalo de nuevo.';
      
      if (error.status === 400) {
        mensajeError = 'Este envío no es de Enkrgo y no tiene PDF disponible.';
      } else if (error.status === 404) {
        mensajeError = 'No se encontró el envío o no tienes permiso para acceder a él.';
      } else if (error.status === 401) {
        mensajeError = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }
      
      this.toastr.error(mensajeError, 'Error', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        progressBar: true
      });
    } finally {
      this.loading = false;
    }
  }

  prueba(){
    console.log(this.isLogged)
    if(!this.isLogged){
      this.router.navigate(['/login']);
    }
    else{
      this.router.navigate(['/envios']);
    }
  }
}
