import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from './DTO/Comment';

export interface CommentCreateDTO {
  comment: string;
  userID: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'https://localhost:5281/api/Comment';

  constructor(private http: HttpClient) {}

  // Get all comments for a specific news item
  getCommentsForNews(newsId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/news/${newsId}`);
  }

  // Add a new comment to a specific news item
  addComment(newsId: number, commentDto: CommentCreateDTO): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}?newsId=${newsId}`, commentDto);
  }

  // Update a comment by ID
  updateComment(id: number, NewComment: string, UserId: number): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, { NewComment, UserId });
  }

  // Delete a comment by ID
  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reactToComment(commentId: number,userId:number, isLike: boolean): Observable<any> {
  return this.http.put<any>(`https://localhost:5281/api/Comment/react?commentId=${commentId}&userId=${userId}&isLike=${isLike}`, {});
}
}