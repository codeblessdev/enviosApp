import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  userName: any;
  userMail: any;
  userPass: any;

  constructor(private auth: AuthService, private router: Router){}

  async Register() {
    try {

      let user = await this.auth.register(this.userName, this.userMail, this.userPass);

      console.log('Usuario registrado y logueado automáticamente:', user);
      this.router.navigate(['/home']);

    } catch (e: any) {

      console.log(e.error?.message);

        
    } finally {
    }
}


}
