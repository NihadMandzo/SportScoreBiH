import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsDTO, NewsService } from '../../Services/news-service.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImageModalComponent } from '../../image-modal/image-modal.component';
import { CommentService } from '../../Services/comment.service';
import { Comment } from '../../Services/DTO/Comment';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { MatButtonModule } from '@angular/material/button';
import { faThumbsUp, faThumbsDown, faUser, faCalendar } from '@fortawesome/free-solid-svg-icons';
import {QRCodeComponent} from 'angularx-qrcode';
import { NgxImageZoomModule } from 'ngx-image-zoom';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    CommonModule,
    MatIconModule,
    FontAwesomeModule,
    FormsModule,
    MatButtonModule,
    QRCodeComponent,
    NgxImageZoomModule
  ],
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.css'], // Fixed 'styleUrls' typo
})
export class NewsDetailsComponent implements OnInit {
  @ViewChild('commentsDialog') commentsDialog!: TemplateRef<any>;

  newsId: number = 0;
  newsDetails: NewsDTO = {
    id: 0,
    title: '',
    content: '',
    dateTime: '',
    admin: { id: 0, firstName: '', lastName: '' },
    clubs: [],
    pictures: [],
  }; // Made optional to handle undefined scenarios
  activeSlide: number = 0;
  faTwitter = faTwitter;
  faWhatsapp = faWhatsapp;
  faCopy = faCopy;
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  faUser = faUser;
  faCalendar = faCalendar;
  isCopied = false;
  comments: Comment[] = []; // Holds the top 3 comments
  allComments: Comment[] = []; // Holds all comments for the dialog
  newComment: string = ''; // For adding a new comment
  loggedInUsername: string = '';
  decodedToken: any = '';
  dialogRef!: MatDialogRef<any>;
  loggedInUserId: number = 0;

  qrCodeValue: string = '';

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService,
    private location: Location,
    private dialog: MatDialog,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.newsId = +id; // Convert to a number
      this.getNewsDetails(this.newsId);
      this.qrCodeValue = `${this.newsDetails.title} - ${window.location.href}`;
      this.loadComments();
    } else {
      console.error('Invalid news ID in the route');
    }
    const token: any = localStorage.getItem('accessToken');
    this.decodedToken = jwtDecode(token);
    this.extractUsernameFromToken();
  }
  extractUsernameFromToken(): void {
    // Replace with your token storage mechanism
    if (this.decodedToken) {
      try {
        this.loggedInUsername = this.decodedToken.Username;
        this.loggedInUserId = Number(this.decodedToken.UserId); // Adjust the key based on your token structure
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  getNewsDetails(id: number): void {
    this.newsService.getNewsById(id).subscribe({
      next: (response) => {
        this.newsDetails = response;
      },
      error: (err) => {
        console.error('Error fetching news details:', err);
      },
    });
  }

  previousSlide(): void {
    if (this.activeSlide > 0) {
      this.activeSlide--;
    }
  }

  nextSlide(): void {
    if (this.activeSlide < this.newsDetails.pictures.length - 1) {
      this.activeSlide++;
    }
  }

  canNavigateLeft(): boolean {
    return this.activeSlide > 0;
  }

  canNavigateRight(): boolean {
    return this.activeSlide < this.newsDetails.pictures.length - 1;
  }

  goBack(): void {
    this.location.back(); // Navigate to the previous page
  }

  shareOnWhatsApp(): void {
    const url = window.location.href;
    const message = `Pogledajte ovu vijest na platformi SportScoreBiH ${url}`; 
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  shareOnTwitter(): void {
    const text = encodeURIComponent('Pogledajte ovu vijest...');
    const url = encodeURIComponent(window.location.href); 
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}%20${url}`;
    window.open(twitterUrl, '_blank');
  }

  copyUrlToClipboard(): void {
    const url = window.location.href; 
    navigator.clipboard.writeText(url).then(() => {
      this.isCopied = true;


      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    });
  }

  openImageModal(imageSrc: string): void {
    console.log(imageSrc);
    this.dialog.open(ImageModalComponent, {
      data: { imgSrc: imageSrc },
      width: '95vw',
      height: '95vh',
      panelClass: 'full-screen-modal',
    });
  }

  loadComments(): void {
    this.commentService.getCommentsForNews(this.newsId).subscribe(
      (data) => {
        this.comments = data.slice(0, 3); // Top 3 comments
        this.allComments = data; // All comments for the dialog
      },
      (error) => {
        console.error('Error loading comments:', error);
      }
    );
  }

  openCommentsDialog(): void {
    this.commentService.getCommentsForNews(this.newsId).subscribe(
      (data) => {
        this.allComments = data;
        this.dialogRef = this.dialog.open(this.commentsDialog, {
          width: '800px',
          height: '700px',
        });
      },
      (error) => {
        console.error('Error loading all comments:', error);
      }
    );
  }

  addComment(): void {
    if (!this.newComment.trim()) {
      return; // Do not allow empty comments
    }

    const comment = {
      comment: this.newComment,
      userID: Number(this.decodedToken.UserId), // Replace with the actual user ID
      dateTime: new Date().toISOString(),
      newsID: this.newsId,
    };

    this.commentService.addComment(this.newsId, comment).subscribe(
      (response) => {
        this.allComments.push(response);
        this.newComment = '';
        this.loadComments();
      },
      (error) => {
        console.error('Error adding comment:', error);
      }
    );
  }
  editComment(comment: Comment): void {
    const updatedComment = prompt('Izmenite vaš komentar:', comment.comment);
    if (updatedComment !== null && updatedComment.trim() !== '') {
      comment.comment = updatedComment;
      this.commentService
        .updateComment(
          comment.id,
          comment.comment,
          Number(this.decodedToken.UserId)
        )
        .subscribe(
          () => {
            console.log('Comment updated successfully.');
            this.loadComments();
          },
          (error) => {
            console.error('Error updating comment:', error);
          }
        );
    }
  }

  deleteComment(commentId: number): void {
    console.log(commentId);
    if (confirm('Da li ste sigurni da želite obrisati ovaj komentar?')) {
      this.commentService.deleteComment(commentId).subscribe(
        () => {
          this.loadComments();
          console.log('Comment deleted successfully.');
        },
        (error) => {
          console.error('Error deleting comment:', error);
        }
      );
    }
  }
  goToLogin(): void {
    if (this.dialogRef && this.dialogRef.close) {
      this.dialogRef.close(); // Close the dialog
      console.log('Dialog closed');
    } else {
      console.warn('DialogRef is not initialized or invalid.');
    }
    this.router.navigate(['/login-form']); // Navigate to login component}
  }

    reactToComment(commentId: number, isLike: boolean): void {
      this.commentService.reactToComment(commentId, this.loggedInUserId, isLike).subscribe(
        (response) => {
          // Prvo osvježimo sve komentare
          this.loadComments();
          
          // Zatim ažuriramo trenutno stanje
          const updateReactionState = (commentsArray: Comment[]) => {
            const comment = commentsArray.find((c) => c.id === commentId);
            if (comment) {
              comment.like = response.like;
              comment.dislike = response.dislike;
              comment.userReaction = isLike ? 'like' : 'dislike';
            }
          };
    
          updateReactionState(this.comments);
          updateReactionState(this.allComments);
        },
        (error) => {
          console.error('Error reacting to comment:', error);
        }
      );
    }


  isReactionActive(comment: any, reactionType: 'like' | 'dislike'): boolean {
    return comment.userReaction === reactionType;
  }
  getUserReaction(commentId: number): 'like' | 'dislike' | undefined {
    const comment = this.allComments.find((c) => c.id === commentId);
    if (comment) {
      return comment.userReaction;
    }
    return undefined;
  }
  get contentParagraphs(): string[] {
    // Ako su paragrafe odvojene sa dvostrukim novim redom
    return this.newsDetails.content
      ? this.newsDetails.content.split(/\n\s*\n/)
      : [];
  }
}