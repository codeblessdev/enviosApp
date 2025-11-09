import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-escaneo-qr',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule],
  templateUrl: './escaneo-qr.component.html',
  styleUrl: './escaneo-qr.component.scss'
})
export class EscaneoQrComponent {
  
  camarasDisponibles: MediaDeviceInfo[] = [];
  camaraSeleccionada?: MediaDeviceInfo;
  permisosCamara = true;
  scanActivo = true;
  formatos: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
  
  // Modo manual
  modoManual = false;
  codigoManual = '';

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  // Cuando se detectan cámaras disponibles
  onCamerasFound(cameras: MediaDeviceInfo[]): void {
    this.camarasDisponibles = cameras;
    
    // Seleccionar la cámara trasera por defecto si está disponible
    const camaraTrasera = cameras.find(camera => 
      camera.label.toLowerCase().includes('back') || 
      camera.label.toLowerCase().includes('trasera')
    );
    
    this.camaraSeleccionada = camaraTrasera || cameras[0];
  }

  // Cuando hay un error con los permisos
  onPermissionResponse(permission: boolean): void {
    this.permisosCamara = permission;
    if (!permission) {
      this.toastr.error('Se necesita permiso para acceder a la cámara', 'Error de permisos');
    }
  }

  // Cuando se escanea exitosamente un código QR
  onCodeScanned(codigoQR: string): void {
    if (codigoQR && this.scanActivo) {
      this.scanActivo = false; // Pausar escaneo para evitar múltiples lecturas
      
      console.log('Código QR escaneado:', codigoQR);
      this.toastr.success('Código QR escaneado exitosamente', 'Éxito');
      
      // Redirigir a la pantalla de detalle con el código de tracking
      this.router.navigate(['/detalle-estado-envio', codigoQR]);
    }
  }

  // Cambiar entre cámaras disponibles
  cambiarCamara(): void {
    const indiceActual = this.camarasDisponibles.findIndex(
      camera => camera.deviceId === this.camaraSeleccionada?.deviceId
    );
    
    const siguienteIndice = (indiceActual + 1) % this.camarasDisponibles.length;
    this.camaraSeleccionada = this.camarasDisponibles[siguienteIndice];
  }

  // Reiniciar el escaneo
  reiniciarEscaneo(): void {
    this.scanActivo = true;
  }

  volver(): void {
    this.router.navigate(['/home']);
  }

  // Cambiar entre modo cámara y modo manual
  toggleModo(): void {
    this.modoManual = !this.modoManual;
    if (this.modoManual) {
      this.scanActivo = false;
    } else {
      this.scanActivo = true;
      this.codigoManual = '';
    }
  }

  // Buscar por código manual
  buscarPorCodigo(): void {
    const codigo = this.codigoManual.trim();
    
    if (!codigo) {
      this.toastr.warning('Por favor, ingresa un código de tracking', 'Advertencia');
      return;
    }

    // Validar formato básico (opcional)
    if (codigo.length < 5) {
      this.toastr.warning('El código de tracking parece ser muy corto', 'Advertencia');
      return;
    }

    this.toastr.info('Buscando envío...', 'Procesando');
    this.router.navigate(['/detalle-estado-envio', codigo]);
  }
}
