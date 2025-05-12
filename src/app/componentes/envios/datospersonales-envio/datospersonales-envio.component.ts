import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-datospersonales-envio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './datospersonales-envio.component.html',
  styleUrl: './datospersonales-envio.component.scss'
})
export class DatospersonalesEnvioComponent {

  @Output() datosCompletados = new EventEmitter<{ remitente: any, destinatario: any }>();
  formulario!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      remitente: this.fb.group({
        nombre: ['', Validators.required],
        telefono: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        empresa: ['', Validators.required],
        rfc: [''],
        pais: ['', Validators.required],
        codigoPostal: ['', Validators.required],
        ciudad: ['', Validators.required],
        colonia: ['', Validators.required],
        estado: ['', Validators.required],
        direccion1: ['', Validators.required],
        numero: ['', Validators.required],
        direccion2: ['', Validators.required],
        guardar: [false]
      }),
      destinatario: this.fb.group({
        nombre: ['', Validators.required],
        telefono: ['', Validators.required],
        correo: ['',[Validators.required, Validators.email]],
        empresa: ['', Validators.required],
        rfc: [''],
        pais: ['', Validators.required],
        codigoPostal: ['', Validators.required],
        ciudad: ['', Validators.required],
        colonia: ['', Validators.required],
        estado: ['', Validators.required],
        direccion1: ['', Validators.required],
        numero: ['', Validators.required],
        direccion2: ['', Validators.required],
        guardar: [false]
      })
    });
  }

  enviarDatos() {
    const datos = this.formulario.value;
    this.datosCompletados.emit({
      remitente: datos.remitente,
      destinatario: datos.destinatario
    });
  }

}
