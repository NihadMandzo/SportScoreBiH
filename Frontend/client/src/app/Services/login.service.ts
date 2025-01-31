import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'https://localhost:5281/api';
  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  refreshToken(refreshToken: string): Observable<any> {
    console.log('Sending refresh token request with:', refreshToken);

    return this.http
      .post(
        `${this.apiUrl}/refresh-token`,
        { token: refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
      .pipe(
        tap((response) => console.log('Refresh token response:', response)),
        catchError((error) => {
          console.error('Error during refresh token request:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    sessionStorage.clear();
  }
}
