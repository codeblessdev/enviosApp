import { Component } from '@angular/core';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [],
  templateUrl: './terminos.component.html',
  styleUrl: './terminos.component.scss'
})
export class TerminosComponent {

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
