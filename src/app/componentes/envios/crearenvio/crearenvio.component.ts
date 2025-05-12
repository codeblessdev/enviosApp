import { Component } from '@angular/core';
import { CotizarenvioComponent } from "../cotizarenvio/cotizarenvio.component";
import { SeleccionenvioComponent } from "../seleccionenvio/seleccionenvio.component";
import { DetallesenvioComponent } from "../detallesenvio/detallesenvio.component";
import { DatospersonalesEnvioComponent } from "../datospersonales-envio/datospersonales-envio.component";
import { CommonModule } from '@angular/common';
import { ConfirmacionEnvioComponent } from "../confirmacion-envio/confirmacion-envio.component";

@Component({
  selector: 'app-crearenvio',
  standalone: true,
  imports: [CotizarenvioComponent, SeleccionenvioComponent, DetallesenvioComponent, DatospersonalesEnvioComponent, CommonModule, ConfirmacionEnvioComponent],
  templateUrl: './crearenvio.component.html',
  styleUrl: './crearenvio.component.scss'
})
export class CrearenvioComponent {

  cotizacionData?: any;
  selectedEnvio?: any;
  pasoActual = 1;
  datosFormulario: any = {};

  onCotizarRecibido(data: any) {
    this.cotizacionData = data;
    console.log("cotizacion data", this.cotizacionData);
  }

  onSelectEnvio(data: any) {
    this.selectedEnvio = data;
    console.log("SelectedEnvio", this.selectedEnvio);
  }

  onCrearEnvio() {
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

  onPagoEnvio(pagado: boolean) {
    if (pagado) {
      console.log('Pago confirmado, envío:', this.selectedEnvio);
      this.pasoActual = 3;
    } else {
      console.log('El usuario no completó el pago.');
    }
  }
}
