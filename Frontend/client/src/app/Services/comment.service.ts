import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from './DTO/Comment';

export interface CommentCreateDTO {
  comment: string;
  userID: number;
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
export class CommentService {
  private apiUrl = 'https://localhost:5281/api/Comment';

  constructor(private http: HttpClient) {}

  getCommentsForNews(newsId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/news/${newsId}`);
  }


  addComment(newsId: number, commentDto: CommentCreateDTO): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}?newsId=${newsId}`, commentDto);
  }


  updateComment(id: number, NewComment: string, UserId: number): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, { NewComment, UserId });
  }


  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reactToComment(commentId: number, userId: number, isLike: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/react?commentId=${commentId}&userId=${userId}&isLike=${isLike}`, {});
  }

  getPaginatedComments(pageNumber: number, pageSize: number): Observable<PagedResult<Comment>> {
    return this.http.get<PagedResult<Comment>>(`${this.apiUrl}/comments?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }
}