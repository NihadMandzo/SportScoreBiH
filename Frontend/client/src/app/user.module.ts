import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsPageComponent } from './news-page/news-page.component';
import { ResultsPageComponent } from './results-page/results-page.component';
import { ClubPageComponent } from './club-page/club-page.component';
import { NewsDetailsComponent } from './news-page/news-details/news-details.component';
import { ProfileComponent } from './profile/profile.component';
import { userGuardGuard } from './Guards/user-guard.guard';
import { clubGuardGuard } from './Guards/club-guard.guard';
import { userAndAdminGuardGuard } from './Guards/user-and-admin-guard.guard';
import { NavbarComponent } from './navbar/navbar.component';

const routes: Routes = [
  {
    path: '', component: NavbarComponent,
    children: [
      { path: 'news', component: NewsPageComponent },
      { path: 'news/:id', component: NewsDetailsComponent },
      { path: 'club/:id', component: ClubPageComponent, canActivate: [clubGuardGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [userAndAdminGuardGuard] },
      { path: '', redirectTo: 'news', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    NavbarComponent,
    NewsPageComponent,
    ResultsPageComponent,
    ClubPageComponent,
    NewsDetailsComponent,
    ProfileComponent
  ]
})
export class UserModule { } 