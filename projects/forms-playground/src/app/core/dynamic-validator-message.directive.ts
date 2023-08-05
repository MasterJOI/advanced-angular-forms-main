import {ComponentRef, Directive, ElementRef, inject, Input, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {ControlContainer, FormGroupDirective, NgControl, NgForm, NgModel} from '@angular/forms';
import {EMPTY, fromEvent, iif, merge, skip, startWith, Subscription} from 'rxjs';
import {InputErrorComponent} from './input-error/input-error.component';
import {ErrorStateMatcher} from './input-error/error-state-matcher.service';

@Directive({
  selector: `
    [ngModel]:not([withoutValidationErrors]),
    [formControl]:not([withoutValidationErrors]),
    [formControlName]:not([withoutValidationErrors]),
    [formGroupName]:not([withoutValidationErrors]),
    [ngModelGroup]:not([withoutValidationErrors])
  `,
  standalone: true
})
export class DynamicValidatorMessage implements OnInit, OnDestroy {
  ngControl = inject(NgControl, { self: true, optional: true }) || inject(ControlContainer, { self: true });
  elementRef = inject(ElementRef);

  @Input()
  errorStateMatcher = inject(ErrorStateMatcher);

  @Input()
  errorContainer = inject(ViewContainerRef);

  private errorComponentRef: ComponentRef<InputErrorComponent> | null = null;
  private errorMessageSub!: Subscription;
  private parentContainer = inject(ControlContainer, { optional: true });

  get form() {
    return this.parentContainer?.formDirective as NgForm | FormGroupDirective | null;
  }

  ngOnInit() {
    /*use microtask because adding ngModelGroup directive instance to the form is asynchronous */
    queueMicrotask(() => {
      if (!this.ngControl.control) throw Error(`No control model for ${this.ngControl.name} control...`);

      this.errorMessageSub = merge(
        this.ngControl.control.statusChanges,
        fromEvent(this.elementRef.nativeElement, 'blur'),
        /*apply observable of ngSubmit is form is exists*/
        iif(() => !!this.form, this.form!.ngSubmit, EMPTY)
      ).pipe(
        startWith(this.ngControl.control),
        /*skip startWith on Template-driven form because it will emit first state by default*/
        skip(this.ngControl instanceof NgModel ? 1 : 0),
      ).subscribe(() => {
        if (this.errorStateMatcher.isErrorVisible(this.ngControl.control, this.form)) {

          if (!this.errorComponentRef) {
            this.errorComponentRef = this.errorContainer.createComponent(InputErrorComponent);
            this.errorComponentRef.changeDetectorRef.markForCheck();
          }

          this.errorComponentRef.setInput('errors', this.ngControl.errors);
        } else {
          this.errorComponentRef?.destroy();
          this.errorComponentRef = null;
        }
      });
    });
  }

  ngOnDestroy() {
    this.errorMessageSub?.unsubscribe();
  }
}
