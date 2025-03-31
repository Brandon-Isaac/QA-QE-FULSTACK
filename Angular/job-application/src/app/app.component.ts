import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {CommonModule} from '@angular/common';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule,NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  jobForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.jobForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      skills: this.fb.array([]),
    });
  }

  get skills() {
    return this.jobForm.get('skills') as FormArray;
  }

  addSkill() {
    this.skills.push(this.fb.control('', Validators.required));
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  submitForm() {
    if (this.jobForm.valid) {
      console.log('Job Application Submitted:', this.jobForm.value);
      alert('Application Submitted Successfully!');
      this.jobForm.reset();
      this.skills.clear();
    }
  }
}
