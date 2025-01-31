import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegisterServiceService {

  private apiUrl = 'https://localhost:5281/api/register';
  constructor(private http: HttpClient) { }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}`, userData, { responseType: 'text' });
  }
}
