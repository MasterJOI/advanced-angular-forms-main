import {Component} from '@angular/core';
import {BaseDynamicControl, dynamicControlProvider, sharedDynamicControlDeps} from './base-dynamic-control';

@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [...sharedDynamicControlDeps],
  /*viewProviders resolves in scope of this view so if we can provide some value even if @Self decorator set
  * because formControlName directive needs provided ControlContainer inside internal view*/
  viewProviders: [dynamicControlProvider],
  template: `
    <label [for]="control.controlKey">{{control.config.label}}</label>
    <input
      [id]="control.controlKey"
      [type]="control.config.type"
      [value]="control.config.value"
      [formControlName]="control.controlKey"
    >
  `
})
export class DynamicInputComponent extends BaseDynamicControl {
}
