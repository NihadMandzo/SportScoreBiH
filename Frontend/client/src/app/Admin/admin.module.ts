import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminNavBarComponent } from './admin-nav-bar/admin-nav-bar.component';
import { AdminNewsComponent } from './admin-news/admin-news.component';
import { SingleNewsComponent } from './admin-news/single-news/single-news.component';
import { AdminPlayersComponent } from './admin-players/admin-players.component';
import { adminGuardGuard } from '../Guards/admin-guard.guard';
import { PlayerComponent } from '../player/player.component';
import { AdminCommentsComponent } from './admin-comments/admin-comments.component';

const routes: Routes = [
  {
    path: '',
    component: AdminNavBarComponent,
    canActivate: [adminGuardGuard],
    children: [
      { path: 'news', component: AdminNewsComponent },
      { path: 'players', component: PlayerComponent },
      { path: 'add-news', component: SingleNewsComponent },
      { path: 'edit-news/:id', component: SingleNewsComponent },
      { path: 'comments', component: AdminCommentsComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    AdminNavBarComponent,
    AdminNewsComponent,
    SingleNewsComponent,
    AdminPlayersComponent,
    PlayerComponent
  ]
})
export class AdminModule { } 