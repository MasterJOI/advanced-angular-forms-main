import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    QueryList,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {animate, AnimationEvent, state, style, transition, trigger} from '@angular/animations';
import {OptionComponent} from './option/option.component';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, startWith, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';

export type SelectValue<T> = T | T[] | null;

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
    searchable = false;

    @Input()
    @HostBinding('class.disabled')
    disabled = false;

    @Input()
    displayWith: ((value: T) => string | number) | null = null;

    @Input()
    compareWith: ((v1: T | null, v2: T | null) => boolean) = (v1, v2) => v1 === v2;

    protected get displayValue() {
        if (this.displayWith && this.value) {

            if (Array.isArray(this.value)) {
                // return string with selected elements separated by a coma
                return this.value.map(this.displayWith);
            }

            return this.displayWith(this.value);
        }

        return this.value;
    }

    // true - activate multi-selection mode
    private selectionModel = new SelectionModel<T>(coerceBooleanProperty(this.multiple));

    @Input()
    set value(value: SelectValue<T>) {
        this.setupValue(value);
        this.onChange(this.value);
        this.highlightSelectedOptions();
    };

    private setupValue(value: SelectValue<T>) {
        this.selectionModel.clear();
        if (value) {
            if (Array.isArray(value)) {
                this.selectionModel.select(...value);
            } else {
                this.selectionModel.select(value);
            }
        }
    }

    get value() {
        if (this.selectionModel.isEmpty()) return null;

        if (this.selectionModel.isMultipleSelection()) {
            return this.selectionModel.selected;
        }

        return this.selectionModel.selected[0];
    }

    @HostBinding('class.select-panel-open')
    isOpen = false;

    @HostBinding('attr.tabIndex')
    @Input()
    tabIndex = 0;

    @HostListener('click')
    open() {
        if (this.disabled) return;

        this.isOpen = true;
        if (this.searchable) {
            requestAnimationFrame(() => this.searchInputEl.nativeElement.focus());
        }
        this.cd.markForCheck();
    }

    close() {
        this.isOpen = false;
        this.onTouched();

        this.hostEl.nativeElement.focus();
        this.cd.markForCheck();
    }

    @Output()
    readonly opened = new EventEmitter();

    @Output()
    readonly closed = new EventEmitter();

    @Output()
    selectionChanged = new EventEmitter<SelectValue<T>>();

    @Output()
    readonly searchChanged = new EventEmitter<string>();

    /* descendants: true - will find any OptionComponent inside template,
       descendants: false - find only direct children (one layer deep)
     */
    @ContentChildren(OptionComponent, {descendants: true})
    options!: QueryList<OptionComponent<T>>;

    @ViewChild('input')
    searchInputEl!: ElementRef<HTMLInputElement>;

    /*Unsubscribe Subject Strategy*/
    private unsubscribe$ = new Subject<void>();

    private optionMap = new Map<SelectValue<T>, OptionComponent<T>>();

    protected onChange: (newValue: SelectValue<T>) => void = () => {
    };
    protected onTouched: () => void = () => {
    };

    @HostListener('blur')
    markAsTouched() {
        if (this.disabled || this.isOpen) return;
        this.onTouched();
        this.cd.markForCheck();
    }

    private listKeyManager!: ActiveDescendantKeyManager<OptionComponent<T>>;

    constructor(
        private cd: ChangeDetectorRef,
        /*const STRING value that creates only ones when component instance was created*/
        @Attribute('multiple') private multiple: number | null,
        private hostEl: ElementRef
    ) {
    }

    @HostListener('keydown', ['$event'])
    protected onKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowDown' && !this.isOpen) {
            this.open();
            return;
        }

        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && this.isOpen) {
            this.listKeyManager.onKeydown(e);
        }

        if (e.key === 'Enter' && this.isOpen && this.listKeyManager.activeItem) {
            this.handleSelection(this.listKeyManager.activeItem);
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.cd.markForCheck();
    }

    writeValue(obj: SelectValue<T>): void {
        //assign new value to thw view
        this.setupValue(obj);
        this.highlightSelectedOptions();
        this.cd.markForCheck();
    }

    ngOnChanges(changes: SimpleChanges) {
        /*if (changes['compareWith']) {
          this.selectionModel.compareWith = changes['compareWith'].currentValue;
          this.highlightSelectedOptions();
        }*/
    }

    ngAfterContentInit() {
        /*init list key manager with type of Highlightable, withWrap tell to go back on opposite element of list if no other options*/
        this.listKeyManager = new ActiveDescendantKeyManager<OptionComponent<T>>(this.options).withWrap();
        this.listKeyManager.change.pipe(
            takeUntil(this.unsubscribe$)
        ).subscribe(itemIndex => {
            //Scroll to active element
            this.options.get(itemIndex)?.scrollInoView({
                behavior: 'smooth',
                block: 'center'
            });
        });

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
            return correspondingOption ? correspondingOption.value! : value;
        });
        this.selectionModel.clear();
        this.selectionModel.select(...valuesWithUpdatedReferences);
    }

    private findOptionsByValue(value: T) {
        if (this.optionMap.has(value)) {
            return this.optionMap.get(value);
        }

        return this.options && this.options.find(o => this.compareWith(o.value, value));
    }

    private handleSelection(option: OptionComponent<T>) {
        if (this.disabled) return;

        if (option.value) {
            /*this.selectionModel.toggle switch between select and remove methods*/
            this.selectionModel.toggle(option.value);
            //this.cd.markForCheck();
            this.selectionChanged.emit(this.value);
            this.onChange(this.value);
        }
        if (!this.selectionModel.isMultipleSelection()) this.close();
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

    clearSelection(e: MouseEvent) {
        e?.stopPropagation();

        if (this.disabled) return;

        this.selectionModel.clear();
        this.selectionChanged.emit(this.value);
        this.onChange(this.value);
        this.cd.markForCheck();
    }

    protected onHandleInput(e: Event) {
        this.searchChanged.emit((e.target as HTMLInputElement).value);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
