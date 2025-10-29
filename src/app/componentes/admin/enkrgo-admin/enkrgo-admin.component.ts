import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnviosService } from '../../../services/envios.service';

interface EnkrgoConfig {
  id?: string;
  precioBase: number;
  tarifaPorKm: number;
  recargoLejania: number;
  recargoZonaRoja: number;
  tarifaPeso: number;
  recargoUrgencia: number;
  recargoCombustible: number;
  porcentajeSeguro: number;
  distanciaMinLejania: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-enkrgo-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enkrgo-admin.component.html',
  styleUrl: './enkrgo-admin.component.scss'
})
export class EnkrgoAdminComponent implements OnInit {
  // Configuración actual
  config: EnkrgoConfig = {
    precioBase: 0,
    tarifaPorKm: 0,
    recargoLejania: 0,
    recargoZonaRoja: 0,
    tarifaPeso: 0,
    recargoUrgencia: 0,
    recargoCombustible: 0,
    porcentajeSeguro: 0,
    distanciaMinLejania: 0
  };

  // Configuración editable
  editableConfig: EnkrgoConfig = { ...this.config };

  // Estados
  isLoading = false;
  isEditing = false;
  isSaving = false;
  isTesting = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  // Test de cotización
  testPayload = {
    largo: 30,
    ancho: 20,
    alto: 15,
    pesoReal: 5,
    cpOrigen: '01000',
    cpDestino: '22100'
  };

  testResult: any = null;
  showTestResult = false;
  showRawJson = false;

  countries = [
    { name: 'México', code: 'mx', flag: 'assets/banderamex.png' }
  ];

  constructor(private enviosService: EnviosService) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  get pesoVolumetrico(): number {
    if (this.testPayload.largo && this.testPayload.ancho && this.testPayload.alto) {
      return (this.testPayload.largo * this.testPayload.ancho * this.testPayload.alto) / 5000;
    }
    return 0;
  }

  async loadConfig() {
    this.isLoading = true;
    this.clearMessage();
    try {
      const response = await this.enviosService.getEnkrgoConfig();
      this.config = response;
      this.editableConfig = { ...response };
    } catch (error: any) {
      this.showMessage('Error al cargar la configuración: ' + (error.error?.message || error.message), 'error');
      console.error('Error al cargar configuración:', error);
    } finally {
      this.isLoading = false;
    }
  }

  enableEditing() {
    this.isEditing = true;
    this.editableConfig = { ...this.config };
  }

  cancelEditing() {
    this.isEditing = false;
    this.editableConfig = { ...this.config };
    this.clearMessage();
  }

  async saveConfig() {
    this.isSaving = true;
    this.clearMessage();
    try {
      // Preparar solo los campos editables
      const payload: any = {
        precioBase: this.editableConfig.precioBase,
        tarifaPorKm: this.editableConfig.tarifaPorKm,
        recargoLejania: this.editableConfig.recargoLejania,
        recargoZonaRoja: this.editableConfig.recargoZonaRoja,
        tarifaPeso: this.editableConfig.tarifaPeso,
        recargoUrgencia: this.editableConfig.recargoUrgencia,
        recargoCombustible: this.editableConfig.recargoCombustible,
        porcentajeSeguro: this.editableConfig.porcentajeSeguro,
        distanciaMinLejania: this.editableConfig.distanciaMinLejania
      };

      const response = await this.enviosService.updateEnkrgoConfig(payload);
      this.config = response;
      this.editableConfig = { ...response };
      this.isEditing = false;
      this.showMessage('Configuración actualizada exitosamente', 'success');
    } catch (error: any) {
      this.showMessage('Error al guardar la configuración: ' + (error.error?.message || error.message), 'error');
      console.error('Error al guardar configuración:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async testQuotation() {
    this.isTesting = true;
    this.testResult = null;
    this.showTestResult = false;
    this.showRawJson = false;
    this.clearMessage();

    try {
      const cotizacionPayload = {
        shippingCompany: 'enkrgo',
        order_id: 'TEST-' + Date.now(),
        address_from: {
          country_code: this.countries[0].code,
          postal_code: this.testPayload.cpOrigen,
          area_level1: 'CDMX',
          area_level2: 'Benito Juárez',
          area_level3: 'Nápoles',
          street1: 'Av. Reforma 100',
          apartment_number: 'Depto 2',
          reference: 'Frente a la plaza',
          name: 'Test Usuario',
          company: 'Test Company',
          phone: '+5215512345678',
          email: 'test@example.com'
        },
        address_to: {
          country_code: this.countries[0].code,
          postal_code: this.testPayload.cpDestino,
          area_level1: 'CDMX',
          area_level2: 'Benito Juárez',
          area_level3: 'Nápoles',
          street1: 'Av. Reforma 100',
          apartment_number: 'Depto 2',
          reference: 'Frente a la plaza',
          name: 'Test Usuario',
          company: 'Test Company',
          phone: '+5215512345678',
          email: 'test@example.com'
        },
        parcel: {
          length: this.testPayload.largo,
          width: this.testPayload.ancho,
          height: this.testPayload.alto,
          weight: this.testPayload.pesoReal > this.pesoVolumetrico
            ? this.testPayload.pesoReal
            : this.pesoVolumetrico,
          currency: 'MXN',
          distance_unit: 'CM',
          mass_unit: 'KG'
        }
      };

      const response = await this.enviosService.cotizar(cotizacionPayload);
      this.testResult = response;
      this.showTestResult = true;
      this.showMessage('Cotización de prueba ejecutada exitosamente', 'success');
    } catch (error: any) {
      this.showMessage('Error al testear la cotización: ' + (error.error?.message || error.message), 'error');
      console.error('Error al testear cotización:', error);
    } finally {
      this.isTesting = false;
    }
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.clearMessage();
    }, 5000);
  }

  clearMessage() {
    this.message = '';
    this.messageType = '';
  }
}

