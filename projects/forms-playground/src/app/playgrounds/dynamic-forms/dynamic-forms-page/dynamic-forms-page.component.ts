import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {map, Observable, Subject, switchMap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {DynamicFormConfig} from '../dynamic-forms.model';
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
  protected readonly comparatorFn = comparatorFn;

  protected formLoadingTrigger = new Subject<'user' | 'company'>();

  protected formConfig$!: Observable<{ form: FormGroup, config: DynamicFormConfig }>;

  constructor(
    private http: HttpClient,
    protected dynamicControlResolver: DynamicControlResolver
  ) {
  }

  ngOnInit() {
    this.formConfig$ = this.formLoadingTrigger.pipe(
      switchMap(config => this.http.get<DynamicFormConfig>(`assets/${config}.form.json`)),
      /*When new json config arrives, clean form model instance*/
      map(config => ({
        config,
        form: new FormGroup({})
      }))
    );
  }

  protected onSubmit(form: FormGroup) {
    console.log('Submitted from', form.value)
    form.reset();
  }
}
