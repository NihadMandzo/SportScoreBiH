import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { CommentService, PagedResult } from '../../Services/comment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Comment } from '../../Services/DTO/Comment';

@Component({
  selector: 'app-admin-comments',
  templateUrl: './admin-comments.component.html',
  styleUrls: ['./admin-comments.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    DatePipe
  ]
})
export class AdminCommentsComponent implements OnInit {
  commentsList: Comment[] = [];
  displayedColumns: string[] = ['username', 'comment', 'dateTime', 'likes', 'akcije'];
  dataSource = new MatTableDataSource<Comment>([]);
  totalItems: number = 0;
  pageSize: number = 10;
  pageNumber: number = 1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private commentService: CommentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.commentService.getPaginatedComments(this.pageNumber, this.pageSize).subscribe({
      next: (response: PagedResult<Comment>) => {
        this.commentsList = response.items;
        this.totalItems = response.totalItems;
        this.dataSource.data = this.commentsList;
      },
      error: (error: any) => {
        console.error('Error loading comments:', error);
        this.snackBar.open('Greška pri učitavanju komentara', 'Zatvori', {
          duration: 3000
        });
      }
    });
  }

  deleteComment(id: number): void {
    if (confirm('Da li ste sigurni da želite izbrisati ovaj komentar?')) {
      this.commentService.deleteComment(id).subscribe({
        next: () => {
          this.snackBar.open('Komentar uspješno obrisan', 'Zatvori', {
            duration: 3000
          });
          this.loadComments();
        },
        error: (error: any) => {
          console.error('Error deleting comment:', error);
          this.snackBar.open('Greška pri brisanju komentara', 'Zatvori', {
            duration: 3000
          });
        }
      });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadComments();
  }
}
