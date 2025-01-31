import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AIServiceService } from '../Services/aiservice.service';
import { NewsDTO, NewsService } from '../Services/news-service.service';
import { ClubServiceService } from '../Services/club-service.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { Club } from '../Services/DTO/Club';
import {catchError, debounceTime, switchMap } from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [
    NavbarComponent,
    RouterLink,
    FormsModule,
    NgFor,
    InfiniteScrollDirective,
    NgIf,
    CommonModule
  ],
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css'],
})
export class NewsPageComponent implements OnInit {
  isAIWidgetOpen: boolean = false;
  userInput: string = ''; // Pitanje korisnika
  aiResponse: string = ''; // Odgovor od AI

  newsList: NewsDTO[] = [];
  clubList: Club[] = [];

  page = 1;
  pageSize = 10;
  totalItems = 0;
  loading = false;

  newsByClub: NewsDTO[] = [];
  newsPage = 1;
  newsPageSize = 10;
  newsTotalItems = 0;
  newsLoading = false;

  selectedClubId: number = 0;

  searchQuery: string = '';        // Tekst koji korisnik unosi
  predictions: any[] = [];         // Lista prijedloga
  private searchSubject: Subject<string> = new Subject<string>(); // Subject za debouncing

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  constructor(
    private aiService: AIServiceService,
    private newsService: NewsService,
    private clubService: ClubServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNews();
    this.loadClubs();
    this.debounceTechnique();
  }
  debounceTechnique(): void {
    this.searchSubject.pipe(
      debounceTime(300),  // 300 ms delay before making the request
      switchMap(query => {
        console.log('Debouncing triggered. Query sent to API:', query);
        if (query) {
          return this.newsService.getSearchPredictions(query);  // Poziv servisa za predikciju
        }
        return [];  // Ako nema unosa, nema ni prijedloga
      }),
      catchError(err => {
        console.error(err);
        return [];
      })
    ).subscribe(predictions => {
      console.log('Predictions received:', predictions);
      this.predictions = predictions; // Postavljanje prijedloga
    });
  }

  onSearch() {
    // Emitovanje unosa iz inputa u subject za debouncing

    this.searchSubject.next(this.searchQuery);
    if (!this.searchQuery.trim() || this.searchQuery.trim() === '') {
      this.predictions = [];
      return;
    }
  }

  selectPrediction(prediction: any) {
    // Kada korisnik izabere prijedlog, možeš poslati korisnika na detalje ili pretragu sa selektovanim predlogom

    console.log('Predicted news selected:', prediction);
    this.searchQuery = prediction.title; // Na primjer, postaviti pretragu na odabrani predlog
    this.router.navigate(['/news', prediction.id]);
    this.predictions = [];  // Očisti prijedloge nakon selekcije
    if (!this.searchQuery || this.searchQuery.trim() === ' ') {
      this.predictions = [];
      return;
    }
  }

  toggleAIWidget() {
    this.isAIWidgetOpen = !this.isAIWidgetOpen;
  }

  askQuestion() {
    if (this.userInput.trim().length === 0) {
      return;
    }
  this.userInput = "Odgovori samo ako je pitanje o historiji BH lige i klubovima i pravilima igre, ako neko posatavi neko pitanje koje nije iz ovih kategorija odgovori Nisam strucan da odgovorim na ovo pitanje i nista dalje, ovo je pitanje: " + this.userInput
    this.aiService.askQuestion(this.userInput).subscribe({
      next: (response) => {
        // Prikaz odgovora od AI
        console.log('Odgovor od API-ja:', response);
        this.aiResponse = response.answer; // Prikazujemo odgovor ChatGPT-a
      },
      error: (err) => {
        // Prikazujemo grešku ako se desi
        this.aiResponse = 'Došlo je do greške prilikom komunikacije s AI.';
        console.error('Greška prilikom poziva API-ja:', err);
      },
    });

    // Očisti input nakon što je pitanje poslano
    this.userInput = '';
  }

  onScroll(): void {
    console.log('Scroll event triggered');
    if (this.newsList.length < this.totalItems) {
      console.log('Loading more news...');
      this.loadNews();
    } else {
      console.log('No more news to load');
    }
  }

  NavigateToDetails(id: number): void {
    if (id === undefined) {
      console.error('Invalid news ID:', id);
      return;
    }
    this.router.navigate(['/news', id]);
  }

  loadClubs(): void {
    this.clubService.getAllClubs().subscribe(
      (response) => {
        this.clubList = response;
        console.log(this.clubList);
      },
      (error) => {
        console.error('Error loading clubs:', error);
      }
    );
  }
  scrollLeft() {
    if (this.carousel) {
      console.log('Carousel found:', this.carousel.nativeElement);
      this.carousel.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
    } else {
      console.error('Carousel element not found.');
    }
  }

  scrollRight() {
    if (this.carousel) {
      console.log('Carousel found:', this.carousel.nativeElement);
      this.carousel.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
    } else {
      console.error('Carousel element not found.');
    }
  }
  LoadNewsByClubID(clubId: number, isScrolling: boolean = false): void {
    if (!isScrolling && this.selectedClubId === clubId) {
      console.log('Already selected this club, no reloading');
      return;
    }
    if (this.selectedClubId !== clubId) {
      this.selectedClubId = clubId;
      this.newsPage = 1;
      this.newsByClub = [];
      this.newsTotalItems = 0;
    }
    if (this.newsLoading) {
      return;
    }
    this.newsLoading = true;
    this.newsService
      .getNewsByClub(clubId, this.newsPage, this.newsPageSize)
      .subscribe(
        (response) => {
          if (response.items.length > 0) {
            this.newsByClub = [...this.newsByClub, ...response.items];
            this.newsTotalItems = response.totalItems;
            this.newsPage++;
          }
          this.newsLoading = false;
          console.log(response); // Reset loading state
        },
        (error) => {
          console.error('Error loading news:', error);
          this.newsLoading = false;
        }
      );
  }
  loadNews(): void {
    if (this.loading) return; // Prevent duplicate API calls

    this.loading = true; // Set loading to true
    this.newsService.getPaginatedNews(this.page, this.pageSize).subscribe(
      (response) => {
        // Append new items to the existing news list
        this.newsList = [...this.newsList, ...response.items];
        this.totalItems = response.totalItems; // Update total items count
        this.page++; // Increment page number for next request
        this.loading = false; // Reset loading state
      },
      (error) => {
        console.error('Error loading news:', error);
        this.loading = false; // Reset loading state
      }
    );
  }
  onScrollClubs(): void {
    if (this.newsByClub.length < this.newsTotalItems && !this.newsLoading) {
      this.LoadNewsByClubID(this.selectedClubId, true);
    }
  }
}
