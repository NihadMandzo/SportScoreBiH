
import {Player, PlayerPost} from './../Services/DTO/Player';
import { Component, OnInit } from '@angular/core';
import { PlayerServiceService } from '../Services/player-service.service';
import {CommonModule, DatePipe, NgForOf, NgIf, SlicePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Club } from '../Services/DTO/Club';
import {ClubServiceService} from '../Services/club-service.service';
import {Router} from '@angular/router';
import {last} from 'rxjs';


@Component({
  selector: 'app-player',
  standalone:true,
  imports: [FormsModule, NgForOf, NgIf, DatePipe],
  templateUrl: 'player.component.html',
  styleUrls: ['player.component.css'],
  providers:[DatePipe]
})


export class PlayerComponent implements OnInit {

  constructor(private PlayerServiceService: PlayerServiceService, private ClubService: ClubServiceService,private datePipe: DatePipe) {
  }
  players: Player[] = [];
  clubs: Club[] = [];
  edityPlayer:Player|null=null;
  firstName: string = '';
  lastName: string = '';
  birthDate: string = '';
  position:string='';
  club: number | null = null;
  isEditing = false;

  playerPositions: string[] = ['Golman', 'Odbrana', 'Vezni', 'Napadač'];

  captchaText: string = '';
  captchaInput: string = '';
  isCaptchaValid: boolean =false;

  selectedClubId: number | null = null;
  totalPlayers: number=0 ;
  totalPages: number = 0;
  currentPage: number = 1;

  pages:any[]=[];

  isDragging: boolean = false;
  imagePreview: string | ArrayBuffer | null | undefined=null; // Za prikaz slike
  selectedImage?: File ; // Za pohranu odabrane slike

  isUploading: boolean = false;
  uploadProgress: number = 0;

  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.isValidImage(file)) {
        this.selectedImage = file;
        this.previewImage(file);
      } else {
        console.error("Odabrani fajl nije validna slika!");
      }
      event.dataTransfer.clearData();
    }
  }





  ngOnInit(): void {
    this.getClubs();
    this.getPlayers();
    //this.loadPlayers(1, 10, null);
    this.generateCaptcha();
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
  }


  generateCaptcha(): void {
    const canvas = document.getElementById('captchaCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    this.captchaText = captcha;


    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 5,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.3})`;
      ctx.fill();
    }


    for (let i = 0; i < captcha.length; i++) {
      ctx.save();
      ctx.translate(30 * i + 15, 25);
      ctx.rotate(Math.random() * 0.4 - 0.2);
      ctx.font = `${Math.random() * 10 + 20}px Arial`;
      ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`; // Nasumična boja
      ctx.fillText(captcha[i], 0, 0);
      ctx.restore();
    }


    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.lineTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random()})`; // Nasumične boje linija
      ctx.lineWidth = Math.random() * 2;
      ctx.stroke();
    }
  }


  validateCaptcha(): void {
    if (this.captchaInput === this.captchaText) {
      this.isCaptchaValid = true;
      alert('Captcha je uspješno potvrđena!');
    } else {
      this.isCaptchaValid = false;
      alert('Captcha nije tačna. Pokušajte ponovo.');
    }
  }
  generatePages() {
    const pagesToShow = 5;
    const half = Math.floor(pagesToShow / 2);

    if (this.totalPages <= pagesToShow) {
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      // Generiši dinamičke stranice s "..."
      const start = Math.max(2, this.currentPage - half);
      const end = Math.min(this.totalPages - 1, this.currentPage + half);

      this.pages = [1];

      if (start > 2) this.pages.push('...');
      for (let i = start; i <= end; i++) {
        this.pages.push(i);
      }
      if (end < this.totalPages - 1) this.pages.push('...');
      this.pages.push(this.totalPages);
    }
  }



  changePage(page: number): void {
    if (page !== this.currentPage) {
      this.getPlayers(page);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (this.isValidImage(file)) {
        this.selectedImage = file;
        this.previewImage(file);
      } else {
        console.error("Odabrani fajl nije validna slika!");
      }
    }
  }

  isValidImage(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return allowedTypes.includes(file.type);
  }



  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result;
    };
    reader.readAsDataURL(file);
  }
  onImageSelected(event: any): void {
    // Provjerite da li je file input ispravno postavljen
    const file = event.target?.files?.[0];

    // Ako postoji odabrani file, postavite ga
    if (file) {
      this.selectedImage = file;  // Spremi izabranu sliku
    }

    // Kreirajte FileReader instancu
    const reader = new FileReader();

    // Kada je učitavanje završeno, postavite sliku u preview
    reader.onload = () => {
      // Provjerite da reader.result nije null, i postavite kao string
      this.imagePreview = reader.result ? reader.result as string : '';
    };

    // Ako postoji file, počnite učitavati
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    //this.selectedImage = null;
  }

  loadImage() {
    if (!this.selectedImage || !this.canvas) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;  // Postavite URL slike na rezultat FileReader-a
    };
    reader.readAsDataURL(this.selectedImage);
    img.onload = () => {
      this.canvas!.width = img.width;
      this.canvas!.height = img.height;
      this.ctx = this.canvas!.getContext('2d')!;
      this.ctx.drawImage(img, 0, 0);
    };
  }

  cropImage() {
    if (!this.ctx || !this.canvas) return;

    const startX = 100;  // X koordinata početka cropanja
    const startY = 100;  // Y koordinata početka cropanja
    const width = 200;   // Širina cropane slike
    const height = 200;  // Visina cropane slike

    // Izreži i prikaži cropani dio
    const imageData = this.ctx.getImageData(startX, startY, width, height);
    this.canvas!.width = width;  // Prilagodi širinu canvas-a
    this.canvas!.height = height; // Prilagodi visinu canvas-a
    this.ctx.putImageData(imageData, 0, 0);

    // Spremi cropanu sliku
    const croppedImage = this.canvas!.toDataURL('image/png');
    console.log('Cropped Image URL:', croppedImage);
  }

  isValidForm(): boolean {
    console.log('firstName:', this.firstName);
    console.log('lastName:', this.lastName);
    console.log('birthDate:', this.birthDate);
    if (!this.isEditing && !this.isCaptchaValid) {
      console.error('Captcha nije tačna');
      return false;
    }
    if (!this.isCaptchaValid) {
      console.error('Captcha nije tačan');
      return false;
    }

    if (this.firstName.length < 3) {
      console.error('Ime mora imati najmanje 3 karaktera');
      return false;
    }
    if (this.lastName.length < 4) {
      console.error('Prezime mora imati najmanje 4 karaktera');
      return false;
    }
    if (!this.birthDate) {
      console.error('Datum rođenja mora biti unesen');
      return false;
    }
    if(!this.position){
      console.error("Pozicija mora biti izabrana");
      return false;
    }
    if (!this.clubs) {
      console.error('Klub mora biti izabran');
      return false;
    }
    return true;
  }


  //Get all players

  getPlayers(page: number = 1, pageSize: number = 2): void {

    this.PlayerServiceService.getAllPlayers(page, pageSize, this.selectedClubId ? this.selectedClubId : null).subscribe(
      (data: any) => {
        if (data && data.players) {
          console.log(data)
          this.players = data.players; // Set filter players
          this.totalPlayers = data.totalPlayers;
          this.totalPages = data.totalPages;
          this.currentPage = data.currentPage;
          this.generatePages();
          console.log(this.players);
        } else {
          this.players = []; // If players not contains
          console.warn('Nema igrača za odabrani filter.');
        }
      },
      (error) => {
        console.error('Greška pri dohvaćanju igrača:', error);
      }
    );
  }


  loadPlayers(page: number, pageSize: number, clubId: number | null): void {
    this.PlayerServiceService.getAllPlayers(page, pageSize, clubId).subscribe({
      next: (response) => {
        console.log('Response:', response);
        this.players = response.data;
        this.totalPlayers = response.totalCount;
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });}
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.getPlayers(this.currentPage - 1);
      this.generatePages();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.getPlayers(this.currentPage + 1);
      this.generatePages();
    }
  }
  onClubFilterChange(clubId: number | null): void {
    this.selectedClubId = clubId;
    this.currentPage = 1; // Reset on first page
    this.getPlayers();
  }


  getClubs(): void {
    this.ClubService.getAllClubs().subscribe(data => {

        this.clubs = data;
        console.log(this.clubs)
      },
      error => console.log(error)
    );
  }
  filterByClub(): void {
    const clubId = this.selectedClubId ? this.selectedClubId : null;
    console.log(clubId);
    this.getPlayers(1, 2);
    console.log('Odabrani klub ID:', this.selectedClubId);

  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  parseDate(dateString: string): string {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }

  addPlayer(): void {
    this.validateCaptcha();
    if (this.isValidForm()) {
      if (this.firstName && this.lastName && this.birthDate && this.position && this.club) {
        if (!this.selectedImage) {
          console.error("Slika nije odabrana!");
          return;
        }

        // Korištenje FileReader za praćenje napretka
        const reader = new FileReader();
        reader.onloadstart = () => {
          this.isUploading = true;  // Početak upload-a
        };

        reader.onprogress = (event: ProgressEvent) => {
          if (event.lengthComputable) {
            // Izračunavanje napretka u procentima
            const progress = (event.loaded / event.total) * 100;
            this.uploadProgress = Math.round(progress);
          }
        };

        reader.onloadend = () => {
          // Kada je upload završio, resetiraj progress
          this.uploadProgress = 100;
        };

        reader.onload = () => {
          // Kroz FileReader šaljemo podatke na server
          if (!this.selectedImage ) {
            console.error("Slika nije odabrana!");
            return;
          }
          if (!this.club) {
            console.error("Klub nije odabran!");
            return;
          }
          const formData = new FormData();
          formData.append('firstName', this.firstName);
          formData.append('lastName', this.lastName);
          formData.append('birthDate', this.birthDate);
          formData.append('position', this.position);
          formData.append('clubId', this.club.toString());
          formData.append('image', this.selectedImage);
          if (this.selectedImage) {
            formData.append('image', this.selectedImage);
          }

          this.PlayerServiceService.addPlayer(formData).subscribe(() => {
            this.getPlayers();
            this.resetForm();
            this.isUploading = false;
            this.uploadProgress = 0;
          }, error => {
            console.log(error);
            this.isUploading = false;
          });
        };

        // Pokretanje čitanja fajla
        reader.readAsDataURL(this.selectedImage);
      }
    }
  }


  editPlayer(player:PlayerPost): void {
    // @ts-ignore
    this.edityPlayer={...player};
    this.firstName = player.firstName;
    this.lastName = player.lastName;
    this.birthDate = player.birthDate;
    this.club = player.clubId;
  }
  setEditPlayer(player: Player): void {
    this.isEditing = true;
    this.edityPlayer = player;
    this.firstName = player.firstName;
    this.lastName = player.lastName;
    // @ts-ignore
    this.birthDate = this.datePipe.transform(player.birthDate, `yyyy-MM-dd`);
    this.position=player.position;
    this.club = player.club?.id;
    //this.selectedImage = player.image;
    console.log('Player selected for edit:', this.edityPlayer);
  }

  updatePlayer(): void {
    console.log('Pozivam updatePlayer');
    console.log('Editing player:', this.edityPlayer);
    console.log('Selected club ID:', this.club);



    if (this.edityPlayer && this.edityPlayer.id !== undefined && this.club !== null&&this.isValidForm()) {
      // if (!this.selectedImage) {
      //   console.error("Slika nije odabrana!");
      //   return;
      // }

      const formData = new FormData();
      formData.append('firstName', this.firstName);
      formData.append('lastName', this.lastName);
      formData.append('birthDate', this.birthDate);
      formData.append('position', this.position);
      formData.append('clubId', this.club.toString());
      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }
      //formData.append('image', this.selectedImage);

      this.PlayerServiceService.updatePlayer(this.edityPlayer.id, formData).subscribe({
        next: () => {
          console.log(`Player with ID ${this.edityPlayer} updated successfully.`);
          this.getPlayers();
          this.resetForm();
        },
        error: (err) => console.error('Error updating player:', err),
      });
    } else {
      console.error('Player ID or club is undefined');
    }
  }
  resetForm(): void {
    this.isEditing = false;
    this.edityPlayer = null;
    this.firstName = '';
    this.lastName = '';
    this.birthDate = '';
    this.position='';
    this.club = null;
    this.generateCaptcha();
    this.captchaInput='';
    this.removeImage();


  }

  deletePlayer(id: number): void {

    if (id === undefined) {
      console.error('Player ID is undefined');
      return;
    }
    this.PlayerServiceService.deletePlayer(id).subscribe({
      next: () => {
        console.log(`Player with ID ${id} deleted successfully.`);
        this.getPlayers();
      },
      error: (err) => console.error('Error deleting player:', err),
    })
  }

  protected readonly last = last;

}
