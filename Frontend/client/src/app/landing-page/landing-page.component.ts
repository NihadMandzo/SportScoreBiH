import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { LoginFormComponent } from "../login-form/login-form.component";
import { NgIf } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RegisterComponent } from "../register-form/register-form.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink,
    MatSlideToggleModule, FormsModule,
    LoginFormComponent, NgIf, RegisterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',

  //For angular animations and smooth transition
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('1s ease', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('1s ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('1s ease', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class LandingPageComponent {

  showLoginRegisterSection = false;

  showLoginFormComponent = false;
  showRegisterFormComponent=false;


  constructor(private router: Router) {}


  start() {
    this.showLoginRegisterSection = true;
  }

  showLoginForm() {
    // //this.router.navigate(['/login']);


    this.showLoginFormComponent=true;
    this.showRegisterFormComponent=false;
    //this.router.navigate(['/login-form']);
  }

  showRegisterForm() {
    // console.log("Opening Register Form...");
    this.showRegisterFormComponent=true;
    this.showLoginFormComponent=false;

  }

  navigateToLogin() {
    this.showLoginFormComponent = true; // Prikazuje login formu
    this.showRegisterFormComponent = false;
  }

  ContinueAsGuest(){
    this.router.navigate(['/news-page']);
  }
}
