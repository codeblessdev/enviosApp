import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EnviosService } from '../../../services/envios.service';

@Component({
  selector: 'app-seleccionenvio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seleccionenvio.component.html',
  styleUrl: './seleccionenvio.component.scss'
})
export class SeleccionenvioComponent {

  @Input() cotizacion?: any;
  @Output() servicioSeleccionado = new EventEmitter<any>();
  auxRates: any[] = [];

  /** aquí guardamos los servicios ya filtrados para mostrar */
  displayServices: any[] = [];
  selectedService?: any;
  private mainQuoteId?: string;
  private readonly MAX_ATTEMPTS = 5;
  private readonly RETRY_DELAY_MS = 2000;
  private readonly INVALID_STATUS = ['pending', 'not_applicable', 'no_coverage'];


  constructor(private enviosService: EnviosService) {}


  ngOnChanges(changes: SimpleChanges) {
    if (changes['cotizacion'] && changes['cotizacion'].currentValue) {
      this.mainQuoteId = this.cotizacion.response.id;

      console.log("this.mainQuoteId", this.mainQuoteId);

      // 2) Guardar rates del POST
      this.auxRates = this.cotizacion.response.rates || [];

      // 3) Resetear lista de display
      this.displayServices = [];

      // 4) Filtrar los rates iniciales
      this.filterAndAdd(this.auxRates);

      // 5) Iniciar polling de hasta 5 GETs, cada 2s
      this.startPollingUpdates();
    }
  }

  private getDisplayName(provider: string): string {
  const map: { [key: string]: string } = {
    'ninetynineminutes': '99minutos.com',
    'fedex': 'FedEx',
    'quiken': 'Quiken',
    'paquetexpress': 'Paquetexpress',
    'jtexpress': 'J&T Express'
  };
  return map[provider] ?? provider; // si no está en el map, devolvemos el original
}

  private filterAndAdd(rates: any[]) {
    for (const r of rates) {
      
      const already = this.displayServices.some(s => s.id === r.id);
      const badStatus = this.INVALID_STATUS.includes(r.status);
      if (!already && !badStatus) {
        this.displayServices.push({
          id:    r.id,
          name:  this.getDisplayName(r.provider_name),
          logo:  `assets/${r.provider_name.toLowerCase()}.jpg`,
          days:  r.days,
          precio: parseFloat(r.amount),
          raw:   r,
          provider_service_name: r.provider_service_name
        });
      }
    }
  }

  /** Hacer hasta MAX_ATTEMPTS GET /quotation/{id}, delay entre cada uno */
  private async startPollingUpdates() {
    if (!this.mainQuoteId) return;

    for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
      try {
        const data = await this.enviosService.getCotizacion(this.mainQuoteId);


        console.log(`Intento ${attempt} exitoso`);
        // 6) Filtrar los rates que vengan en este GET
        this.filterAndAdd(data.rates);
      } catch (err) {
        console.error(`Intento ${attempt} fallido:`, err);
      }
      // 7) Esperar antes del siguiente intento
      await this.delay(this.RETRY_DELAY_MS);
    }

    // 8) Un último GET “final” fuera del for (opcional repetir filtro)
    try {
      const finalData = await this.enviosService.getCotizacion(this.mainQuoteId!);
      this.filterAndAdd(finalData.rates);
    } catch {
      // no hacemos nada si falla
    }
  }

    private delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }


  selectService(s: any) {
    this.selectedService = s;
  
    this.servicioSeleccionado.emit({
      cotizacion: this.cotizacion.data,
      servicio: s
    });
  }

}
