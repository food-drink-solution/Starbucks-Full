/**
 * Shim module for backwards compatibility with older lucide-angular usage.
 * The modern @lucide/angular package uses individual standalone components,
 * but this wrapper provides a module export for easier migration.
 */
import { NgModule, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideDynamicIcon } from '@lucide/angular';

/**
 * Wrapper component that mimics the old <lucide-angular> element selector
 */
@Component({
  selector: 'lucide-angular, i-lucide',
  standalone: true,
  imports: [LucideDynamicIcon],
  template: `<svg [lucideIcon]="name" [size]="size" [color]="color" [strokeWidth]="strokeWidth" [absoluteStrokeWidth]="absoluteStrokeWidth"></svg>`
})
export class LucideAngularComponent {
  @Input() name!: string;
  @Input() size: number | string = 24;
  @Input() color?: string;
  @Input() strokeWidth?: number | string;
  @Input() absoluteStrokeWidth?: boolean;
}

/**
 * Module that exports the wrapper component
 */
@NgModule({
  imports: [CommonModule, LucideAngularComponent],
  exports: [LucideAngularComponent]
})
export class LucideAngularModule {}
