import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {UserInfo} from '../../../core/user-info';
import {BanWordsDirective} from '../validators/ban-words.directive';
import {PasswordShouldMatchDirective} from '../validators/password-should-match.directive';
import {UniqueNicknameDirective} from '../validators/unique-nickname.directive';
import {DynamicValidatorMessage} from '../../../core/dynamic-validator-message.directive';
import {ValidatorMessageContainer} from '../../../core/input-error/validator-message-container.directive';

@Component({
  selector: 'app-template-forms-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BanWordsDirective,
    PasswordShouldMatchDirective,
    UniqueNicknameDirective,
    DynamicValidatorMessage,
    ValidatorMessageContainer
  ],
  templateUrl: './template-forms-page.component.html',
  styleUrls: [
    '../../common-page.scss',
    '../../common-form.scss',
    './template-forms-page.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateFormsPageComponent implements OnInit, AfterViewInit {

  userInfo: UserInfo = {
    city: 'example',
    confirmPassword: '',
    email: 'example',
    firstName: '',
    fullAdress: 'example',
    lastName: 'example',
    nickname: 'example',
    passport: 'AA343234',
    password: '',
    postCode: 0,
    yearOfBirth: 2001
  };

  @ViewChild(NgForm)
  formDir!: NgForm;

  private initialFormValues: unknown;

  get isAdult() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.userInfo.yearOfBirth >= 18;
  }

  get years() {
    const now = new Date().getUTCFullYear();
    return Array(now - (now - 40)).fill('').map((_, idx) => now - idx);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    /*need to use microtask because form initiated asynchronously*/
    queueMicrotask(() => {
      this.initialFormValues = this.formDir.value;
    });
  }

  onSubmitForm(event: SubmitEvent) {
    if (this.formDir.invalid) return;
    console.log(this.formDir.value);
    console.log(event)

    //Strategy 1
    //this.formDir.resetForm();


    //Strategy 2 (leave values and reset only states)
    this.formDir.resetForm(this.formDir.value);
    this.initialFormValues = this.formDir.value;
  }

  onReset(e: Event) {
    e.preventDefault();
    this.formDir.resetForm(this.initialFormValues)
  }
}
