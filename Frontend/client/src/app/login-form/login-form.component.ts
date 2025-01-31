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
      this.loginService.login(this.loginForm.value).subscribe(
        (response) => {
          const token = response.accessToken;
          const refreshToken = response.refreshToken;

          try {
            const decodedToken: any = jwtDecode(token); // Dekodiraj token
            console.log('Decoded Token:', decodedToken); // Ispisuje cijeli token da provjeriš njegov sadržaj

            const userRole = decodedToken.role;
            const clubId = decodedToken.ClubId; // Ako koristiš ClubId
            const userID = decodedToken.UserId;  // Pravilno dekodiraj UserId (provjeri ime ključa)

            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('userID', userID);  // Pohrani userID
            localStorage.setItem('userRole', userRole);

            // Redirektaj korisnika na odgovarajući URL na temelju role
            if (userRole === 'Admin') {
              this.router.navigate(['/admin-navbar']);
            } else {
              this.router.navigate(['/news-page']);
            }
          } catch (error) {
            console.error('Error decoding token:', error);
            alert('Došlo je do pogreške pri dekodiranju tokena.');
          }
        },
        (error) => {
          console.error('Login failed:', error);
          alert('Neuspješna prijava. Provjerite email i lozinku.');
        }
      );
    }
  }

}
