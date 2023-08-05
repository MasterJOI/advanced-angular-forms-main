import {Component} from '@angular/core';
import {BaseDynamicControl, dynamicControlProvider, sharedDynamicControlDeps} from './base-dynamic-control';
import {ValidatorMessageContainer} from '../../../core/input-error/validator-message-container.directive';

@Component({
  selector: 'app-dynamic-checkbox',
  standalone: true,
  viewProviders: [dynamicControlProvider],
  imports: [...sharedDynamicControlDeps, ValidatorMessageContainer],
  template: `
    <div>
      <input [id]="control.controlKey"
             type="checkbox"
             [value]="control.config.value"
             [formControlName]="control.controlKey"
             [errorContainer]="containerDir.container"
      >
      <label [for]="control.controlKey">{{control.config.label}}</label>
    </div>
    <ng-container validatorMessageContainer #containerDir="validatorMessageContainer"></ng-container>
  `,
  styles: [`
    :host > div {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
  `]
})
export class DynamicCheckboxComponent extends BaseDynamicControl {
}
