import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { FormsModule} from '@angular/forms';
import { MatInputModule} from '@angular/material/input';
import { MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import { MatIconModule} from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NewsDTO, NewsService } from '../../../Services/news-service.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Club } from '../../../Services/DTO/Club';
import { ActivatedRoute, Router, RouterConfigOptions } from '@angular/router';
import { ClubServiceService } from '../../../Services/club-service.service';

@Component({
  selector: 'app-single-news',
  standalone:true,
  imports: [CommonModule, FormsModule, MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule],
  templateUrl: './single-news.component.html',
  styleUrl: './single-news.component.css'
})
export class SingleNewsComponent implements OnInit{
  news: NewsDTO | null = null;
  title: string = '';
  content: string = '';
  selectedClubs: number[] = [];
  clubs:Club[]=[];

  existingPictureUrls: { url: string }[] = []; // Holds URLs of existing pictures
  newPictures: File[] = []; // New pictures selected by the user
  previewUrls: SafeUrl[] = []; // Previews for new pictures
  picturesToDelete: string[] = []; // URLs of pictures to delete
  deleteAllPhotos: boolean = false;

  titleError: string = '';
  contentError: string = '';
  picturesError: string = '';
  isDragOver = false;
  

  constructor(private newsService:NewsService, private route: ActivatedRoute,
     private clubService:ClubServiceService, private router:Router, private sanitizer:DomSanitizer){}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const newsId = +params['id'];
      console.log("NgOnIt radi");
      if (newsId) {
        this.loadNews(newsId);
      }
    });

    this.loadClubs();
    
  }

  loadClubs():void{
    this.clubService.getAllClubs().subscribe(
      (data) => {
        console.log(data);
        this.clubs = data;
      },
      (error) => console.error('Error loading clubs:', error)
    );
  }
  loadForm(loadedNews:NewsDTO):void{
    this.title = loadedNews.title;
    this.content = loadedNews.content;
    this.selectedClubs = loadedNews.clubs.map((club) => club.id);
    // Populate existingPictureUrls with URLs of the selected news's pictures
    this.existingPictureUrls = loadedNews.pictures.map((url) => ({ url }));
    this.previewUrls = [];
    this.newPictures = [];
    this.picturesToDelete = [];
    this.deleteAllPhotos = false;
  }
  loadNews(newsId: number) {
    this.newsService.getNewsById(newsId).subscribe({
      next: (response) => {
        this.news = response;
        if(this.news){
          this.loadForm(this.news);
        }
      },
      error: (err) => {
        console.error('Error fetching news details:', err);
      },
    });
  }

   addNews(): void {
   if (!this.validateForm()) return; // Check validations

    if (confirm('Are you sure you want to add this news?')) {
      const formData = new FormData();
      formData.append('title', this.title);
      formData.append('content', this.content);
      // Add ClubIds only if clubs are selected
      if (this.selectedClubs && this.selectedClubs.length > 0) {
        this.selectedClubs.forEach((clubId) =>
          formData.append('clubIds', clubId.toString())
        );
      }
      if (this.newPictures.length > 0) {
       this.newPictures.forEach((file) =>
         formData.append('Pictures', file, file.name)
       );
      }

      this.newsService.addNews(formData).subscribe(
        () => {

          this.resetForm();
          this.router.navigate(['admin-news']);
        },
        (error) => alert('Error adding news')
      );
    }
  }
    removeAllClubs(): void {
    if (confirm('Are you sure you want to remove all clubs from this news?')) {
      this.selectedClubs = [];
      console.log(
        'All clubs removed, selectedClubs array is now:',
        this.selectedClubs
      ); // Debugging log
    }
  }

   removeExistingPicture(pictureUrl: string): void {
    this.picturesToDelete.push(pictureUrl); // Queue URL for deletion in backend
    this.existingPictureUrls = this.existingPictureUrls.filter(
      (picture) => picture.url !== pictureUrl
    );
    if (this.picturesToDelete.length == 0) {
      this.deleteAllPhotos = true;
      this.existingPictureUrls = [];
    }
  }

  // Update an existing news item
  updateNews(): void {
    if (!this.validateForm()) return;

    if (confirm('Are you sure you want to update this news?')) {
      const formData = new FormData();
      formData.append('title', this.title);
      formData.append('content', this.content);
      if (this.selectedClubs && this.selectedClubs.length > 0) {
        this.selectedClubs.forEach((clubId) =>
          formData.append('clubIds', clubId.toString())
        );
      }

      // Log the selected clubs to verify
      console.log(
        "Selected Clubs (should be empty if 'Remove All Clubs' was clicked):",
        this.selectedClubs
      );

      if (this.deleteAllPhotos) {
        formData.append('deleteAllPictures', 'true');
      } else {
        this.picturesToDelete.forEach((url) =>
          formData.append('PicturesToDelete', url)
        );
      }

      if (this.newPictures.length > 0) {
        this.newPictures.forEach((file) =>
          formData.append('newPictures', file, file.name)
        );
      }

      if (this.news) {
        this.newsService.updateNews(this.news.id!, formData).subscribe(
          () => {
          },
          (error) => alert('Error updating news')
        );
      }
    }
    this.router.navigate(['/admin-news']);
  }

  validateForm(): boolean {
    let isValid = true;

    // Title validation
    // Title validation
    if (!this.title || !/^[a-zA-Z].{9,}$/.test(this.title)) {
      this.titleError = 'Title must contain at least 10 characters.';
      isValid = false;
    } else {
      this.titleError = '';
    }

    // Content validation
    if (!this.content || !/^[a-zA-Z].{34,}$/.test(this.content.trim())) {
      this.contentError = 'Content must contain at least 35 letters.';
      isValid = false;
    } else {
      this.contentError = '';
    }

    // Pictures validation
    if (
      this.existingPictureUrls.length === 0 &&
      this.newPictures.length === 0
    ) {
      this.picturesError = 'You must add at least one picture.';
      isValid = false;
    } else {
      this.picturesError = '';
    }

    return isValid;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      this.processFiles(files);
    }
  }

  processFiles(files: File[]): void {
    for (const file of files) {
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        this.newPictures.push(file);

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.previewUrls.push(
              this.sanitizer.bypassSecurityTrustUrl(e.target.result as string)
            );
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);
    files.forEach((file) => {
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        this.newPictures.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(
           this.sanitizer.bypassSecurityTrustUrl(e.target.result)
          );
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeNewPicture(index: number): void {
    this.newPictures.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  resetForm(): void {
    this.news = null;
    this.title = '';
    this.content = '';
    this.selectedClubs = [];
    this.existingPictureUrls = [];
    this.newPictures = [];
    this.previewUrls = [];
    this.picturesToDelete = []; // Clear pictures to delete
    this.deleteAllPhotos = false; // Reset delete all photos flag
  }
  cancel():void{
    this.resetForm();
    this.router.navigate(['/admin-news']);
  }
}
