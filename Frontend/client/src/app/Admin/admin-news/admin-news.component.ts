import { Component, OnInit } from '@angular/core';
import { AdminNavBarComponent } from '../admin-nav-bar/admin-nav-bar.component';
import { NewsService, NewsDTO } from '../../Services/news-service.service';
import { Club } from '../../Services/DTO/Club';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ClubServiceService } from '../../Services/club-service.service';
import {MatCardModule} from '@angular/material/card';
import {MatPaginator} from '@angular/material/paginator'
import { timeout } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import {MatTable, MatTableDataSource, MatTableModule, MatCell} from '@angular/material/table'
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [AdminNavBarComponent, FormsModule,
     NgFor, NgIf, CommonModule, MatCardModule, MatPaginator, 
     MatIcon, MatTableModule, MatCell],
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.css',
})
export class AdminNewsComponent implements OnInit {
  // // News and Clubs
  newsList: NewsDTO[] = [];
  clubs: Club[] = [];
  displayedColumns: string[] = ['naslov', 'datum', 'sadrzaj', 'slika', 'klubovi', 'akcije'];

  selectedClubId: number | null = null;

// Metoda za filtriranje vijesti po klubu
  // // Form data
  // selectedNews: NewsDTO | null = null;
  // title: string = '';
  // content: string = '';
  // selectedClubs: number[] = [];

  // // Picture management
  // existingPictureUrls: { url: string }[] = []; // Holds URLs of existing pictures
  // newPictures: File[] = []; // New pictures selected by the user
  // previewUrls: SafeUrl[] = []; // Previews for new pictures
  // picturesToDelete: string[] = []; // URLs of pictures to delete
  // deleteAllPhotos: boolean = false;

  totalItems: number = 0;
  pageNumber: number = 1;
  pageSize: number = 2;
  paginatedMode: boolean = true;
  constructor(private newsService: NewsService, private clubService:ClubServiceService, private router:Router) {}
  // titleError: string = '';
  // contentError: string = '';
  // picturesError: string = '';
  // isDragOver = false;

  ngOnInit(): void {
    this.loadNews();
    this.loadClubs();
  }
  filterNewsByClub(): void {
    if (this.selectedClubId) {
      this.newsService.getNewsByClub(this.selectedClubId, this.pageNumber, this.pageSize).subscribe(
        (response: any) => {
          this.newsList = response.items;
          this.totalItems = response.totalItems;
        },
        (error) => console.error('Error loading news by club:', error)
      );
    } else {
      this.loadNews(); // Učitaj sve vijesti ako nema selektovanog kluba
    }
  }

  // onDragOver(event: DragEvent): void {
  //   event.preventDefault();
  //   this.isDragOver = true;
  // }

  // onDragLeave(event: DragEvent): void {
  //   this.isDragOver = false;
  // }

  // onDrop(event: DragEvent): void {
  //   event.preventDefault();
  //   this.isDragOver = false;

  //   if (event.dataTransfer?.files) {
  //     const files = Array.from(event.dataTransfer.files);
  //     this.processFiles(files);
  //   }
  // }
  // processFiles(files: File[]): void {
  //   for (const file of files) {
  //     if (file.type === 'image/png' || file.type === 'image/jpeg') {
  //       this.newPictures.push(file);

  //       const reader = new FileReader();
  //       reader.onload = (e: ProgressEvent<FileReader>) => {
  //         if (e.target?.result) {
  //           this.previewUrls.push(
  //             this.sanitizer.bypassSecurityTrustUrl(e.target.result as string)
  //           );
  //         }
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   }
  // }

  // // Load all news or paginated news
  loadNews(): void {
    this.newsService.getPaginatedNews(this.pageNumber, this.pageSize).subscribe(
      (response: any) => {
        this.newsList = response.items.map((news: any) => ({
          ...news,
          clubNames: news.clubs.map((club: any) => club.name).join(', '), // Pripremi imena klubova kao string
        }));
        this.totalItems = response.totalItems;
      },
      (error) => {
        console.error('Error loading news:', error);
      }
    );
  }

  onPageChange(event: any): void {
    this.pageNumber = event.pageIndex + 1; // Angular paginator koristi index 0
    this.pageSize = event.pageSize;
    this.loadNews();
  }
  // goToPage(page: number): void {
  //   this.pageNumber = page;
  //   this.loadNews();
  // }

  // // Load clubs from the backend
  loadClubs(): void {
    this.clubService.getAllClubs().subscribe(
      (data) => {
        console.log(data);
        this.clubs = data;
      },
      (error) => console.error('Error loading clubs:', error)
    );
  }

  // // Select a news item for editing and populate form
  // selectNewsForEditing(news: NewsDTO): void {
  //   this.selectedNews = news;
  //   this.title = news.title;
  //   this.content = news.content;
  //   this.selectedClubs = news.clubs.map((club) => club.id);

  //   // Populate existingPictureUrls with URLs of the selected news's pictures
  //   this.existingPictureUrls = news.pictures.map((url) => ({ url }));
  //   this.previewUrls = [];
  //   this.newPictures = [];
  //   this.picturesToDelete = [];
  //   this.deleteAllPhotos = false;
  // }

  // // Handle file selection for new pictures with preview
  // onFileSelected(event: any): void {
  //   const files: File[] = Array.from(event.target.files);
  //   files.forEach((file) => {
  //     if (file.type === 'image/png' || file.type === 'image/jpeg') {
  //       this.newPictures.push(file);
  //       const reader = new FileReader();
  //       reader.onload = (e: any) => {
  //         this.previewUrls.push(
  //           this.sanitizer.bypassSecurityTrustUrl(e.target.result)
  //         );
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   });
  // }

  // removeAllClubs(): void {
  //   if (confirm('Are you sure you want to remove all clubs from this news?')) {
  //     this.selectedClubs = [];
  //     console.log(
  //       'All clubs removed, selectedClubs array is now:',
  //       this.selectedClubs
  //     ); // Debugging log
  //   }
  // }
  // // Remove a specific existing picture by URL
  // removeExistingPicture(pictureUrl: string): void {
  //   this.picturesToDelete.push(pictureUrl); // Queue URL for deletion in backend
  //   this.existingPictureUrls = this.existingPictureUrls.filter(
  //     (picture) => picture.url !== pictureUrl
  //   );
  //   if (this.picturesToDelete.length == 0) {
  //     this.deleteAllPhotos = true;
  //     this.existingPictureUrls = [];
  //   }
  // }

  // validateForm(): boolean {
  //   let isValid = true;

  //   // Title validation
  //   // Title validation
  //   if (!this.title || !/^[a-zA-Z].{9,}$/.test(this.title)) {
  //     this.titleError = 'Title must contain at least 10 characters.';
  //     isValid = false;
  //   } else {
  //     this.titleError = '';
  //   }

  //   // Content validation
  //   if (!this.content || !/^[a-zA-Z].{34,}$/.test(this.content.trim())) {
  //     this.contentError = 'Content must contain at least 35 letters.';
  //     isValid = false;
  //   } else {
  //     this.contentError = '';
  //   }

  //   // Pictures validation
  //   if (
  //     this.existingPictureUrls.length === 0 &&
  //     this.newPictures.length === 0
  //   ) {
  //     this.picturesError = 'You must add at least one picture.';
  //     isValid = false;
  //   } else {
  //     this.picturesError = '';
  //   }

  //   return isValid;
  // }

  // // Remove a specific new picture by index
  // removeNewPicture(index: number): void {
  //   this.newPictures.splice(index, 1);
  //   this.previewUrls.splice(index, 1);
  // }

  // // Mark all photos for deletion
  // deleteAllPictures(): void {
  //   this.deleteAllPhotos = true;
  //   this.existingPictureUrls = [];
  // }

  // // Add a new news item
  // addNews(): void {
  //   if (!this.validateForm()) return; // Check validations

  //   if (confirm('Are you sure you want to add this news?')) {
  //     const formData = new FormData();
  //     formData.append('title', this.title);
  //     formData.append('content', this.content);
  //     // Add ClubIds only if clubs are selected
  //     if (this.selectedClubs && this.selectedClubs.length > 0) {
  //       this.selectedClubs.forEach((clubId) =>
  //         formData.append('clubIds', clubId.toString())
  //       );
  //     }
  //     if (this.newPictures.length > 0) {
  //       this.newPictures.forEach((file) =>
  //         formData.append('Pictures', file, file.name)
  //       );
  //     }

  //     this.newsService.addNews(formData).subscribe(
  //       () => {
  //         this.loadNews();
  //         this.resetForm();
  //         console.log('Vijest Dodana');
  //       },
  //       (error) => alert('Error adding news')
  //     );
  //   }
  // }

  // // Update an existing news item
  // updateNews(): void {
  //   if (!this.validateForm()) return;

  //   if (confirm('Are you sure you want to update this news?')) {
  //     const formData = new FormData();
  //     formData.append('title', this.title);
  //     formData.append('content', this.content);
  //     if (this.selectedClubs && this.selectedClubs.length > 0) {
  //       this.selectedClubs.forEach((clubId) =>
  //         formData.append('clubIds', clubId.toString())
  //       );
  //     }

  //     // Log the selected clubs to verify
  //     console.log(
  //       "Selected Clubs (should be empty if 'Remove All Clubs' was clicked):",
  //       this.selectedClubs
  //     );

  //     if (this.deleteAllPhotos) {
  //       formData.append('deleteAllPictures', 'true');
  //     } else {
  //       this.picturesToDelete.forEach((url) =>
  //         formData.append('PicturesToDelete', url)
  //       );
  //     }

  //     if (this.newPictures.length > 0) {
  //       this.newPictures.forEach((file) =>
  //         formData.append('newPictures', file, file.name)
  //       );
  //     }

  //     if (this.selectedNews) {
  //       this.newsService.updateNews(this.selectedNews.id!, formData).subscribe(
  //         () => {
  //           this.loadNews();
  //           this.resetForm();
  //         },
  //         (error) => alert('Error updating news')
  //       );
  //     }
  //   }
  // }

  // // Reset form to add a new news item or after editing
  // resetForm(): void {
  //   this.selectedNews = null;
  //   this.title = '';
  //   this.content = '';
  //   this.selectedClubs = [];
  //   this.existingPictureUrls = [];
  //   this.newPictures = [];
  //   this.previewUrls = [];
  //   this.picturesToDelete = []; // Clear pictures to delete
  //   this.deleteAllPhotos = false; // Reset delete all photos flag
  // }

  // // Delete a news item by ID
  deleteNews(newsId: number): void {
    if (confirm('Are you sure you want to delete this news item?')) {
      this.newsService.deleteNews(newsId).subscribe(
        () => {
          this.newsList = this.newsList.filter((news) => news.id !== newsId);
        },
        (error) => console.error('Error deleting news:', error)
      );
    }
  }

  editNews(newsId:number):void{
    this.router.navigate(['/edit-news', newsId]);
  }
  addNews():void{
    this.router.navigate(['add-news']);

  }
}
