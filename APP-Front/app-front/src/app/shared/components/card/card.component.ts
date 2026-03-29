import { Component, Input, ChangeDetectionStrategy, ContentChild, TemplateRef, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() title?: string;
  @Input() hoverable = false;
  @Input() clickable = false;

  @ContentChild('headerTemplate', { read: TemplateRef }) headerTemplate?: TemplateRef<any>;
  @ContentChild('footerTemplate', { read: TemplateRef }) footerTemplate?: TemplateRef<any>;

  get hasHeaderContent(): boolean {
    return !!this.headerTemplate;
  }

  get hasFooterContent(): boolean {
    return !!this.footerTemplate;
  }

  onClick(): void {
    if (this.clickable) {
      // Emit click event if needed
    }
  }
}