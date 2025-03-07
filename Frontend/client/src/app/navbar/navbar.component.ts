import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatSidenavModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('toggleSidebar', [
      state(
        'open',
        style({
          width: '250px',
        })
      ),
      state(
        'closed',
        style({
          width: '60px',
        })
      ),
      transition('open <=> closed', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class NavbarComponent {
  isSidebarOpen: boolean = false;

  constructor(private router: Router) {}



  Club() {
    const token: any = localStorage.getItem('accessToken');
    const decodedToken: any = jwtDecode(token);
    var clubId = decodedToken.ClubId;
    if (clubId) {
      this.router.navigate(['/club', clubId]);
    }
  }

  Results() {
    this.router.navigate(['/results']);
  }

  News() {
    this.router.navigate(['/news-page']);
  }

  Profile() {
    this.router.navigate(['/profile']);
  }
}
