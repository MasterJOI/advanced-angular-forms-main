import {Component} from '@angular/core';
import {BaseDynamicControl, dynamicControlProvider} from './base-dynamic-control';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-dynamic-checkbox',
  standalone: true,
  viewProviders: [
    dynamicControlProvider
  ],
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <input [id]="control.controlKey"
           type="checkbox"
           [value]="control.config.value"
           [formControlName]="control.controlKey"
    >
    <label [for]="control.controlKey">{{control.config.label}}</label>
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
