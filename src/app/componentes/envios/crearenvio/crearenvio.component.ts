import { Component } from '@angular/core';
import { CotizarenvioComponent } from "../cotizarenvio/cotizarenvio.component";
import { SeleccionenvioComponent } from "../seleccionenvio/seleccionenvio.component";
import { DetallesenvioComponent } from "../detallesenvio/detallesenvio.component";
import { DatospersonalesEnvioComponent } from "../datospersonales-envio/datospersonales-envio.component";
import { CommonModule } from '@angular/common';
import { ConfirmacionEnvioComponent } from "../confirmacion-envio/confirmacion-envio.component";
import { LoadingComponent } from "../../loading/loading.component";
import { Router } from '@angular/router';
import { EnviosService } from '../../../services/envios.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-crearenvio',
  standalone: true,
  imports: [CotizarenvioComponent, SeleccionenvioComponent, DetallesenvioComponent, DatospersonalesEnvioComponent, CommonModule, ConfirmacionEnvioComponent, LoadingComponent],
  templateUrl: './crearenvio.component.html',
  styleUrl: './crearenvio.component.scss'
})
export class CrearenvioComponent {

  cotizacionData?: any;
  selectedEnvio?: any;
  pasoActual = 1;
  datosFormulario: any = {};
  user$!: Observable<any | null>;
  isLoading = false;
  loadingMessage = 'Buscando servicios de paquetería...';

  constructor(
    private router: Router, 
    private enviosService: EnviosService, 
    private auth: AuthService,
    private toastr: ToastrService
  ) {
    this.user$ = this.auth.getUserObservable();
  }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      if (!user) {
        console.log("No hay sesión iniciada");
        this.router.navigate(['/login']);
      } else {
        console.log("Sesión iniciada", user);
      }
    });
  }


  onCotizarRecibido(data: any) {
    this.cotizacionData = data;
    console.log("cotizacion data", this.cotizacionData);
  }

  onLoadingChange(loading: boolean) {
    this.isLoading = loading;
  }

  onSelectEnvio(data: any) {
    this.selectedEnvio = {
      servicio: data.servicio,
      cotizacion: data.cotizacion,
      consignmentNote: data.consignmentNote,
      packageType: data.packageType
    };
    console.log("SelectedEnvio", this.selectedEnvio);
  }

  onCrearEnvio() {
    this.pasoActual = 2;
  }

  private async crearEnvioSkydropx() {
    if (!this.selectedEnvio?.servicio?.raw?.id) {
      throw new Error('No se encontró el rate_id del envío');
    }

    const payload = {
      rate_id: this.selectedEnvio.servicio.raw.id,
      printing_format: "standard",
      address_from: {
        street1: this.selectedEnvio.remitente?.direccion || "Calle Example 123",
        name: this.selectedEnvio.remitente?.nombre || "Homero Simpson",
        company: this.selectedEnvio.remitente?.empresa || "Acme INC",
        phone: this.selectedEnvio.remitente?.telefono || "4434434445",
        email: this.selectedEnvio.remitente?.email || "homero@simpson.com",
        reference: this.selectedEnvio.remitente?.referencia || "Casa de Homero",
        country_code: this.cotizacionData?.data?.paisOrigen === 'México' ? 'MX' : 'AR',
        postal_code: this.selectedEnvio.remitente?.codigoPostal || this.cotizacionData?.data?.cpOrigen || "01000",
        area_level1: this.selectedEnvio.remitente?.estado || "Ciudad de México",
        area_level2: this.selectedEnvio.remitente?.municipio || "Benito Juárez",
        area_level3: this.selectedEnvio.remitente?.colonia || "Nápoles"
      },
      address_to: {
        street1: this.selectedEnvio.destinatario?.direccion || "Avenida Example 456",
        name: this.selectedEnvio.destinatario?.nombre || "Bart Simpson",
        company: this.selectedEnvio.destinatario?.empresa || "Example Company LTDA.",
        phone: this.selectedEnvio.destinatario?.telefono || "4434434444",
        email: this.selectedEnvio.destinatario?.email || "bart@simpson.com",
        reference: this.selectedEnvio.destinatario?.referencia || "Casa de Bart",
        country_code: this.cotizacionData?.data?.paisDestino === 'México' ? 'MX' : 'AR',
        postal_code: this.selectedEnvio.destinatario?.codigoPostal || this.cotizacionData?.data?.cpDestino || "64000",
        area_level1: this.selectedEnvio.destinatario?.estado || "Nuevo León",
        area_level2: this.selectedEnvio.destinatario?.municipio || "Monterrey",
        area_level3: this.selectedEnvio.destinatario?.colonia || "Centro"
      },
      packages: [
        {
          package_number: "1",
          package_protected: false,
          consignment_note: this.selectedEnvio.consignmentNote || "53102400",
          package_type: this.selectedEnvio.packageType || "4G"
        }
      ]
    };

    console.log('Payload para Skydropx:', payload);
    
    // Usar el nuevo endpoint unificado
    const response = await this.enviosService.crearEnvioUnificado(payload, 'skydropx');
    console.log('Envío creado exitosamente:', response);
    
    // Avanzar al siguiente paso
    this.pasoActual = 2;
  }

  unificarDatos(datos: { remitente: any, destinatario: any }) {
    this.selectedEnvio = {
      ...this.selectedEnvio,
      remitente: datos.remitente,
      destinatario: datos.destinatario
    };
    this.pasoActual = 3;

    console.log("SelectedEnvio", this.selectedEnvio);
  }

  scrollToNextComponent(componentId: string) {
    const element = document.getElementById(componentId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  private generateTrackingCode(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async onPagoEnvio(pagado: boolean) {
    if (pagado) {
      this.isLoading = true;
      this.loadingMessage = 'Generando envío...';
      
      console.log("selectedEnvio", this.selectedEnvio);

      try {
        // Determinar el proveedor basado en el prefijo del origen
        const esSkydropx = this.selectedEnvio.servicio.origen?.startsWith('se-');
        const esManuable = this.selectedEnvio.servicio.origen?.startsWith('mh-');
        const esEnkrgo = this.selectedEnvio.servicio.origen?.startsWith('ek-');

        console.log("esSkydropx", esSkydropx);
        console.log("esManuable", esManuable);
        console.log("esEnkrgo", esEnkrgo);
        
        if (esSkydropx) {
          await this.crearEnvioSkydropx();
        } else if (esManuable) {
          await this.crearEnvioManuable();
        } else if (esEnkrgo) {
          await this.crearEnvioEnkrgo();
        } else {
          console.error('No se pudo determinar la paquetería. Origen:', this.selectedEnvio.servicio.origen);
          throw new Error('Paquetería no reconocida');
        }
        
        // Mostrar toast de éxito
        this.toastr.success('Pago confirmado y envío creado exitosamente', '¡Éxito!', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
        
        // Navegar a Mis Envíos
        this.router.navigate(['/misenvios']);
      } catch (error) {
        console.error('Error al crear envío:', error);
        this.toastr.error('Error al crear el envío. Por favor, inténtalo de nuevo.', 'Error', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('El usuario no completó el pago.');
    }
  }

  private async crearEnvioManuable() {
    const { cotizacion, remitente, destinatario, servicio } = this.selectedEnvio;

    // Estructura para el nuevo endpoint unificado de Manuable
    const payload = {
      address_from: {
        name: remitente.nombre,
        street1: remitente.direccion1,
        neighborhood: remitente.colonia,
        external_number: remitente.numero,
        city: remitente.ciudad,
        company: remitente.empresa || '',
        state: remitente.estado,
        phone: remitente.telefono,
        email: remitente.correo,
        country: remitente.pais,
        country_code: remitente.pais === 'México' ? 'MX' : 'AR',
        reference: remitente.referencia || ''
      },
      address_to: {
        name: destinatario.nombre,
        street1: destinatario.direccion1,
        neighborhood: destinatario.colonia,
        external_number: destinatario.numero,
        company: destinatario.empresa || '',
        city: destinatario.ciudad,
        state: destinatario.estado,
        phone: destinatario.telefono,
        email: destinatario.correo,
        country: destinatario.pais,
        country_code: destinatario.pais === 'México' ? 'MX' : 'AR',
        reference: destinatario.referencia || ''
      },
      parcel: {
        currency: "MXN",
        product_id: "01010101", // ID del producto, puede venir de la cotización
        product_value: servicio.precio,
        quantity_products: 1,
        content: "GIFT"
      },
      rate_token: servicio.id || servicio.raw?.uuid || "c72f4bc8-0706-4686-9e4f-ab385218fa86"
    };

    console.log("Payload para Manuable:", payload);
    
    // Usar el nuevo endpoint unificado
    const response = await this.enviosService.crearEnvioUnificado(payload, 'manuable');
    console.log('Envío Manuable creado exitosamente:', response);
  }

  private async crearEnvioEnkrgo() {
    const { remitente, destinatario } = this.selectedEnvio;

    // Estructura para el endpoint de Enkrgo
    const payload = {
      provider: "enkrgo",
      address_from: {
        street1: remitente.direccion || remitente.direccion1 || "Calle Example 123",
        name: remitente.nombre || "Remitente Example",
        company: remitente.empresa || "",
        phone: remitente.telefono || "0000000000",
        email: remitente.email || remitente.correo || "remitente@example.com",
        reference: remitente.referencia || "",
        country_code: this.cotizacionData?.data?.paisOrigen === 'México' ? 'MX' : 'AR',
        postal_code: remitente.codigoPostal || this.cotizacionData?.data?.cpOrigen || "00000",
        area_level1: remitente.estado || "Estado",
        area_level2: remitente.municipio || remitente.ciudad || "Ciudad",
        area_level3: remitente.colonia || "Colonia"
      },
      address_to: {
        street1: destinatario.direccion || destinatario.direccion1 || "Calle Example 456",
        name: destinatario.nombre || "Destinatario Example",
        company: destinatario.empresa || "",
        phone: destinatario.telefono || "0000000000",
        email: destinatario.email || destinatario.correo || "destinatario@example.com",
        reference: destinatario.referencia || "",
        country_code: this.cotizacionData?.data?.paisDestino === 'México' ? 'MX' : 'AR',
        postal_code: destinatario.codigoPostal || this.cotizacionData?.data?.cpDestino || "00000",
        area_level1: destinatario.estado || "Estado",
        area_level2: destinatario.municipio || destinatario.ciudad || "Ciudad",
        area_level3: destinatario.colonia || "Colonia"
      },
      parcel: {
        weight: this.cotizacionData?.data?.peso || 1,
        length: this.cotizacionData?.data?.largo || 10,
        width: this.cotizacionData?.data?.ancho || 10,
        height: this.cotizacionData?.data?.alto || 10,
        insured_amount: this.selectedEnvio.servicio?.precio || 0
      }
    };

    console.log("Payload para Enkrgo:", payload);
    
    // Usar el nuevo endpoint unificado
    const response = await this.enviosService.crearEnvioUnificado(payload, 'enkrgo');
    console.log('Envío Enkrgo creado exitosamente:', response);
  }
}
