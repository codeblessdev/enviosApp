import { AfterViewInit, ChangeDetectorRef, Component, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WalletService } from '../../services/wallet.service';

declare var MercadoPago: any;

@Component({
  selector: 'app-mercagopago',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mercagopago.component.html',
  styleUrl: './mercagopago.component.scss'
})
export class MercagopagoComponent implements AfterViewInit {

  token: any;
  showSuccessModal = false;
  successMessage = '';
  redirectCountdown = 5;
  redirectTimer: any;
  autoRedirect = false;
  isErrorModal = false;
  errorDetail = '';
  amount: number = 0;
  

  constructor( private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef, private walletService: WalletService){}

  ngOnInit(){
    this.token = this.authService.getToken();
    this.amount = this.walletService.getMontoDeposito() || 100;
  }

  ngAfterViewInit(): void {
    const mp = new MercadoPago('TEST-2dbbed75-db74-4128-bbc8-374b847c5c45', {
      locale: 'es-AR'
    });

    const bricksBuilder = mp.bricks();

    const renderPaymentBrick = async () => {
      const settings = {
        initialization: {
          amount: this.amount, 
          payer: {
            firstName: '',
            lastName: '',
            email: '',
          },
        },
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all',
            bankTransfer: 'all',
            atm: 'all',
            wallet_purchase: 'all',
            maxInstallments: 1,
          },
        },
        callbacks: {
          onReady: () => {
            console.log('Brick listo para usarse');
          },
          onSubmit: ({ formData }: { formData: any }) => {
            console.log('Data recibida:', formData);
            return new Promise<void>((resolve, reject) => {
              fetch(`${environment.apiUrl}/wallet/deposito-mp`, { 
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.token}`
                },
                body: JSON.stringify({
                  amount: this.amount,  
                  paymentData: formData
                }),
              })
              .then(async res => {
                const response = await res.json();

                if (!res.ok) {
                  
                  console.error('Error en pago:', response);
                  this.successMessage = response.message || 'Hubo un error al procesar el pago.';
                  this.errorDetail = response.detail || '';
                  this.isErrorModal = true;
                  this.showSuccessModal = true;
                  this.cdr.detectChanges();
                  this.startRedirectCountdown();
                  return reject(); 
                }

                console.log('Pago procesado:', response);
                this.successMessage = '¡Se cargó el saldo correctamente en tu cuenta!';
                this.isErrorModal = false;
                this.showSuccessModal = true;
                this.cdr.detectChanges();
                this.startRedirectCountdown();

                resolve();
              })
              .catch(error => {
                console.error('Error en pago (catch):', error);
                this.successMessage = 'Hubo un error inesperado al procesar el pago.';
                this.isErrorModal = true;
                this.showSuccessModal = true;
                this.cdr.detectChanges();
                this.startRedirectCountdown();
                return reject(); 
              });
            });
          },
          onError: (error: any) => {
            console.error('Error general del Brick:', error);
          },
        },
      };

      await bricksBuilder.create('payment', 'paymentBrick_container', settings);
    };

    renderPaymentBrick();
  }


  cerrarModal() {
    this.clearRedirect();
    this.showSuccessModal = false;
    this.isErrorModal = false;
    this.router.navigate(['/home']);
  }

  
  startRedirectCountdown() {
    this.autoRedirect = true;
    this.redirectCountdown = 5;

    this.redirectTimer = setInterval(() => {
      this.redirectCountdown--;
      this.cdr.detectChanges();
      if (this.redirectCountdown === 0) {
        this.clearRedirect();
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  clearRedirect() {
    clearInterval(this.redirectTimer);
    this.autoRedirect = false;
  }





}
