import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  standalone: true,
  imports: [NgIf],
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  message: string = 'Uspjesno ste se registrovali';
  isRegistered :boolean = false;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  navigateToLogin(){
    this.router.navigate(['login-form']);
  }
  ngOnInit(): void {
    let token = this.route.snapshot.queryParamMap.get('token'); // Dobavljanje tokena iz URL-a
    if (token) {
      this.http.get(`https://localhost:5281/api/confirm-email?token=${token}`)
        .subscribe({
          next: (response: any) => {
            this.snackBar.open('Email je uspješno potvrđen.', 'U redu', { duration: 3000 });
            this.isRegistered=true;
            this.router.navigate(['/login']); // Preusmjeravanje na login stranicu
          },
          error: (error) => {
            this.snackBar.open('Greška prilikom potvrde emaila.', 'U redu', { duration: 3000 });
          }
        });
    } else {
      this.snackBar.open('Token nije pronađen.', 'U redu', { duration: 3000 });
    }
  }
}
