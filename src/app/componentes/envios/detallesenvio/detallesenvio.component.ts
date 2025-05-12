import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detallesenvio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detallesenvio.component.html',
  styleUrl: './detallesenvio.component.scss'
})
export class DetallesenvioComponent {

  @Input() envio?: any;
  @Output() crearEnvio = new EventEmitter<void>();

  constructor(private router: Router){}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['envio'] && changes['envio'].currentValue) {
      
      console.log("envio", this.envio);
    }
  }
}
