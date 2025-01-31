import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club } from './DTO/Club';

export interface NewsDTO {
  id?: number;
  title: string;
  content: string;
  dateTime: string;
  admin: AdminDTO;
  clubs: Club[];
  pictures: string[]; // Array of URLs instead of objects
}


export interface AdminDTO {
  id: number;
  firstName: string;
  lastName: string;
}

export interface PagedResult<T> {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private baseUrl = 'https://localhost:5281/api/';

  constructor(private http: HttpClient) {}

  getNews(): Observable<NewsDTO[]> {
    return this.http.get<NewsDTO[]>(`${this.baseUrl}News`);
  }

  getNewsById(id: number): Observable<NewsDTO> {
    return this.http.get<NewsDTO>(`${this.baseUrl}News/${id}`);
  }

  addNews(news: FormData): Observable<NewsDTO> {
    const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage

    // Set the Authorization header
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.post<NewsDTO>(`${this.baseUrl}News`, news, { headers });
  }

  deleteNews(newsId: number): Observable<void> {
    const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage

    //Set the Authorization header
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.delete<void>(`${this.baseUrl}News/${newsId}`);
  }

  updateNews(id: number, news: FormData): Observable<NewsDTO> {
    const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage

    // Set the Authorization header
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.put<NewsDTO>(`${this.baseUrl}News/${id}`, news);
  }


  getPaginatedNews(pageNumber: number, pageSize: number): Observable<PagedResult <NewsDTO>> {
    return this.http.get<PagedResult<NewsDTO>>(
      `${this.baseUrl}News/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }
  getNewsByClub(clubID: number, pageNumber: number, pageSize: number):Observable<PagedResult<NewsDTO>> {
    return this.http.get<PagedResult<NewsDTO>>(`${this.baseUrl}News/by-club/${clubID}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }
  // Funkcija koja vraća prediktivne vijesti na osnovu unosa
  getSearchPredictions(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}News/search/predictions?query=${query}`);
  }
}
