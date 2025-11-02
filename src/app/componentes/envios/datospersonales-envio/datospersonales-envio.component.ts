import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnviosService } from '../../../services/envios.service';

@Component({
  selector: 'app-datospersonales-envio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './datospersonales-envio.component.html',
  styleUrl: './datospersonales-envio.component.scss'
})
export class DatospersonalesEnvioComponent {

  @Input() selectedEnvio?: any;
  @Output() datosCompletados = new EventEmitter<{ remitente: any, destinatario: any }>();
  formulario!: FormGroup;
  
  // Variable para detectar si es enkrgo
  esEnkrgo = false;

  remitentesGuardados: any[] = [];
  destinatariosGuardados: any[] = [];
  
  // Variables para controlar la visibilidad de los checkboxes
  mostrarGuardarRemitente = true;
  mostrarGuardarDestinatario = true;

  // Variables para búsqueda de empaques y productos
  empaques: any[] = [];
  empaqueSeleccionado: any = null;
  buscandoEmpaques = false;
  showMenuEmpaque = false;

  productos: any[] = [];
  productoSeleccionado: any = null;
  buscandoProductos = false;
  showMenuProducto = false;

  async ngOnInit(): Promise<void> {
    // Detectar si el tipo de envío es enkrgo
    if (this.selectedEnvio?.servicio?.origen) {
      this.esEnkrgo = this.selectedEnvio.servicio.origen.startsWith('ek-');
      console.log('Es Enkrgo:', this.esEnkrgo);
    }

    await this.cargarRemitentes();
    await this.cargarDestinatarios();

    console.log('remitentesGuardados', this.remitentesGuardados)
    console.log('destinatariosGuardados', this.destinatariosGuardados)
  }



  constructor(private fb: FormBuilder, private enviosService: EnviosService) {
    this.formulario = this.fb.group({
      // Campos de empaque y producto
      tipoEmpaque: [''],
      tipoProducto: [''],
      
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
        direccion2: [''],
        guardar: [false]
      }),
      destinatario: this.fb.group({
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
        direccion2: [''],
        guardar: [false]
      })
    });
  }



  enviarDatos() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.value;
    this.datosCompletados.emit({
      remitente: datos.remitente,
      destinatario: datos.destinatario
    });

    if (datos.remitente.guardar) {
      this.enviosService.crearRemitente(datos.remitente).subscribe({
        next: () => console.log('Remitente guardado correctamente.'),
        error: err => console.error('Error al guardar remitente:', err)
      });
    }

    // Guardar destinatario si se marcó el checkbox
    if (datos.destinatario.guardar) {
      this.enviosService.crearDestinatario(datos.destinatario).subscribe({
        next: () => console.log('Destinatario guardado correctamente.'),
        error: err => console.error('Error al guardar destinatario:', err)
      });
    }
  }

  async cargarRemitentes() {
    this.enviosService.traerRemitentes().subscribe({
      next: (res: any) => {
        console.log('Respuesta remitentes:', res);
        // La respuesta ya es un array directamente, no tiene .data
        this.remitentesGuardados = Array.isArray(res) ? res : (res.data || []);
        console.log('Remitentes cargados:', this.remitentesGuardados);
      },
      error: (err) => console.error('Error al cargar remitentes:', err)
    });
  }

  async cargarDestinatarios() {
    this.enviosService.traerDestinatarios().subscribe({
      next: (res: any) => {
        console.log('Respuesta destinatarios:', res);
        // La respuesta ya es un array directamente, no tiene .data
        this.destinatariosGuardados = Array.isArray(res) ? res : (res.data || []);
        console.log('Destinatarios cargados:', this.destinatariosGuardados);
      },
      error: (err) => console.error('Error al cargar destinatarios:', err)
    });
  }


  cargarRemitenteGuardado(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const id = selectElement.value;

    const seleccionado = this.remitentesGuardados.find(r => r.id === id);
    if (seleccionado) {
      // Cargar los datos del remitente
      this.formulario.get('remitente')?.patchValue(seleccionado);
      // Ocultar el checkbox de guardar ya que es un remitente existente
      this.mostrarGuardarRemitente = false;
      this.formulario.get('remitente.guardar')?.setValue(false);
    } else {
      // Si no se selecciona nada, mostrar el checkbox
      this.mostrarGuardarRemitente = true;
    }
  }

  cargarDestinatarioGuardado(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const id = selectElement.value;

    const seleccionado = this.destinatariosGuardados.find(d => d.id === id);
    if (seleccionado) {
      // Cargar los datos del destinatario
      this.formulario.get('destinatario')?.patchValue(seleccionado);
      // Ocultar el checkbox de guardar ya que es un destinatario existente
      this.mostrarGuardarDestinatario = false;
      this.formulario.get('destinatario.guardar')?.setValue(false);
    } else {
      // Si no se selecciona nada, mostrar el checkbox
      this.mostrarGuardarDestinatario = true;
    }
  }

  limpiarRemitente() {
    this.formulario.get('remitente')?.reset();
    this.mostrarGuardarRemitente = true;
  }

  limpiarDestinatario() {
    this.formulario.get('destinatario')?.reset();
    this.mostrarGuardarDestinatario = true;
  }

  // Métodos para búsqueda de empaques y productos
  async buscarEmpaques() {
    const tipoEmpaque = this.formulario.get('tipoEmpaque')?.value;
    if (!tipoEmpaque || tipoEmpaque.length < 2) {
      this.empaques = [];
      this.showMenuEmpaque = false;
      return;
    }

    this.buscandoEmpaques = true;
    try {
      const response = await this.enviosService.buscarPackageTypes(tipoEmpaque).toPromise();
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

  seleccionarEmpaque(empaque: any) {
    this.empaqueSeleccionado = empaque;
    this.formulario.get('tipoEmpaque')?.setValue(`${empaque.codigo} - ${empaque.descripcion}`);
    this.showMenuEmpaque = false;
  }

  limpiarEmpaque() {
    this.empaqueSeleccionado = null;
    this.formulario.get('tipoEmpaque')?.setValue('');
    this.empaques = [];
    this.showMenuEmpaque = false;
  }

  async buscarProductos() {
    const tipoProducto = this.formulario.get('tipoProducto')?.value;
    if (!tipoProducto || tipoProducto.length < 2) {
      this.productos = [];
      this.showMenuProducto = false;
      return;
    }

    this.buscandoProductos = true;
    try {
      const response = await this.enviosService.buscarConsignmentNotes(tipoProducto).toPromise();
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

  seleccionarProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.formulario.get('tipoProducto')?.setValue(producto.descripcion);
    this.showMenuProducto = false;
  }

  limpiarProducto() {
    this.productoSeleccionado = null;
    this.formulario.get('tipoProducto')?.setValue('');
    this.productos = [];
    this.showMenuProducto = false;
  }

}
