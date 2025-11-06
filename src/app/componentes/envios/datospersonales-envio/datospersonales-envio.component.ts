import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnviosService } from '../../../services/envios.service';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-datospersonales-envio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoadingComponent],
  templateUrl: './datospersonales-envio.component.html',
  styleUrl: './datospersonales-envio.component.scss'
})
export class DatospersonalesEnvioComponent implements OnChanges {

  @Input() envio: any;
  @Output() datosCompletados = new EventEmitter<{ remitente: any, destinatario: any }>();
  @Output() volver = new EventEmitter<void>();
  formulario!: FormGroup;
  
  // Determinar si requiere empaque y producto
  requiereEmpaqueYProducto = false;

  remitentesGuardados: any[] = [];
  destinatariosGuardados: any[] = [];
  
  // Variables para controlar el loading
  loading = true;
  remitentesCargados = false;
  destinatariosCargados = false;
  
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
    await this.cargarRemitentes();
    await this.cargarDestinatarios();

    console.log('remitentesGuardados', this.remitentesGuardados)
    console.log('destinatariosGuardados', this.destinatariosGuardados)
    
    // Verificar si requiere empaque y producto al inicializar
    this.verificarRequerimientos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['envio']) {
      this.verificarRequerimientos();
      // Si el formulario ya está inicializado, actualizar validadores
      if (this.formulario) {
        this.actualizarValidadores();
      }
    }
  }

  verificarRequerimientos() {
    if (!this.envio?.servicio) {
      this.requiereEmpaqueYProducto = false;
      return;
    }

    const origen = this.envio.servicio.origen || this.envio.servicio.raw?.origen || '';
    const esSkydropx = origen.startsWith('se-');
    const esManuable = origen.startsWith('mh-');
    
    this.requiereEmpaqueYProducto = esSkydropx || esManuable;
    
    if (this.formulario) {
      this.actualizarValidadores();
    }
  }

  actualizarValidadores() {
    const tipoEmpaqueControl = this.formulario.get('tipoEmpaque');
    const tipoProductoControl = this.formulario.get('tipoProducto');
    
    if (this.requiereEmpaqueYProducto) {
      tipoEmpaqueControl?.setValidators([Validators.required]);
      tipoProductoControl?.setValidators([Validators.required]);
    } else {
      tipoEmpaqueControl?.clearValidators();
      tipoProductoControl?.clearValidators();
    }
    
    tipoEmpaqueControl?.updateValueAndValidity();
    tipoProductoControl?.updateValueAndValidity();
  }



  constructor(private fb: FormBuilder, private enviosService: EnviosService) {
    this.formulario = this.fb.group({
      // Campos de empaque y producto - inicialmente sin validadores, se agregarán condicionalmente
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
        this.remitentesCargados = true;
        this.verificarLoading();
      },
      error: (err) => {
        console.error('Error al cargar remitentes:', err);
        this.remitentesCargados = true;
        this.verificarLoading();
      }
    });
  }

  async cargarDestinatarios() {
    this.enviosService.traerDestinatarios().subscribe({
      next: (res: any) => {
        console.log('Respuesta destinatarios:', res);
        // La respuesta ya es un array directamente, no tiene .data
        this.destinatariosGuardados = Array.isArray(res) ? res : (res.data || []);
        console.log('Destinatarios cargados:', this.destinatariosGuardados);
        this.destinatariosCargados = true;
        this.verificarLoading();
      },
      error: (err) => {
        console.error('Error al cargar destinatarios:', err);
        this.destinatariosCargados = true;
        this.verificarLoading();
      }
    });
  }

  verificarLoading() {
    // Solo ocultar el loading cuando ambas cargas hayan terminado (exitosas o con error)
    if (this.remitentesCargados && this.destinatariosCargados) {
      this.loading = false;
    }
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
