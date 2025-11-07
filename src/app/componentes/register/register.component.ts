import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  nombre: any;
  apellido: any;
  userMail: any;
  userPass: any;

  ngOnInit(): void {
    this.router.navigate(['/login']);
  }

  constructor(private auth: AuthService, private router: Router){}

  async Register(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    try {
      let user = await this.auth.register(this.nombre, this.apellido, this.userMail, this.userPass);

      console.log('Usuario registrado y logueado automáticamente:', user);
      this.router.navigate(['/envios']);

    } catch (e: any) {
      console.log(e.error?.message);
    }
  }


}
