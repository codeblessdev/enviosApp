import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { EnviosService } from '../../../services/envios.service';
import { ViewEncapsulation } from '@angular/core';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-seleccionenvio',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './seleccionenvio.component.html',
  styleUrl: './seleccionenvio.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SeleccionenvioComponent {

  @Input() cotizacion?: any;
  @Input() isLoading = false;
  @Output() servicioSeleccionado = new EventEmitter<any>();
  auxRates: any[] = [];
  private pollingQuoteIds: string[] = [];

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

    // Reiniciar acumuladores
    this.displayServices = [];
    this.auxRates = [];
    this.pollingQuoteIds = [];

    const response = this.cotizacion.response;

    // Recorrer cada empresa (manuable, skydropx, enkrgo...)
    for (const empresa in response) {
      const resultado = response[empresa];

      // --- si es enkrgo: tiene success y data como objeto único
      if (empresa === 'enkrgo' && resultado.success && resultado.data) {
        // Enkrgo devuelve un solo objeto, no un array
        this.auxRates.push({
          ...resultado.data,
          _origenEmpresa: empresa
        });
      }
      // --- si tiene `.data` como array (manuable)
      else if (resultado.data && Array.isArray(resultado.data)) {
        // Marcar cada rate con su empresa de origen
        const ratesConOrigen = resultado.data.map((rate: any) => ({
          ...rate,
          _origenEmpresa: empresa
        }));
        this.auxRates.push(...ratesConOrigen);
      }
      // --- si tiene `.rates` (skydropx)
      else if (resultado.rates) {
        // Marcar cada rate con su empresa de origen
        const ratesConOrigen = resultado.rates.map((rate: any) => ({
          ...rate,
          _origenEmpresa: empresa
        }));
        this.auxRates.push(...ratesConOrigen);

        // Guardar ID para polling
        if (resultado.id) {
          this.pollingQuoteIds.push(resultado.id); 
        }
      }
    }

    // Filtrar los resultados y mostrarlos
    this.filterAndAdd(this.auxRates);

    // Iniciar polling si hay mainQuoteId (sólo para empresas que lo usen)
    // if (this.mainQuoteId) {
    //   this.startPollingUpdates();
    // }
    if (this.pollingQuoteIds.length > 0) {
      this.startPollingUpdates();
    }

      // console.log("cotizacion", this.cotizacion);
      // this.mainQuoteId = this.cotizacion.response.skydropx.id;

      // console.log("this.mainQuoteId", this.mainQuoteId);

      // // 2) Guardar rates del POST
      // this.auxRates = this.cotizacion.response.rates || [];

      // // 3) Resetear lista de display
      // this.displayServices = [];

      // // 4) Filtrar los rates iniciales
      // this.filterAndAdd(this.auxRates);

      // // 5) Iniciar polling de hasta 5 GETs, cada 2s
      // this.startPollingUpdates();
    }

    // if (changes['cotizacion'] && changes['cotizacion'].currentValue) {
    //   const responses = this.cotizacion.response;

    //   // Reiniciar lista
    //   this.displayServices = [];
    //   this.auxRates = [];

    //   // Unificar todos los rates de ambas empresas
    //   for (const empresa in responses) {
    //     const res = responses[empresa];
    //     if (res?.rates?.length) {
    //       this.auxRates.push(...res.rates);
    //     }
    //   }

    //   // Filtrar para mostrar
    //   this.filterAndAdd(this.auxRates);

    //   // Si querés hacer polling, vas a necesitar pedir por ID de cada cotización
    //   this.startPollingMultipleQuotes(responses);
    // }

  }

  private async startPollingMultipleQuotes(responses: any) {
    for (const empresa in responses) {
      const quoteId = responses[empresa]?.id;
      if (!quoteId) continue;

      for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
        try {
          const data = await this.enviosService.getCotizacion(quoteId);
          this.filterAndAdd(data.rates);
        } catch (err) {
        }
        await this.delay(this.RETRY_DELAY_MS);
      }

      try {
        const finalData = await this.enviosService.getCotizacion(quoteId);
        this.filterAndAdd(finalData.rates);
      } catch {
        // nada
      }
    }
  }



  private getDisplayName(provider: string): string {
    const map: { [key: string]: string } = {
      'ninetynineminutes': '99minutos.com',
      'fedex': 'FedEx',
      'quiken': 'Quiken',
      'paquetexpress': 'Paquetexpress',
      'jtexpress': 'J&T Express',
      'enkrgo': 'Enkrgo'
    };
    return map[provider] ?? provider; // si no está en el map, devolvemos el original
  }

  private generateOriginCode(provider: string): string {
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    if (provider === 'manuable') {
      return `mh-${randomNum}`;
    } else if (provider === 'skydropx') {
      return `se-${randomNum}`;
    } else if (provider === 'enkrgo') {
      return `ek-${randomNum}`;
    }
    return provider; // fallback para otros proveedores
  }

  private filterAndAdd(rates: any[]) {
    for (const r of rates) {
      // Usar _origenEmpresa para determinar si es enkrgo
      const origenEmpresa = r._origenEmpresa || '';
      const isEnkrgo = origenEmpresa === 'enkrgo';
      const isManuable = r.uuid !== undefined && !isEnkrgo;     // clave única de los de manuable
      const isSkydropx = r.id !== undefined && r.provider_name; // skydropx

      let id: string;
      let provider: string;
      let logo: string;
      let days: number;
      let precio: number;
      let providerServiceName: string;
      let origen: string;
      let isDestacado = false;

      if (isEnkrgo) {
        // Estructura específica para enkrgo
        id = r.id || r.service_level?.token || `enkrgo-${Date.now()}`;
        provider = r.provider || 'enkrgo';
        logo = `assets/logo.png`; // Logo de enkrgo
        days = r.days || 5;
        precio = parseFloat(r.total_pricing || 0);
        providerServiceName = r.service_level?.name || 'Enkrgo Estándar';
        origen = this.generateOriginCode('enkrgo');
        isDestacado = true; // Marcar como destacado
      } else if (isManuable) {
        id = r.uuid;
        provider = r.carrier;
        logo = `assets/${r.carrier.toLowerCase()}.jpg`;
        days = r.shipping_type === 'local' ? 1 : 2; // estimado si no hay dato exacto
        precio = parseFloat(r.total_amount);
        providerServiceName = r.service;
        origen = this.generateOriginCode('manuable');
      } else if (isSkydropx) {
        const badStatus = this.INVALID_STATUS.includes(r.status);
        if (badStatus) continue;

        id = r.id;
        provider = r.provider_name;
        logo = `assets/${r.provider_name.toLowerCase()}.jpg`;
        days = r.days;
        precio = parseFloat(r.amount ?? r.total); // a veces viene `amount`, otras `total`
        providerServiceName = r.provider_service_name;
        origen = this.generateOriginCode('skydropx');
      } else {
        continue; // si no encaja en ninguno, lo ignoramos
      }

      const already = this.displayServices.some(s => s.id === id);
      
      if (!already) {
        this.displayServices.push({
          id,
          name: this.getDisplayName(provider),
          logo,
          days,
          precio,
          raw: r,
          provider_service_name: providerServiceName,
          origen: origen,
          isDestacado: isDestacado
        });
      }
      
    }

    // Ordenar: servicios destacados (enkrgo) primero
    this.displayServices.sort((a, b) => {
      if (a.isDestacado && !b.isDestacado) return -1;
      if (!a.isDestacado && b.isDestacado) return 1;
      return 0;
    });

  }

  private async startPollingUpdates() {
    if (!this.pollingQuoteIds || this.pollingQuoteIds.length === 0) {
      return;
    }

    for (const quoteId of this.pollingQuoteIds) {
      for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
        try {
          const data = await this.enviosService.getCotizacion(quoteId);

          if (data?.rates?.length) {
            this.filterAndAdd(data.rates);
          }
        } catch (err) {
          console.error(`Polling ID: ${quoteId} | Intento ${attempt} fallido:`, err);
        }

        await this.delay(this.RETRY_DELAY_MS);
      }

      // Último intento fuera del for
      try {
        const finalData = await this.enviosService.getCotizacion(quoteId);
        this.filterAndAdd(finalData.rates);
      } catch {
        // no hacemos nada si falla
      }
    }

  }



  // private filterAndAdd(rates: any[]) {
  //   for (const r of rates) {
      
  //     const already = this.displayServices.some(s => s.id === r.id);
  //     const badStatus = this.INVALID_STATUS.includes(r.status);
  //     if (!already && !badStatus) {
  //       this.displayServices.push({
  //         id:    r.id,
  //         name:  this.getDisplayName(r.provider_name),
  //         logo:  `assets/${r.provider_name.toLowerCase()}.jpg`,
  //         days:  r.days,
  //         precio: parseFloat(r.amount),
  //         raw:   r,
  //         provider_service_name: r.provider_service_name
  //       });
  //     }
  //   }
  // }

  /** Hacer hasta MAX_ATTEMPTS GET /quotation/{id}, delay entre cada uno */
  // private async startPollingUpdates() {
  //   if (!this.mainQuoteId) return;

  //   for (let attempt = 1; attempt <= this.MAX_ATTEMPTS; attempt++) {
  //     try {
  //       const data = await this.enviosService.getCotizacion(this.mainQuoteId);


  //       console.log(`Intento ${attempt} exitoso`);
  //       // 6) Filtrar los rates que vengan en este GET
  //       this.filterAndAdd(data.rates);
  //     } catch (err) {
  //       console.error(`Intento ${attempt} fallido:`, err);
  //     }
  //     // 7) Esperar antes del siguiente intento
  //     await this.delay(this.RETRY_DELAY_MS);
  //   }

  //   // 8) Un último GET “final” fuera del for (opcional repetir filtro)
  //   try {
  //     const finalData = await this.enviosService.getCotizacion(this.mainQuoteId!);
  //     this.filterAndAdd(finalData.rates);
  //   } catch {
  //     // no hacemos nada si falla
  //   }
  // }

    private delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }


  selectService(s: any) {

    this.selectedService = s;
  
    this.servicioSeleccionado.emit({
      cotizacion: this.cotizacion.data,
      servicio: s,
      consignmentNote: this.cotizacion.data?.consignmentNote,
      packageType: this.cotizacion.data?.packageType
    });
  }

}
