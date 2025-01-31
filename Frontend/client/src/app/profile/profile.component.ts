import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import {FormsModule} from '@angular/forms';
import {RoleServiceService} from '../Services/role-service.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [
    FormsModule
  ]
})
export class ProfileComponent implements OnInit {
  user = {
    id: 0,
    userName: '',
    eMail: '',
    phoneNumber: '',
  };

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router,
              protected authService : RoleServiceService) {}

  ngOnInit(): void {
    this.loadUserData();

  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  goToHome() {
    this.router.navigate(['/']); // Navigacija na početnu stranicu
  }
  loadUserData(): void {
    const userId = localStorage.getItem('userID');
    console.log('User ID from localStorage:', userId); // Provjera vrijednosti

    if (!userId) {
      this.snackBar.open('Korisnik nije prijavljen.', 'U redu', { duration: 3000 });
      this.router.navigate(['/']);  // Možeš preusmjeriti korisnika na login ako userID nije prisutan
      return;
    }

    this.http.get(`https://localhost:5281/api/user-profile?userId=${userId}`, { headers: this.getAuthHeaders() }).subscribe({
      next: (response: any) => {
        console.log("Odgovor",response);
        this.user = response;

      },
      error: () => {
        this.snackBar.open('Došlo je do greške prilikom učitavanja korisničkih podataka.', 'U redu', { duration: 3000 });
      },
    });
  }


  updateProfile(): void {
    this.http.put('https://localhost:5281/api/update-profile', this.user, { headers: this.getAuthHeaders() }).subscribe({
      next: () => {
        this.snackBar.open('Profil uspješno ažuriran.', 'U redu', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Došlo je do greške prilikom ažuriranja profila.', 'U redu', { duration: 3000 });
      },
    });
  }

  deleteProfile(): void {
    if (confirm('Da li ste sigurni da želite obrisati profil? Ova akcija je nepovratna.')) {
      this.http.delete(`https://localhost:5281/api/delete-profile/${this.user.id}`, { headers: this.getAuthHeaders() }).subscribe({
        next: () => {
          this.snackBar.open('Profil je uspješno obrisan.', 'U redu', { duration: 3000 });
          localStorage.clear();
          this.router.navigate(['/']);
        },
        error: () => {
          this.snackBar.open('Došlo je do greške prilikom brisanja profila.', 'U redu', { duration: 3000 });
        },
      });
    }
  }
}
