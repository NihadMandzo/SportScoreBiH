import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AIServiceService {
  private apiUrl = 'https://localhost:5281/api/ask';
  constructor(private http: HttpClient) { }

  askQuestion(prompt: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { prompt }; // Podaci za slanje

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
