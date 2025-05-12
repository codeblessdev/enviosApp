import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnviosService } from '../../../services/envios.service';

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

  @Output() cotizar = new EventEmitter<any>();

  constructor(private elRef: ElementRef, private enviosService: EnviosService) {}

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
    }
  }

  async onCotizar() {

    const data = {
      quotation: {
        order_id: '',
  
        address_from: {
          country_code: this.paisOrigen.code,   
          postal_code: Number(this.cpOrigen),
          area_level1: 'A',
          area_level2: 'A',
          area_level3: 'A',
          street1: 'A',
          apartment_number: 'A',
          reference: 'A',
          name: 'Bart Simpson',
          company: '',
          phone: 'A',
          email: 'A'
        },
  
        address_to: {
          country_code: this.paisDestino.code,
          postal_code: Number(this.cpDestino),
          area_level1: 'A',
          area_level2: 'A',
          area_level3: 'A',
          street1: 'A',
          apartment_number: 'A',
          reference: 'A',
          name: 'Bart Simpson',
          company: '',
          phone: 'A',
          email: 'A'
        },
  
        parcel: {
          length:  this.largo,
          width:   this.ancho,
          height:  this.alto,
          weight: this.pesoReal > this.pesoVolumetrico 
          ? this.pesoReal 
          : this.pesoVolumetrico 
        }
      }
    };

    console.log('Payload a enviar:', data);

    

    try {
      const response = await this.enviosService.cotizar(data);

      console.log("response", response);
      this.cotizar.emit(
        {
          response,
          data:
          {
            largo: this.largo,
            ancho: this.ancho,
            alto: this.alto,
            pesoReal: this.pesoReal,
            pesoVolumetrico: this.pesoVolumetrico,
            paisOrigen: this.paisOrigen.name,
            paisDestino: this.paisDestino.name,
            cpOrigen: this.cpOrigen,
            cpDestino: this.cpDestino,
            tipoEmpaque: this.tipoEmpaque
          }

        });
    } catch (err) {
      console.error('Error al cotizar:', err);
    }

  }

}
