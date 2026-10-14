import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TypeLabelPipe } from './pokemon-format';

@Component({
  selector: 'app-type-badge',
  imports: [TypeLabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span
    class="badge"
    [style.--type-color]="'var(--type-' + type() + ', var(--muted))'"
    >{{ type() | typeLabel }}</span
  >`,
  styles: `
    .badge {
      display: inline-block;
      padding: 0.15rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #fff;
      background: var(--type-color);
      text-shadow: 0 1px 1px rgb(0 0 0 / 0.25);
    }
  `,
})
export class TypeBadge {
  readonly type = input.required<string>();
}
