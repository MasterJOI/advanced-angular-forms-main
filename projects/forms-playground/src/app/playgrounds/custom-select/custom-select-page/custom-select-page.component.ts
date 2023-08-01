import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'custom-form-controls';
import { User } from '../../../core/user';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-select-page',
  standalone: true,
  imports: [CommonModule, SelectModule, ReactiveFormsModule],
  templateUrl: './custom-select-page.component.html',
  styleUrls: [
    '../../common-page.scss',
    './custom-select-page.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomSelectPageComponent implements OnInit {

  selectedValue = new User(2, 'Niels Bohr', 'niels', 'Denmark');

  users: User[] = [
    new User(1, 'Albert Einstein', 'albert', 'Germany/USA'),
    new User(2, 'Niels Bohr', 'niels', 'Denmark'),
    new User(3, 'Marie Curie', 'marie', 'Poland/French'),
    new User(4, 'Isaac Newton', 'isaac', 'United Kingdom'),
    new User(5, 'Stephen Hawking', 'stephen', 'United Kingdom', true),
    new User(6, 'Max Planck', 'max', 'Germany'),
    new User(7, 'James Clerk Maxwell', 'james', 'United Kingdom'),
    new User(8, 'Michael Faraday', 'michael', 'United Kingdom'),
    new User(9, 'Richard Feynman', 'richard', 'USA'),
    new User(10, 'Ernest Rutherford', 'ernest', 'New Zealand'),
  ];

  filteredUsers = this.users;

  // @ViewChild(SelectComponent) select!: SelectComponent<User>;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.selectedValue = new User(3, 'Marie Curie', 'marie', 'Poland/French');
      this.users = [
        new User(1, 'Albert Einstein', 'albert', 'Germany/USA'),
        new User(2, 'Niels Bohr', 'niels', 'Denmark'),
        new User(3, 'Marie Curie', 'marie', 'Poland/French')];
      this.cd.markForCheck();
    }, 3000);
  }

  onSelectionChange(value: any) {
    console.log('Selected value:', value);
  }

  displayWithFn(user: User) {
    return user.nickname;
  }

  compareWithFn(user1: User | null, user2: User | null) {
    return user1?.id === user2?.id;
  }
}
