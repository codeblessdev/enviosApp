import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  userData: any;
  user$!: Observable<any | null>;
  loading: boolean = false;
  mostrarCard = false;
  mostrarCardPerfil = false;
  mostrarCardEnvios = false;
  saldo: number = 0;
  saldoManuable: number = 0;
  menuAbierto = false;
  modalAbierto = false;
  isLogged: boolean = false;
  montoElegido: number = 0;
  errorMonto: boolean = false;
  mostrarModalDeposito = false;

  metodos: any[] = [
    // { id: 'stp', label: 'STP', img: '/assets/SPEI.jpg' },
    // { id: 'oxxo', label: 'OXXO', img: '/assets/SPEI.jpg' },
    { id: 'spei', label: 'SPEI', img: '/assets/SPEI.jpg' },
    // { id: 'tarjeta', label: 'Tarjeta', img: '/assets/SPEI.jpg' },
    { id: 'mp', label: 'MercadoPago', img: '/assets/mercagopago.png' }
  ];
  seleccionado: any | null = this.metodos[0];


  constructor(private router: Router, private auth: AuthService, private walletService: WalletService, private eRef: ElementRef) {

    this.user$ = this.auth.getUserObservable();

    this.auth.user$.subscribe(user => {
      if (user) {
        this.isLogged = true;
        this.cargarSaldoManuable();
      } else {
        this.isLogged = false;
        this.saldoManuable = 0;
      }
    });
    
  }

  async ngOnInit() {


      this.loading = true;
      const token = localStorage.getItem('token') || '';

      // if (!token || !this.auth.isAuthenticated()) {
      //   console.warn('Token inválido o ausente. Cerrando sesión...');
      //   this.auth.logoutAndRedirect();
      //   return;
      // }

      this.walletService.getBalance().subscribe({
      next: (data) => {
        console.log("data", data);
        this.saldo = data.balance;
      },
      error: (error) => {
        console.error('Error al obtener el saldo:', error);

        if (error.status === 401 || error.status === 400) {
          console.warn('Sesión inválida según backend. Cerrando sesión...');
          this.auth.logoutAndRedirect();
        }


      },
      complete: () => {
        this.loading = false;
      }
    });

    // Obtener saldo de Manuable
    this.cargarSaldoManuable();
  }

  cargarSaldoManuable() {
    this.walletService.getManuableBalance().subscribe({
      next: (data) => {
        console.log("Saldo Manuable:", data);
        this.saldoManuable = parseFloat(data.total || '0');
      },
      error: (error) => {
        console.error('Error al obtener el saldo de Manuable:', error);
        // No cerrar sesión si falla Manuable, solo loguear el error
      }
    });
  }

  confirmarDeposito() {

    if (!this.montoElegido || this.montoElegido < 1) {
      console.log("error");
      this.errorMonto = true;
      return;
    }

    this.errorMonto = false;
    this.mostrarModalDeposito = false;

    
    this.walletService.setMontoDeposito(this.montoElegido);
    this.router.navigate(['/mercadopago']);

    // if (this.montoDeposito > 0) {
    //   this.saldo += this.montoDeposito;
    //   console.log(`Depositaste ${this.montoDeposito} MXN. Nuevo saldo: ${this.saldo}`);
    //   this.montoDeposito = 0;
    // } else {
    //   alert('Por favor, ingrese un monto válido mayor a 0.');
    // }
  }

  abrirModalDeposito() {
    this.mostrarModalDeposito = true;
  }

  cerrarModalDeposito() {
    this.mostrarModalDeposito = false;
    this.montoElegido = 0;
    this.errorMonto = false;
  }



  abrirModal() {
    this.modalAbierto = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.style.overflow = 'hidden'; 
  }

  cerrarModal() {
    this.modalAbierto = false;
    document.body.style.overflow = 'auto';  
  }


  elegir(m: any) {
    this.seleccionado = m;
  }

  toggleCard(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.mostrarCard = !this.mostrarCard;
    this.mostrarCardEnvios = false;
  }

  toggleCardPerfil(): void {
    this.mostrarCardPerfil = !this.mostrarCardPerfil;
  }


  toggleCardEnvios(): void {
    this.mostrarCardEnvios = !this.mostrarCardEnvios;
  }

  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickeadoDentro = this.eRef.nativeElement.contains(target);
    
    // Verificar si el click fue en el botón de perfil o en la card de perfil
    const clickEnPerfil = target.closest('.botonPerfil') || target.closest('.perfil-card');
    
    if (!clickeadoDentro) {
      // Si el click está fuera del componente completo, cerrar todo
      this.mostrarCardEnvios = false;
      this.mostrarCard = false;
    } else if (clickEnPerfil && this.mostrarCard) {
      // Si el click está en el botón de perfil o en la card, no hacer nada (el toggleCard manejará)
      return;
    } else if (this.mostrarCard && !clickEnPerfil) {
      // Si el modal está abierto y el click no fue en el botón ni en la card, cerrar
      this.mostrarCard = false;
    }
    
    // Cerrar menu de envios si está abierto y el click no fue en él
    const clickEnEnvios = target.closest('.nav-item')?.querySelector('.envios-card');
    if (this.mostrarCardEnvios && !clickEnEnvios) {
      this.mostrarCardEnvios = false;
    }
  }

  logOut() {
    this.auth.logOut();
    this.router.navigate(["/home"]);
  }

  verMovimientos() {
    if(this.isLogged){
      this.router.navigate(["/movimientos"]);
    }
    else{
      this.router.navigate(["/login"]);
    }
   
  }

  home() {
    this.router.navigate(["/home"]);
  }

  navigateTo(ruta: any) {

    if(this.isLogged){
      this.router.navigate([ruta]);
    }
    else{
      this.router.navigate(["/login"]);
    }
    
  }



}
