import { Component, OnInit } from '@angular/core';
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
  imports: [FormsModule,
     NgFor, CommonModule, MatCardModule, MatPaginator, 
     MatIcon, MatTableModule, MatCell],
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.css',
})
export class AdminNewsComponent implements OnInit {

  newsList: NewsDTO[] = [];
  clubs: Club[] = [];
  displayedColumns: string[] = ['naslov', 'datum', 'sadrzaj', 'slika', 'klubovi', 'akcije'];

  selectedClubId: number | null = null;


  selectedNews: NewsDTO | null = null;
  title: string = '';
  content: string = '';
  selectedClubs: number[] = [];


  existingPictureUrls: { url: string }[] = []; 
  newPictures: File[] = []; 
  previewUrls: SafeUrl[] = []; 
  picturesToDelete: string[] = []; 
  deleteAllPhotos: boolean = false;

  totalItems: number = 0;
  pageNumber: number = 1;
  pageSize: number = 2;
  paginatedMode: boolean = true;
  constructor(private newsService: NewsService, private clubService:ClubServiceService, private router:Router) {}
  titleError: string = '';
  contentError: string = '';
  picturesError: string = '';
  isDragOver = false;

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
      this.loadNews(); 
    }
  }




  loadNews(): void {
    this.newsService.getPaginatedNews(this.pageNumber, this.pageSize).subscribe(
      (response: any) => {
        this.newsList = response.items.map((news: any) => ({
          ...news,
          clubNames: news.clubs.map((club: any) => club.name).join(', '),
        }));
        this.totalItems = response.totalItems;
      },
      (error) => {
        console.error('Error loading news:', error);
      }
    );
  }

  onPageChange(event: any): void {
    this.pageNumber = event.pageIndex + 1; 
    this.pageSize = event.pageSize;
    this.loadNews();
  }
  goToPage(page: number): void {
    this.pageNumber = page;
    this.loadNews();
  }

  loadClubs(): void {
    this.clubService.getAllClubs().subscribe(
      (data) => {
        console.log(data);
        this.clubs = data;
      },
      (error) => console.error('Error loading clubs:', error)
    );
  }





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
    this.router.navigate(['/admin/edit-news', newsId]);
  }
  addNews():void{
    this.router.navigate(['/admin/add-news']);
  }
}
