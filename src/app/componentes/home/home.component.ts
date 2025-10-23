import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  user$!: Observable<any | null>;
  isLogged: boolean = false;

  constructor(private router: Router,  private auth: AuthService){
    this.user$ = this.auth.getUserObservable();

    this.auth.user$.subscribe(user => {
      if (user) {
        this.isLogged = true;
      }

    });
  }

  prueba(){

    if(!this.isLogged){
      this.router.navigate(['/login']);
    }
    else{
      this.router.navigate(['/envios']);
    }
    
  }

}
