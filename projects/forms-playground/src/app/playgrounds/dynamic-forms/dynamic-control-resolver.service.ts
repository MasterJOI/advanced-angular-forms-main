import {Injectable, Type} from '@angular/core';
import {DynamicControl} from './dynamic-forms.model';
import {DynamicInputComponent} from './dynamic-controls/dynamic-input.component';
import {DynamicSelectComponent} from './dynamic-controls/dynamic-select.component';
import {DynamicCheckboxComponent} from './dynamic-controls/dynamic-checkbox.component';
import {DynamicGroupComponent} from './dynamic-controls/dynamic-group.component';
import {from, of, tap} from 'rxjs';

type DynamicControlsMap = {
  [T in DynamicControl['controlType']]: () => Promise<Type<any>>;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicControlResolver {

  private lazyControlComponents: DynamicControlsMap = {
    input: () => import('./dynamic-controls/dynamic-input.component').then(c => c.DynamicInputComponent),
    select: () => import('./dynamic-controls/dynamic-select.component').then(c => c.DynamicSelectComponent),
    checkbox: () => import('./dynamic-controls/dynamic-checkbox.component').then(c => c.DynamicCheckboxComponent),
    group: () => import('./dynamic-controls/dynamic-group.component').then(c => c.DynamicGroupComponent)
  };

  private loadedControlComponents = new Map<string, Type<any>>();


  resolve(controlType: keyof DynamicControlsMap) {
    const loadedComponent = this.loadedControlComponents.get(controlType);
    if (loadedComponent) {
      return of(loadedComponent);
    }
    return from(this.lazyControlComponents[controlType]()).pipe(
      tap(component => this.loadedControlComponents.set(controlType, component))
    );
  }
}
