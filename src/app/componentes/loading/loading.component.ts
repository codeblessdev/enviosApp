import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  @Input() show: boolean = false;
  @Input() message: string = 'Cargando...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
