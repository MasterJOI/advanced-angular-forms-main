import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList, SimpleChanges
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {OptionComponent} from './option/option.component';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, startWith, Subject, switchMap, takeUntil, tap} from 'rxjs';

export type SelectValue<T> = T | null;

@Component({
  selector: 'cfc-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectComponent,
      multi: true
    }
  ],
  animations: [
    trigger('dropDown', [
      state('void', style({transform: 'scaleY(0)', opacity: 0})),
      state('*', style({transform: 'scaleY(1)', opacity: 1})),
      /* * => void === :enter and void => * === :leave*/
      transition(':enter', [animate('320ms cubic-bezier(0, 1, 0.45, 1.34)')]),
      transition(':leave', [animate('420ms cubic-bezier(0.88, -0.7, 0.86, 0.85)')]),
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent<T> implements ControlValueAccessor, OnChanges, AfterContentInit, OnDestroy {

  @Input()
  label = '';

  @Input()
  displayWith: ((value: T) => string | number) | null = null;

  @Input()
  compareWith: ((v1: T | null, v2: T | null) => boolean) = (v1, v2) => v1 === v2;

  protected get displayValue() {
    if (this.displayWith && this.value) {
      return this.displayWith(this.value);
    }

    return this.value;
  }

  private selectionModel = new SelectionModel<T>();

  @Input()
  set value(value: SelectValue<T>) {
    this.selectionModel.clear();
    if (value) {
      this.selectionModel.select(value);
    }
  };

  get value() {
    return this.selectionModel.selected[0] || null;
  }

  isOpen = false;

  @HostListener('click')
  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  @Output()
  readonly opened = new EventEmitter();

  @Output()
  readonly closed = new EventEmitter();

  @Output()
  selectionChanged = new EventEmitter<SelectValue<T>>();

  /* descendants: true - will find any OptionComponent inside template,
     descendants: false - find only direct children (one layer deep)
   */
  @ContentChildren(OptionComponent, {descendants: true})
  options!: QueryList<OptionComponent<T>>;

  /*Unsubscribe Subject Strategy*/
  private unsubscribe$ = new Subject<void>();

  private optionMap = new Map<SelectValue<T>, OptionComponent<T>>();

  constructor(
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    /*if (changes['compareWith']) {
      this.selectionModel.compareWith = changes['compareWith'].currentValue;
      this.highlightSelectedOptions();
    }*/
  }

  ngAfterContentInit() {
    queueMicrotask((() => this.highlightSelectedOptions()));

    // subscribe on selectionModel changed to get added and removed values and deselect removed value
    this.selectionModel.changed.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(values => {
      values.removed.forEach(rv => this.optionMap.get(rv)?.deselect());
      values.added.forEach(av => this.optionMap.get(av)?.highlightAsSelected())
    });

    /*QueryList has property changes that emits new list is its changes*/
    this.options.changes.pipe(
      /*Firstly start stream with current options*/
      startWith<QueryList<OptionComponent<T>>>(this.options),
      tap(() => this.refreshOptionsMap()),
      /*Immediately highlight selected after options object changes*/
      tap(() => queueMicrotask((() => this.highlightSelectedOptions()))),
      /*Then switchMap create new Observable with new list (and auto close old subscription)
       and merge all selected EventEmitters*/
      switchMap(options => merge(...this.options.map(o => o.selected))),
      /*Once any option emit (selected), it will update selectedOption variable*/
      takeUntil(this.unsubscribe$)
    ).subscribe(selectedOption => this.handleSelection(selectedOption));
  }

  private highlightSelectedOptions() {
    const valuesWithUpdatedReferences = this.selectionModel.selected.map(value => {
      const correspondingOption = this.findOptionsByValue(value);
      console.log('option', correspondingOption)
      return correspondingOption ? correspondingOption.value! : value;
    });
    this.selectionModel.clear();
    this.selectionModel.select(...valuesWithUpdatedReferences);
  }

  private findOptionsByValue(value: SelectValue<T>) {
    if (this.optionMap.has(value)) {
      return this.optionMap.get(value);
    }
    return this.options && this.options.find(o => this.compareWith(o.value, value));
  }

  private handleSelection(selectedOption: OptionComponent<T>) {
    /*this.selectionModel.toggle switch between select and remove methods*/
    if (selectedOption.value) {
      selectedOption.value && this.selectionModel.toggle(selectedOption.value);
      this.cd.markForCheck();
      this.selectionChanged.emit(this.value);
    }
    this.close();
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(obj: any): void {
  }

  onPanelAnimationDone({fromState, toState}: AnimationEvent) {
    if (fromState === 'void' && toState === null && this.isOpen) {
      this.opened.emit();
    }

    if (fromState === null && toState === 'void' && !this.isOpen) {
      this.closed.emit();
    }
  }

  private refreshOptionsMap() {
    this.optionMap.clear();
    this.options.forEach(o => this.optionMap.set(o.value, o));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
