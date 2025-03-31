import {
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

const MOCK_DATABASE = ['John Doe', 'Jane Smith', 'Michael Brown'];

export function nameExistsValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (MOCK_DATABASE.includes(control.value)) {
          resolve({ nameTaken: true }); // If name exists, return error
        } else {
          resolve(null); // No error
        }
      }, 1000); // Simulate API delay
    });
  };
}
