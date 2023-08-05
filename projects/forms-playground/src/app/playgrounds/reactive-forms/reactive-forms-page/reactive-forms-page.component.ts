import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators} from '@angular/forms';
import {bufferCount, filter, Observable, startWith, Subscription, tap} from 'rxjs';
import {UserSkillsService} from '../../../core/user-skills.service';
import {banWords} from '../validators/ban-words.validator';
import {passwordShouldMatch} from '../validators/password-should-match.validator';
import {UniqueNicknameValidator} from '../validators/unique-nickname.validator';
import {DynamicValidatorMessage} from '../../../core/dynamic-validator-message.directive';
import {ErrorStateMatcher, OnTouchedErrorStateMatcher} from '../../../core/input-error/error-state-matcher.service';
import {ValidatorMessageContainer} from '../../../core/input-error/validator-message-container.directive';

@Component({
  selector: 'app-reactive-forms-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicValidatorMessage, ValidatorMessageContainer],
  templateUrl: './reactive-forms-page.component.html',
  styleUrls: [
    '../../common-page.scss',
    '../../common-form.scss',
    './reactive-forms-page.component.scss'
  ],
  providers: [
    {
      provide: ErrorStateMatcher,
      useClass: ErrorStateMatcher // any other custom ErrorStateMather
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReactiveFormsPageComponent implements OnInit, OnDestroy {

  phoneLabels = ['Main', 'Mobile', 'Work', 'Home'];
  skills$!: Observable<string[]>;
  private ageValidators!: Subscription;
  private formPendingState!: Subscription;

  @ViewChild(FormGroupDirective)
  private formDir!: FormGroupDirective

  private initialFormValues: any;

  /*to dynamically add or remove validators with different values we need to store and pass reference on this validator*/
  dynamicValidator = Validators.minLength(10);

  customShowErrorStrategy = new OnTouchedErrorStateMatcher();

  // Old code style
  /*form = new FormGroup({
    //nonNullable - initial value become default value, so after reset formControl, value will be 'Kyryll'
    firstName: new FormControl<string>('Kyryll', { nonNullable: true}),
    //lastName: new UntypedFormControl('Hlum'), // old implementation
    lastName: new FormControl('Hlum'),
    nickname: new FormControl(''),
    email: new FormControl('sdfsdf@sdf.gmail'),
    yearOfBirth: new FormControl(this.years[this.years.length - 1], { nonNullable: true}),
    passport: new FormControl(''),
    address: new FormGroup({
      fullAddress: new FormControl('', { nonNullable: true}),
      city: new FormControl('', { nonNullable: true}),
      postCode: new FormControl('0', { nonNullable: true}),
    }),
    phones: new FormArray([
      new FormGroup({
        label: new FormControl(this.phoneLabels[0], { nonNullable: true}),
        phone: new FormControl('')
      })
    ]),
    /!*skills: new FormGroup<{[key: string]: FormControl<boolean>}>({})*!/
    /!*better use FormRecord if we have open ended list of controls and don`t now what key types*!/
    /!*but FormRecord also allow to insert any possible keys, so if we know what keys we need, better use FormGroup with type*!/
    skills: new FormRecord<FormControl<boolean>>({})
  });*/

  // Better use FormBuilder
  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(4), banWords(['test', 'admin'])]],
    lastName: ['Mezhenskyi', [Validators.required, Validators.minLength(2)]],
    nickname: ['',
      {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern(/^[\w.]+$/)
        ],
        asyncValidators: [
          /*need to bind unique validator to fnd httpService*/
          this.uniqueNicknameValidator.validate.bind(this.uniqueNicknameValidator)
        ],
        updateOn: 'blur'
      }

    ],
    email: ['dmytro@decodedfrontend.io', [Validators.email, Validators.required]],
    yearOfBirth: this.fb.nonNullable.control(
      this.years[this.years.length - 1],
      Validators.required
    ),
    passport: ['', [Validators.pattern(/^[A-Z]{2}[0-9]{6}$/)]],
    address: this.fb.nonNullable.group({
      fullAddress: ['', Validators.required],
      city: ['', Validators.required],
      postCode: [0, Validators.required]
    }),
    phones: this.fb.array([
      this.fb.group({
        label: this.fb.nonNullable.control(this.phoneLabels[0]),
        phone: ''
      })
    ]),
    skills: this.fb.record<boolean>({}),
    password: this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ''
    }, {
      validators: passwordShouldMatch
    })
  });


  constructor(
    private userSkillsService: UserSkillsService,
    private uniqueNicknameValidator: UniqueNicknameValidator,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    // automatically union type with null, because after reset control, set null value if not provided
    // but can be overwritten with option { nonNullable: true}
    //this.form.controls.firstName.setValue(null);

    // don`t use UntypedFormControl
    //this.form.controls.lastName.setValue({});
  }

  get years() {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 40)).fill('').map((_, idx) => now - idx);
  }

  ngOnInit() {
    this.skills$ = this.userSkillsService.getSkills().pipe(
      tap(skills => this.buildSkillControls(skills)),
      tap(() => this.initialFormValues = this.form.value)
    );

    this.ageValidators = this.form.controls.yearOfBirth.valueChanges.pipe(
      tap(() => this.form.controls.passport.markAsDirty()),
      startWith(this.form.controls.yearOfBirth.value),
    ).subscribe(yearOfBirth => {
        this.isAdult(yearOfBirth)
          ? this.form.controls.passport.addValidators(Validators.required)
          : this.form.controls.passport.removeValidators(Validators.required);
        this.form.controls.passport.updateValueAndValidity();
      }
    )

    this.formPendingState = this.form.statusChanges.pipe(
      bufferCount(2, 1),
      filter(([prevState]) => prevState === 'PENDING')
    ).subscribe(() => this.cd.markForCheck())
  }

  addPhone() {
    this.form.controls.phones.push(new FormGroup({
        label: new FormControl(this.phoneLabels[0], {nonNullable: true}),
        phone: new FormControl('')
      })
    );
  }

  removePhone(index: number) {
    this.form.controls.phones.removeAt(index);
  }

  onSubmit() {
    this.initialFormValues = this.form.value;

    //Reset Startegy 1 (full reset)
    //this.form.reset();
    // to reset also form-submitted status, this method isn`t type safe
    //this.formDir.resetForm();

    //Reset Stratagy 2 (remind formControl value by user)]this.formDir.resetForm();
    this.formDir.resetForm(this.form.value)
  }

  private buildSkillControls(skills: string[]) {
    skills.forEach(skill => {
      this.form.controls.skills.addControl(skill, new FormControl(false, {nonNullable: true}))
    });
  }

  private isAdult(yearOfBirth: number): boolean {
    const currentYear = new Date().getFullYear();
    return currentYear - yearOfBirth >= 18;
  }

  ngOnDestroy() {
    this.ageValidators.unsubscribe();
    this.formPendingState.unsubscribe();
  }

  onReset(e: Event) {
    e.preventDefault();
    this.formDir.resetForm(this.initialFormValues);
  }
}
