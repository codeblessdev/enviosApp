import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnviosService } from '../../../services/envios.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cotizarenvio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizarenvio.component.html',
  styleUrl: './cotizarenvio.component.scss'
})
export class CotizarenvioComponent {

  countries = [
    { name: 'México', code: 'mx', flag: 'assets/banderamex.png' },
    { name: 'Argentina', code: 'arg', flag: 'assets/banderaarg.png' }
  ];

  largo!: number;
  ancho!: number;
  alto!: number;
  paisOrigen: any = this.countries[0];
  paisDestino:any = this.countries[0];
  cpOrigen = '';
  cpDestino = '';
  tipoEmpaque = '';
  pesoReal!: number;
  showMenuOrigen = false;
  showMenuDestino = false;
  
  // Variables para tipo de producto
  tipoProducto = '';
  showMenuProducto = false;
  productos: any[] = [];
  productoSeleccionado: any = null;
  buscandoProductos = false;

  // Variables para tipo de empaque
  showMenuEmpaque = false;
  empaques: any[] = [];
  empaqueSeleccionado: any = null;
  buscandoEmpaques = false;

  @Output() cotizar = new EventEmitter<any>();
  @Output() loadingChange = new EventEmitter<boolean>();
  
  isLoading = false;

  constructor(
    private elRef: ElementRef, 
    private enviosService: EnviosService,
    private toastr: ToastrService
  ) {}

  get pesoVolumetrico(): number {
    if (this.largo && this.ancho && this.alto) {
      return (this.largo * this.ancho * this.alto) / 5000;
    }
    return 0;
  }

  getFlag(pais: string): string {
    const country = this.countries.find(c => c.name === pais);
    return country ? country.flag : '';
  }

  seleccionarPaisOrigen(c: any) {
    this.paisOrigen = c;
    this.showMenuOrigen = false;
  }

  seleccionarPaisDestino(c: any) {
    this.paisDestino = c;
    this.showMenuDestino = false;
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    
    const dropdowns: NodeListOf<HTMLElement> =
      this.elRef.nativeElement.querySelectorAll('.custom-select');
  
   
    let clickedInsideDropdown = false;
    dropdowns.forEach(dropdown => {
      if (dropdown.contains(targetElement)) {
        clickedInsideDropdown = true;
      }
    });
  
   
    if (!clickedInsideDropdown) {
      this.showMenuOrigen = false;
      this.showMenuDestino = false;
      this.showMenuProducto = false;
      this.showMenuEmpaque = false;
    }
  }

  // Método para buscar productos
  async buscarProductos() {
    if (this.tipoProducto.length < 2) {
      this.productos = [];
      this.showMenuProducto = false;
      return;
    }

    this.buscandoProductos = true;
    try {
      const response = await this.enviosService.buscarConsignmentNotes(this.tipoProducto).toPromise();
      this.productos = (response as any[]) || [];
      this.showMenuProducto = this.productos.length > 0;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      this.productos = [];
      this.showMenuProducto = false;
    } finally {
      this.buscandoProductos = false;
    }
  }

  // Método para seleccionar un producto
  seleccionarProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.tipoProducto = `${producto.descripcion}`;
    this.showMenuProducto = false;
  }

  // Método para limpiar la selección
  limpiarProducto() {
    this.productoSeleccionado = null;
    this.tipoProducto = '';
    this.productos = [];
    this.showMenuProducto = false;
  }

  // Método para buscar empaques
  async buscarEmpaques() {
    if (this.tipoEmpaque.length < 2) {
      this.empaques = [];
      this.showMenuEmpaque = false;
      return;
    }

    this.buscandoEmpaques = true;
    try {
      const response = await this.enviosService.buscarPackageTypes(this.tipoEmpaque).toPromise();
      this.empaques = (response as any[]) || [];
      this.showMenuEmpaque = this.empaques.length > 0;
    } catch (error) {
      console.error('Error al buscar empaques:', error);
      this.empaques = [];
      this.showMenuEmpaque = false;
    } finally {
      this.buscandoEmpaques = false;
    }
  }

  // Método para seleccionar un empaque
  seleccionarEmpaque(empaque: any) {
    this.empaqueSeleccionado = empaque;
    this.tipoEmpaque = `${empaque.codigo} - ${empaque.descripcion}`;
    this.showMenuEmpaque = false;
  }

  // Método para limpiar la selección de empaque
  limpiarEmpaque() {
    this.empaqueSeleccionado = null;
    this.tipoEmpaque = '';
    this.empaques = [];
    this.showMenuEmpaque = false;
  }

  async onCotizar() {
    // Activar loading al inicio
    this.isLoading = true;
    this.loadingChange.emit(true);

    // const data = {
    //   quotation: {
    //     order_id: '',
  
    //     address_from: {
    //       country_code: this.paisOrigen.code,   
    //       postal_code: this.cpOrigen,
    //       area_level1: 'A',
    //       area_level2: 'A',
    //       area_level3: 'A',
    //       street1: 'A',
    //       apartment_number: 'A',
    //       reference: 'A',
    //       name: 'Bart Simpson',
    //       company: '',
    //       phone: 'A',
    //       email: 'A'
    //     },
  
    //     address_to: {
    //       country_code: this.paisDestino.code,
    //       postal_code: this.cpDestino,
    //       area_level1: 'A',
    //       area_level2: 'A',
    //       area_level3: 'A',
    //       street1: 'A',
    //       apartment_number: 'A',
    //       reference: 'A',
    //       name: 'Bart Simpson',
    //       company: '',
    //       phone: 'A',
    //       email: 'A'
    //     },
  
    //     parcel: {
    //       length:  this.largo,
    //       width:   this.ancho,
    //       height:  this.alto,
    //       weight: this.pesoReal > this.pesoVolumetrico 
    //       ? this.pesoReal 
    //       : this.pesoVolumetrico 
    //     }
    //   }
    // };

    // const data = {
    //   shippingCompany: 'manuable', // o 'skydropx' si corresponde dinámicamente
    //   order_id: '',

    //   address_from: {
    //     country_code: this.paisOrigen.code,
    //     postal_code: this.cpOrigen,
    //     area_level1: 'A',
    //     area_level2: 'A',
    //     area_level3: 'A',
    //     street1: 'A',
    //     apartment_number: 'A',
    //     reference: 'A',
    //     name: 'Bart Simpson',
    //     company: '',
    //     phone: 'A',
    //     email: 'A'
    //   },

    //   address_to: {
    //     country_code: this.paisDestino.code,
    //     postal_code: this.cpDestino,
    //     area_level1: 'A',
    //     area_level2: 'A',
    //     area_level3: 'A',
    //     street1: 'A',
    //     apartment_number: 'A',
    //     reference: 'A',
    //     name: 'Bart Simpson',
    //     company: '',
    //     phone: 'A',
    //     email: 'A'
    //   },

    //   parcel: {
    //     length: this.largo,
    //     width: this.ancho,
    //     height: this.alto,
    //     weight: this.pesoReal > this.pesoVolumetrico
    //       ? this.pesoReal
    //       : this.pesoVolumetrico,
    //     currency: 'MXN',
    //     distance_unit: 'CM',
    //     mass_unit: 'KG'
    //   }
    // };


    // console.log('Payload a enviar:', data);

    

    // try {
    //   const response = await this.enviosService.cotizar(data);

    //   console.log("response", response);
    //   this.cotizar.emit(
    //     {
    //       response,
    //       data:
    //       {
    //         largo: this.largo,
    //         ancho: this.ancho,
    //         alto: this.alto,
    //         pesoReal: this.pesoReal,
    //         pesoVolumetrico: this.pesoVolumetrico,
    //         paisOrigen: this.paisOrigen.name,
    //         paisDestino: this.paisDestino.name,
    //         cpOrigen: this.cpOrigen,
    //         cpDestino: this.cpDestino,
    //         tipoEmpaque: this.tipoEmpaque
    //       }

    //     });
    // } catch (err) {
    //   console.error('Error al cotizar:', err);
    // }

    const cotizacionPayload = {
      shippingCompany: 'skydropx', 
      order_id: 'ORD-' + Date.now(),
      address_from: {
        country_code: this.paisOrigen.code,
        postal_code: this.cpOrigen,
        area_level1: 'CDMX',
        area_level2: 'Benito Juárez',
        area_level3: 'Nápoles',
        street1: 'Av. Reforma 100',
        apartment_number: 'Depto 2',
        reference: 'Frente a la plaza',
        name: 'Juan Pérez',
        company: 'Mi Empresa SA',
        phone: '+5215512345678',
        email: 'juan@example.com'
      },
      address_to: {
        country_code: this.paisDestino.code,
        postal_code: this.cpDestino,
        area_level1: 'CDMX',
        area_level2: 'Benito Juárez',
        area_level3: 'Nápoles',
        street1: 'Av. Reforma 100',
        apartment_number: 'Depto 2',
        reference: 'Frente a la plaza',
        name: 'Juan Pérez',
        company: 'Mi Empresa SA',
        phone: '+5215512345678',
        email: 'juan@example.com'
      },
      parcel: {
        length: this.largo,
        width: this.ancho,
        height: this.alto,
        weight: this.pesoReal > this.pesoVolumetrico
          ? this.pesoReal
          : this.pesoVolumetrico,
        currency: 'MXN',
        distance_unit: 'CM',
        mass_unit: 'KG'
      }
    };

    // const basePayload = {
    //   order_id: '', 

    //   address_from: {
    //     country_code: this.paisOrigen.code,
    //     postal_code: this.cpOrigen,
    //     area_level1: 'A',
    //     area_level2: 'A',
    //     area_level3: 'A',
    //     street1: 'A',
    //     apartment_number: 'A',
    //     reference: 'A',
    //     name: 'Bart Simpson',
    //     company: '',
    //     phone: 'A',
    //     email: 'A'
    //   },

    //   address_to: {
    //     country_code: this.paisDestino.code,
    //     postal_code: this.cpDestino,
    //     area_level1: 'A',
    //     area_level2: 'A',
    //     area_level3: 'A',
    //     street1: 'A',
    //     apartment_number: 'A',
    //     reference: 'A',
    //     name: 'Bart Simpson',
    //     company: '',
    //     phone: 'A',
    //     email: 'A'
    //   },

    //   parcel: {
    //     length: this.largo,
    //     width: this.ancho,
    //     height: this.alto,
    //     weight: this.pesoReal > this.pesoVolumetrico
    //       ? this.pesoReal
    //       : this.pesoVolumetrico,
    //     currency: 'MXN',
    //     distance_unit: 'CM',
    //     mass_unit: 'KG'
    //   }
    // };

    try {

      const [resManuable, resSkydropx, resEnkrgo] = await Promise.all([
        this.enviosService.cotizar({ ...cotizacionPayload, shippingCompany: 'manuable' }),
        this.enviosService.cotizar({ ...cotizacionPayload, shippingCompany: 'skydropx' }),
        this.enviosService.cotizar({ ...cotizacionPayload, shippingCompany: 'enkrgo' })
      ]);

      const cotizaciones = {
        manuable: resManuable,
        skydropx: resSkydropx,
        enkrgo: resEnkrgo
      };

      // const response = await this.enviosService.cotizar({ ...cotizacionPayload, shippingCompany: 'manuable' });

      this.cotizar.emit({
        response: cotizaciones,
        data: {
          largo: this.largo,
          ancho: this.ancho,
          alto: this.alto,
          pesoReal: this.pesoReal,
          pesoVolumetrico: this.pesoVolumetrico,
          paisOrigen: this.paisOrigen.name,
          paisDestino: this.paisDestino.name,
          cpOrigen: this.cpOrigen,
          cpDestino: this.cpDestino,
          tipoEmpaque: this.tipoEmpaque,
          consignmentNote: this.productoSeleccionado?.codigo || '',
          packageType: this.empaqueSeleccionado?.codigo || ''
        }
      });

      // Desactivar loading después de emitir la cotización
      this.isLoading = false;
      this.loadingChange.emit(false);
    } catch (err: any) {
      console.error('Error al cotizar:', err);
      
      // Mostrar toast de error con mensaje genérico
      this.toastr.error('Error al cotizar el envío. Por favor, inténtalo de nuevo.', 'Error al cotizar', {
        timeOut: 4000,
        positionClass: 'toast-top-right',
        progressBar: true
      });
      
      // Desactivar loading también en caso de error
      this.isLoading = false;
      this.loadingChange.emit(false);
    }



  }

}
