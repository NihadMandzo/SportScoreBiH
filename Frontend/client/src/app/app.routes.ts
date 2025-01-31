import { LoginFormComponent } from './login-form/login-form.component';
import { RouterModule, Routes } from '@angular/router';
import { NewsPageComponent } from './news-page/news-page.component';
import { NgModule, Component } from '@angular/core';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ClubPageComponent } from './club-page/club-page.component';
import { ResultsPageComponent } from './results-page/results-page.component';
import { PlayerComponent } from './player/player.component';
import {RegisterComponent} from './register-form/register-form.component';
import { NewsDetailsComponent } from './news-page/news-details/news-details.component';
import { AdminNewsComponent } from './Admin/admin-news/admin-news.component';
import { adminGuardGuard } from './Guards/admin-guard.guard';
import { userGuardGuard } from './Guards/user-guard.guard';
import { AdminNavBarComponent } from './Admin/admin-nav-bar/admin-nav-bar.component';
import { SingleNewsComponent } from './Admin/admin-news/single-news/single-news.component';
import {ConfirmEmailComponent} from './confirm-email/confirm-email.component';
import {clubGuardGuard} from './Guards/club-guard.guard';
import {ProfileComponent} from './profile/profile.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {SetNewPasswordComponent} from './set-new-password/set-new-password.component';
import {userAndAdminGuardGuard} from './Guards/user-and-admin-guard.guard';
import {guestUserGuard} from './Guards/guest-user.guard';
// import { VijestiComponent } from './user/vijesti/vijesti.component';
// import { RezultatiComponent } from './user/rezultati/rezultati.component';
// import { KlubComponent } from './user/klub/klub.component';
// import { RegisterComponent } from './authentication-authorization/register/register.component';

export const routes: Routes = [
        {path:'news-page', component:NewsPageComponent},
        {path:'admin-navbar', component:AdminNavBarComponent},
        {path:'club/:id', component:ClubPageComponent, canActivate:[clubGuardGuard]},
        {path:'results', component:ResultsPageComponent, canActivate:[userGuardGuard]},
        {path:'login-form',component:LoginFormComponent},
        {path:'app-player',component:PlayerComponent, canActivate:[adminGuardGuard]},
        {path:'confirm-email',component:ConfirmEmailComponent},
        {path:'reset',component:ResetPasswordComponent},
        {path:'reset-password',component:SetNewPasswordComponent},
        {path: 'news/:id', component:NewsDetailsComponent},
        {path:'profile',component:ProfileComponent,canActivate:[userAndAdminGuardGuard]},
        {
            path: '',
            component:LandingPageComponent,
            children: [
              { path: 'admin-news', component: AdminNewsComponent },
              { path: 'admin-players', component: PlayerComponent },
            ],
          },
        {path:'add-news', component:SingleNewsComponent},

        {path:'edit-news/:id', component:SingleNewsComponent}


    // {path:'vijesti', component:VijestiComponent},
    // {path:'rezultati', component:RezultatiComponent},
    // {path:'klub', component:KlubComponent},
    // {path:'register', component:RegisterComponent},
    // {path:'login', component:VijestiComponent},
    // {path:'home-page', component:VijestiComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })], // bindToComponentInputs koristi se za prikaz komponenti po potrebi
    exports: [RouterModule],
  })
  export class AppRoutingModule {}
