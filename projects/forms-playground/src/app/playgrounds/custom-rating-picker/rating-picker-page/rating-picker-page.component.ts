import {ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import '@polymer/paper-input/paper-textarea';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {EditableContentValueAccessor} from '../value-accessor/editable-content.directive';
import {
  RatingPickerComponent
} from '../../../../../../custom-form-controls/src/lib/rating-picker/rating-picker.component';
import {RatingOptions} from 'custom-form-controls';

interface Rating {
  reviewText: string;
  reviewRating: RatingOptions
}

@Component({
  selector: 'app-rating-picker-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EditableContentValueAccessor, RatingPickerComponent],
  templateUrl: './rating-picker-page.component.html',
  styleUrls: [
    '../../common-page.scss',
    './rating-picker-page.component.scss',
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingPickerPageComponent implements OnInit {

  form = this.fb.group<Rating>({
    reviewText: '',
    reviewRating: 'great'
  });

  constructor(
    private fb: FormBuilder
  ) {
    //this.form.controls.reviewText.disable();
    //this.form.controls.reviewRating.disable();
  }

  ngOnInit(): void {
  }

  onSubmit() {
    console.log(this.form.value);
    this.form.reset();
  }
}
