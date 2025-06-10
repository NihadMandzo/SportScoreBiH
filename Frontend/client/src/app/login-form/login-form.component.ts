import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {LoginService} from '../Services/login.service';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
})
export class LoginFormComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Form submitted with values:', this.loginForm.value);
      
      this.loginService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login response:', response);
          
          const token = response.accessToken;
          const refreshToken = response.refreshToken;

          if (!token) {
            console.error('No access token received');
            alert('Greška: Nije primljen token za pristup.');
            return;
          }

          try {
            const decodedToken: any = jwtDecode(token);
            console.log('Decoded Token:', decodedToken);

            const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedToken.role;
            const clubId = decodedToken.ClubId;
            const userID = decodedToken.UserId;

            console.log('User Role:', userRole);
            console.log('Club ID:', clubId);
            console.log('User ID:', userID);

            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userID', userID);
            localStorage.setItem('userRole', userRole);

            // Redirektaj korisnika na odgovarajući URL na temelju role
            if (userRole.toLowerCase() === 'admin') {
              console.log('User is admin, attempting to navigate to admin page...');
              this.router.navigate(['/admin']).then(success => {
                if (!success) {
                  console.error('Failed to navigate to admin page');
                  console.log('Current role in localStorage:', localStorage.getItem('userRole'));
                  alert('Greška pri preusmjeravanju na admin stranicu.');
                } else {
                  console.log('Successfully navigated to admin page');
                }
              });
            } else {
              console.log('User is not admin, attempting to navigate to user page...');
              this.router.navigate(['/user']).then(success => {
                if (!success) {
                  console.error('Failed to navigate to user page');
                  console.log('Current role in localStorage:', localStorage.getItem('userRole'));
                  alert('Greška pri preusmjeravanju na stranicu korisnika.');
                } else {
                  console.log('Successfully navigated to user page');
                }
              });
            }
          } catch (error) {
            console.error('Error decoding token:', error);
            alert('Došlo je do pogreške pri dekodiranju tokena.');
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Neuspješna prijava. Provjerite email i lozinku.');
        }
      });
    } else {
      console.log('Form is invalid:', this.loginForm.errors);
    }
  }
}
