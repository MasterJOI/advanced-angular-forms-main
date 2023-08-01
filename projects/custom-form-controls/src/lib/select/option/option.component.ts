import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from '@angular/core';
import {SelectValue} from '../select.component';

@Component({
  selector: 'cfc-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionComponent<T> {

  @Input()
  value: SelectValue<T> = null;

  @Input()
  disabledReason = '';

  @Input()
  @HostBinding('class.disabled')
  disabled = false;

  // not allow to edit property directly, add class 'selected' if isSelected=true
  @HostBinding('class.selected')
  protected isSelected = false;

  @Output()
  selected = new EventEmitter<OptionComponent<T>>();

  @HostListener('click')
  protected select() {
    if (this.disabled) return;

    this.isSelected = true;
    this.selected.emit(this);
  }

  constructor(
    private cd: ChangeDetectorRef
  ) {
  }

  deselect() {
    this.isSelected = false;
    this.cd.markForCheck();
  }

  highlightAsSelected() {
    this.isSelected = true;
    this.cd.markForCheck();
  }
}
