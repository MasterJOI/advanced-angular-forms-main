import {inject, Injector, Pipe, PipeTransform} from '@angular/core';
import {DynamicControl} from './dynamic-forms.model';
import {CONTROL_DATA} from './control-data.token';

@Pipe({
  name: 'controlInjector',
  standalone: true
})
export class ControlInjectorPipe implements PipeTransform {

  injector = inject(Injector);

  /*transform input control data to Injector with InjectionToken with this data*/
  transform(controlKey: string, config: DynamicControl): Injector {
    return Injector.create({
      // by default parent injector is NullInjector so wee need to inject the closest injector with
      // injector chain so angular can traverse upwards during dependency injection to find FormGroup
      parent: this.injector,
      providers: [
        {
          provide: CONTROL_DATA,
          useValue: {
            controlKey,
            config
          }
        }
      ]
    });
  }
}
