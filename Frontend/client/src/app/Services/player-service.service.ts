import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Player, PlayerPost} from './DTO/Player';

@Injectable({
  providedIn: 'root'
})
export class PlayerServiceService {
  private apiUrl='https://localhost:5281/api/players';
  constructor(private http:HttpClient) { }

  getAllPlayers(page: number, pageSize: number, clubId: number | null = null): Observable<any> {
if(clubId===null){
  return this.http.get(`${this.apiUrl}/paginated?page=${page}&pageSize=${pageSize}`);
}else {
    return this.http.get(`${this.apiUrl}/paginated?page=${page}&pageSize=${pageSize}&clubId=${clubId}`);
}
    //return this.http.get<Player[]>(this.apiUrl,{params});
  }

  addPlayer(player: FormData): Observable<PlayerPost> {
    return this.http.post<PlayerPost>(this.apiUrl, player);
  }

  updatePlayer(id: number, player: FormData): Observable<PlayerPost> {
    return this.http.put<PlayerPost>(`${this.apiUrl}/${id}`, player);
  }

  deletePlayer(id: number): Observable<PlayerPost> {
    return this.http.delete<PlayerPost>(`${this.apiUrl}/${id}`);
  }

}
