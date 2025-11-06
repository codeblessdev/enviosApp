import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmacion-envio',
  standalone: true,
  imports: [],
  templateUrl: './confirmacion-envio.component.html',
  styleUrl: './confirmacion-envio.component.scss'
})
export class ConfirmacionEnvioComponent {

  @Input() envio: any; 

  @Output() pagoEnvio = new EventEmitter<boolean>();
  @Output() volver = new EventEmitter<void>();

  ngOnInit(){
    console.log("envio", this.envio);
  }

  confirmarEnvio() {
    this.pagoEnvio.emit(true);
  }


}
