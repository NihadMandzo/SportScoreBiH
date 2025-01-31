import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Club} from '../Services/DTO/Club';


@Injectable({
  providedIn: 'root'
})
export class ClubServiceService {
  private apiUrl='https://localhost:5281/api/club'


  constructor(private http:HttpClient) { }

  getAllClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(this.apiUrl);
  }
  getClubID(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.apiUrl}/${id}`);
  }
}
