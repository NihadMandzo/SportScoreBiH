import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NavbarComponent} from "../navbar/navbar.component";
import {GoogleMapsModule} from '@angular/google-maps';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ClubServiceService} from '../Services/club-service.service';
import {Club} from '../Services/DTO/Club';

@Component({
  selector: 'app-club-page',
  standalone: true,
  imports: [NavbarComponent, GoogleMapsModule, NgIf, NgForOf, NgClass],
  templateUrl: './club-page.component.html',
  styleUrls: ['./club-page.component.css']
})
export class ClubPageComponent implements OnInit {
  zoom = 12; // Početni nivo zumiranja
  center: google.maps.LatLngLiteral = {lat: 0, lng: 0}; // Centar mape
  club: Club = {
    id: 0,
    name: '',
    info: '',
    pictureUrl: '',
    email: '',
    phoneNumber: '',
    instagram: '',
    facebook: '',
    stadium: {
      id: 0,
      name: '',
      latitude: 0,
      longitude: 0,
      capacity: 0,
      stadiumPictures: []
    }
  };
  clubId: number | null = null;
  currentSlideIndex: number = 0;


  constructor(
    private router: Router,
    private clubService: ClubServiceService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.clubId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClub(this.clubId);
  }

  private loadClub(clubId:number): void {
    this.clubService.getClubID(clubId).subscribe({
      next: (data) => {
        console.log('Primljeni podaci sa backenda:', data);
        this.club = data; // Dodijeli podatke o klubu
        if (data.stadium) {
          this.center = {lat: data.stadium.latitude, lng: data.stadium.longitude};
        }
      },
      error: (err) => console.error('Greška prilikom dohvaćanja podataka o klubu:', err)
    });
  }

  prevSlide(): void {
    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.club.stadium.stadiumPictures.length) %
      this.club.stadium.stadiumPictures.length;
  }

  nextSlide(): void {
    this.currentSlideIndex =
      (this.currentSlideIndex + 1) % this.club.stadium.stadiumPictures.length;
  }

  selectSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  PlayerCRUD() {
    this.router.navigate(['/app-player']);
  }

}
