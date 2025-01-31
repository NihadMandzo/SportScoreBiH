import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../Services/login.service';


@Component({
  selector: 'app-admin-nav-bar',
  standalone: true,
  imports: [RouterLink, MatSidenavModule, MatListModule, MatIconModule, 
    MatToolbarModule, MatButtonModule, RouterOutlet, RouterModule, MatMenuModule,
     CommonModule ],
  templateUrl: './admin-nav-bar.component.html',
  styleUrl: './admin-nav-bar.component.css'
})
export class AdminNavBarComponent {
  constructor(private router: Router, private loginService:LoginService) {}

  logout() {
    // Očisti lokalne podatke (ako ih ima)
    this.loginService.logout();
    // Navigiraj korisnika na login stranicu
    this.router.navigate(['/login-form']);
  }
}
