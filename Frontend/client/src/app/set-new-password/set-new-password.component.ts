import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-set-new-password',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './set-new-password.component.html',
  styleUrl: './set-new-password.component.css'
})
export class SetNewPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  token: string | null = null;
  showPasswords: boolean = false;

  togglePasswordsVisibility(): void {
    this.showPasswords = !this.showPasswords;
  }

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Dohvati token iz URL-a
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.snackBar.open('Token nije pronađen. Link možda nije ispravan.', 'U redu', { duration: 3000 });
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('Lozinke se ne podudaraju.', 'U redu', {duration: 3000});
      return;
    }

    if (this.newPassword.length < 8) {
      this.snackBar.open('Lozinka mora imati barem 8 karaktera.', 'U redu', {duration: 3000});
      return;
    }

    const payload = {
      token: this.token,
      newPassword: this.newPassword
    };

    this.http.post('https://localhost:5281/api/reset-password', payload, {responseType: 'text'})
      .subscribe({
        next: (response) => {
          console.log('Response:', response);
          this.snackBar.open('Lozinka je uspješno resetovana.', 'U redu', {duration: 3000});
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error:', error);
          this.snackBar.open('Došlo je do greške. Pokušajte ponovo.', 'U redu', {duration: 3000});
        }
      });
  }
}
