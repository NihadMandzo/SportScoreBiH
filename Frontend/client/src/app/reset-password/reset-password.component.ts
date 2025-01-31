import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  email: string = '';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  onSubmit(): void {
    if (!this.email.trim()) {
      this.snackBar.open('Molimo unesite vašu email adresu.', 'U redu', { duration: 3000 });
      return;
    }

    this.http
      .post('https://localhost:5281/api/reset-password-request', { email: this.email }, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.snackBar.open('Email za resetovanje lozinke je poslan.', 'U redu', { duration: 3000 });
          this.email = '';
        },
        error: (error) => {
          console.error('Greška:', error);
          this.snackBar.open('Greška prilikom slanja zahtjeva. Pokušajte ponovo.', 'U redu', { duration: 3000 });
        }
      });
  }
}
