import {Directive, HostBinding, inject, OnInit, StaticProvider} from "@angular/core";
import {CONTROL_DATA} from '../control-data.token';
import {
  AbstractControl,
  ControlContainer,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {CommonModule, KeyValue} from '@angular/common';
import {DynamicControl} from '../dynamic-forms.model';
import {banWords} from '../../reactive-forms/validators/ban-words.validator';
import {DynamicValidatorMessage} from '../../../core/dynamic-validator-message.directive';

/*To provide not only FormGroup but any realization of ControlContainer (NgForm, FormGroupName...),
we use factory function which get closest ControlContainer but start from parent view*/
export const dynamicControlProvider: StaticProvider = {
  provide: ControlContainer,
  useFactory: () => inject(ControlContainer, {skipSelf: true})
}

export const sharedDynamicControlDeps = [CommonModule, ReactiveFormsModule, DynamicValidatorMessage];

export const comparatorFn = (a: KeyValue<string, DynamicControl>, b: KeyValue<string, DynamicControl>): number => {
  // if number > 0 = a after b
  return a.value.order - b.value.order;
};

@Directive()
export class BaseDynamicControl implements OnInit {

  @HostBinding('class') hostClass = 'form-field';

  control = inject(CONTROL_DATA);
  protected parentGroupDir = inject(ControlContainer);

  formControl: AbstractControl = new FormControl(
    this.control.config.value,
    this.resolveValidators(this.control.config)
  );

  private resolveValidators({validators = {}}: DynamicControl) {
    return (Object.keys(validators) as Array<keyof typeof validators>).map(validatorKey => {
      const validatorValue = validators[validatorKey];

      if (validatorKey === 'required') {
        return Validators.required;
      }

      if (validatorKey === 'requiredTrue') {
        return Validators.requiredTrue;
      }

      if (validatorKey === 'email') {
        return Validators.email;
      }

      if (validatorKey === 'minLength' && typeof validatorValue === 'number') {
        return Validators.minLength(validatorValue);
      }

      if (validatorKey === 'banWords' && Array.isArray(validatorValue)) {
        return banWords(validatorValue);
      }

      // empty validator
      return Validators.nullValidator;
    })
  }

  ngOnInit() {
    (this.parentGroupDir.control as FormGroup).addControl(this.control.controlKey, this.formControl);
  }

}
