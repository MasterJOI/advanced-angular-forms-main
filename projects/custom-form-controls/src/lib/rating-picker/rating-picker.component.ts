import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RatingOptions = 'great' | 'good' | 'neutral' | 'bad' | null;

@Component({
  selector: 'cfc-rating-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-picker.component.html',
  styleUrls: ['./rating-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RatingPickerComponent,
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingPickerComponent implements ControlValueAccessor, OnChanges {

  @Input()
  value: RatingOptions = null;

  @Input()
  disabled = false;

  @Output()
  changed = new EventEmitter<RatingOptions>();

  @Input()
  @HostBinding('attr.tabIndex')
  tabIndex = 0;

  @HostListener('blur')
  onBlur(e: Event) {
    this.onTouch();
  }

  // initialize onChange with no data because registerOnChange may be called after setValue() where onChange used
  onChange: (newValue: RatingOptions) => void = () => {};
  onTouch!: () => void;

  constructor(
    private cd: ChangeDetectorRef
  ) {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      //this.value = changes['value'].currentValue;
      this.onChange(changes['value'].currentValue);
    }
  }

  setValue(value: RatingOptions) {
    if (this.disabled) return;

    this.value = value;
    this.onChange(this.value);
    this.onTouch();
    this.changed.emit(value);
  }

  writeValue(obj: RatingOptions): void {
    this.value = obj;
    this.cd.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}
