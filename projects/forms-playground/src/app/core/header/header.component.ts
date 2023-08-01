import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  searchString = '';

  reactiveSearchString = new FormControl('');

  constructor() { }

  ngOnInit(): void {
    this.reactiveSearchString.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged(),
    ).subscribe(console.log);
  }

  /*Not use driven-template forms, because it hasn`t valueChanges observable to reactive approach*/
  findSomething(search: string) {
    console.log(search)
  }
}
