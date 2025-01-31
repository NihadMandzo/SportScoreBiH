import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {RegisterServiceService} from '../Services/register-service.service';
import {Router, RouterModule} from '@angular/router';
import zxcvbn from 'zxcvbn';
import {ClubServiceService} from '../Services/club-service.service';
import {Club} from '../Services/DTO/Club';
import * as Sentry from "@sentry/angular"





@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  passwordStrength: string = '';
  //registerService:RegisterServiceService;
  showPassword: boolean | undefined
  //private router: any;
  clubs: Club[] = [];


  constructor(private fb: FormBuilder, private registerService: RegisterServiceService, private router: Router, private ClubService: ClubServiceService) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      club: [null],
      phoneNumber:['']

    }, {
      validators: this.passwordMatchValidator // Validator za podudaranje lozinki
    });
    this.getClubs();
  }


  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return {passwordMismatch: true};
    }
    return null;
  }

  onPasswordInput(event: Event): void {
    const password = (event.target as HTMLInputElement).value;
    const result = zxcvbn(password);

    switch (result.score) {
      case 0:
        this.passwordStrength = 'Very Weak';
        break;
      case 1:
        this.passwordStrength = 'Very Weak';
        break;
      case 2:
        this.passwordStrength = 'Fair';
        break;
      case 3:
        this.passwordStrength = 'Good';
        break;
      case 4:
        this.passwordStrength = 'Strong';
        break;
      default:
        this.passwordStrength = '';
    }
  }

  getClubs(): void {
    this.ClubService.getAllClubs().subscribe(data => {

        this.clubs = data;
        console.log(this.clubs)
      },
      error => console.log(error)
    );
  }





  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;

      // Priprema podataka za slanje na backend
      const userData = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        phoneNumber:formValue.phoneNumber|| null,
        clubId: formValue.club ? formValue.club.id : null,
        emailConfirmationToken: ''// Šalji null ako nema kluba
      };

      console.log('Podaci koji se šalju na backend:', userData);

      this.registerService.register(userData).subscribe({
        next: (response) => {
          alert('Registracija uspješna!');
          this.registerForm.reset(); // Resetovanje forme
          this.router.navigate(['/login-form']); // Navigacija na login stranicu
        },
        error: (error) => {
          if (error.status === 400 && error.error) {
            console.error('Greška pri registraciji:', error.error);
            alert(error.error.message || 'Greška prilikom registracije.');
          } else {
            alert('Došlo je do greške prilikom registracije.');
          }
        },
      });
    } else {
      alert('Forma nije validna!');
    }
  }
}
