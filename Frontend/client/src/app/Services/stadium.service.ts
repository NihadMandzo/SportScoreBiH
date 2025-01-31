import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Picture} from './DTO/Picture';

export interface StadiumDto {
  id: number;
  name: string;
  capacity: number;
  latitude: number;
  longitude: number;
  stadiumPictures:Picture[];
}

@Injectable({
  providedIn: 'root'
})
export class StadiumService {
  private apiUrl='https://localhost:5281/api/Stadium'

  constructor(private http:HttpClient) { }

  getStadiumCoordinates(id: number): Observable<StadiumDto> {
    return this.http.get<StadiumDto>(`${this.apiUrl}/${id}`);
  }
}
