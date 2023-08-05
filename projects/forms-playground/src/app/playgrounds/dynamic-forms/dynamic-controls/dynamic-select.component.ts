import {Component} from '@angular/core';
import {BaseDynamicControl, dynamicControlProvider, sharedDynamicControlDeps} from './base-dynamic-control';

@Component({
  selector: 'app-dynamic-select',
  standalone: true,
  imports: [...sharedDynamicControlDeps],
  viewProviders: [dynamicControlProvider],
  template: `
    <label [for]="control.controlKey">{{control.config.label}}</label>
    <select
      [id]="control.controlKey"
      [value]="control.config.value"
      [formControlName]="control.controlKey"
    >
      <option
        *ngFor="let option of control.config.options"
        [value]="option.value"
      >{{option.label}}</option>
    </select>
  `
})
export class DynamicSelectComponent extends BaseDynamicControl {

}
