import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output
} from '@angular/core';
import {SelectValue} from '../select.component';
import {Highlightable} from '@angular/cdk/a11y';

@Component({
  selector: 'cfc-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionComponent<T> implements Highlightable {

  @Input()
  value: T | null = null;

  @Input()
  disabledReason = '';

  @Input()
  @HostBinding('class.disabled')
  disabled = false;

  // not allow to edit property directly, add class 'selected' if isSelected=true
  @HostBinding('class.selected')
  protected isSelected = false;

  @HostBinding('class.active')
  protected isActive = false;

  @Output()
  selected = new EventEmitter<OptionComponent<T>>();

  @HostListener('click')
  protected select() {
    if (this.disabled) return;

    this.isSelected = true;
    this.selected.emit(this);
  }

  constructor(
    private cd: ChangeDetectorRef,
    private el: ElementRef<HTMLElement>
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

  setActiveStyles(): void {
    this.isActive = true;
    this.cd.markForCheck();
  }
  setInactiveStyles(): void {
    this.isActive = false;
    this.cd.markForCheck();
  }

  scrollInoView(options: ScrollIntoViewOptions) {
    this.el.nativeElement.scrollIntoView(options);
  }
}
