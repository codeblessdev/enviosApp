import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  userData: any;
  user$!: Observable<any | null>;
  loading: boolean = false;
  mostrarCard = false;
  saldo: number = 0;
  montoDeposito: number = 0;

  metodos: any[] = [
    // { id: 'stp', label: 'STP', img: '/assets/SPEI.jpg' },
    // { id: 'oxxo', label: 'OXXO', img: '/assets/SPEI.jpg' },
    { id: 'spei', label: 'SPEI', img: '/assets/SPEI.jpg' },
    // { id: 'tarjeta', label: 'Tarjeta', img: '/assets/SPEI.jpg' },
    { id: 'paypal', label: 'PayPal', img: '/assets/paypal.svg' }
  ];
  seleccionado: any | null = this.metodos[0];


  constructor(private router: Router, private auth: AuthService) {

    this.user$ = this.auth.getUserObservable();
    
  }

  async ngOnInit() {

    try{

      this.loading = true;

      this.saldo = 0;
    

    } catch (error: any) {

    } finally {
      this.loading = false;
    }
  }

  confirmarDeposito() {
    if (this.montoDeposito > 0) {
      this.saldo += this.montoDeposito;
      console.log(`Depositaste ${this.montoDeposito} MXN. Nuevo saldo: ${this.saldo}`);
      this.montoDeposito = 0;
    } else {
      alert('Por favor, ingrese un monto válido mayor a 0.');
    }
  }

  elegir(m: any) {
    this.seleccionado = m;
  }

  toggleCard(): void {
    this.mostrarCard = !this.mostrarCard;
  }

  logOut() {

    this.auth.logOut();
    this.router.navigate(["/home"]);
  }



}
