import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  userMail: any;
  userPass: any;
  loginForm!: FormGroup;
  
  constructor(
    private auth: AuthService, 
    private router: Router, 
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async Login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      const user = await this.auth.login(email, password);
      console.log('Usuario logueado:', user);
      this.router.navigate(['/envios']);
    } catch (e: any) {
      console.log(e.error?.message || 'Error al iniciar sesión');
      
      // Verificar si es un error de credenciales inválidas
      const errorMessage = e.error?.message || e.message || '';
      const isInvalidCredentials = 
        errorMessage.toLowerCase().includes('invalid credentials') ||
        errorMessage.toLowerCase().includes('credenciales inválidas') ||
        errorMessage.toLowerCase().includes('invalid') ||
        e.status === 401 ||
        e.status === 400;
      
      if (isInvalidCredentials) {
        this.toastr.error('Credenciales inválidas. Por favor, verifica tu email y contraseña.', 'Error de autenticación', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
      } else {
        this.toastr.error('Error al iniciar sesión. Por favor, inténtalo de nuevo.', 'Error', {
          timeOut: 4000,
          positionClass: 'toast-top-right',
          progressBar: true
        });
      }
    }
  }

}
