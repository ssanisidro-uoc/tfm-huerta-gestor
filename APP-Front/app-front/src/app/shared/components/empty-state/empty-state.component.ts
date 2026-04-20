import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() icon: string = '';
  @Input() title: string = 'No hay datos';
  @Input() message: string = '';
  @Input() actionLabel: string = '';
  @Input() actionCallback?: () => void;
}