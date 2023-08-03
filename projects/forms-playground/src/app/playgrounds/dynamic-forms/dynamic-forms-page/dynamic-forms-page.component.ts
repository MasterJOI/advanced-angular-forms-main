import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable, Subject, switchMap, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DynamicControl, DynamicFormConfig} from '../dynamic-forms.model';
import {banWords} from '../../reactive-forms/validators/ban-words.validator';
import {DynamicControlResolver} from '../dynamic-control-resolver.service';
import {ControlInjectorPipe} from '../control-injector.pipe';
import {comparatorFn} from '../dynamic-controls/base-dynamic-control';

@Component({
  selector: 'app-dynamic-forms-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ControlInjectorPipe],
  templateUrl: './dynamic-forms-page.component.html',
  styleUrls: [
    '../../common-page.scss',
    './dynamic-forms-page.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormsPageComponent implements OnInit {
  protected formLoadingTrigger = new Subject<'user' | 'company'>();

  protected formConfig$!: Observable<DynamicFormConfig>;

  form!: FormGroup;

  constructor(
    private http: HttpClient,
    protected dynamicControlResolver: DynamicControlResolver
  ) {
  }

  ngOnInit() {
    this.formConfig$ = this.formLoadingTrigger.pipe(
      switchMap(config => this.http.get<DynamicFormConfig>(`assets/${config}.form.json`)),
      tap(({controls}) => this.buildFrom(controls))
    );
  }

  private buildFrom(controls: DynamicFormConfig['controls']) {
    this.form = new FormGroup({});
    Object.keys(controls).forEach(key => {
      this.buildControls(key, controls[key], this.form);
    });
  }

  private buildControls(controlKey: string, config: DynamicControl, formGroup: FormGroup) {
    if (config.controlType === 'group') {
      this.buildGroup(controlKey, config.controls, formGroup);
      return;
    }
    const validators = this.resolveValidators(config);
    formGroup.addControl(controlKey, new FormControl(config.value, validators));
  }

  private buildGroup(controlKey: string, controls: DynamicControl['controls'], parentFormGroup: FormGroup) {
    if (!controls) return;

    const nestedFormGroup = new FormGroup({});
    Object.keys(controls).forEach(key => this.buildControls(key, controls[key], nestedFormGroup));
    parentFormGroup.addControl(controlKey, nestedFormGroup);
  }

  protected onSubmit() {
    console.log('Submitted from', this.form.value)
    this.form.reset();
  }

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

  protected readonly comparatorFn = comparatorFn;
}
