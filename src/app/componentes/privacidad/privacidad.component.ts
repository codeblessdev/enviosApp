import { Component } from '@angular/core';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.scss'
})
export class PrivacidadComponent {

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
