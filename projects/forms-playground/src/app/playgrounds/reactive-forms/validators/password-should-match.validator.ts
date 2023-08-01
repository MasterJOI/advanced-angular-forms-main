import {AbstractControl, ValidationErrors} from "@angular/forms";

export function passwordShouldMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  const error = {passwordShouldMatch: {mismatch: true}};
  if (password?.value === confirmPassword?.value) {
    confirmPassword?.setErrors(null);
    return null;
  }

  confirmPassword?.setErrors(error);
  return error;
}
