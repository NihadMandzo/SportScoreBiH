import { Component, ViewEncapsulation} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { LoadingServiceService } from './Services/loading-service.service';
import { Observable } from 'rxjs';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
// import { NavComponent } from './user/nav/nav.component';
import {SocialLoginModule} from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgxCaptchaModule, NgIf,SocialLoginModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  title = 'client';
  showLandingPage=true;
  isLoading: Observable<boolean>;

  constructor(private loadingService:LoadingServiceService){
    this.isLoading = this.loadingService.loading$;
  }


}
