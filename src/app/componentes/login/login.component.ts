import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  userMail: any;
  userPass: any;
  
  constructor(private auth: AuthService, private router: Router){}

  async Login() {
    try {

      let user = await this.auth.login(this.userMail, this.userPass);

      console.log('Usuario registrado y logueado automáticamente:', user);
      this.router.navigate(['/home']);

    } catch (e: any) {

      console.log(e.error?.message);

        
    } finally {
    }
  }

}
