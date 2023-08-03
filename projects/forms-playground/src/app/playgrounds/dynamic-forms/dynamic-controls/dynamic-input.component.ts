import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {BaseDynamicControl, dynamicControlProvider} from './base-dynamic-control';

@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  /*viewProviders resolves in scope of this view so if we can provide some value even if @Self decorator set
  * because formControlName directive needs provided ControlContainer inside internal view*/
  viewProviders: [
    dynamicControlProvider
  ],
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
