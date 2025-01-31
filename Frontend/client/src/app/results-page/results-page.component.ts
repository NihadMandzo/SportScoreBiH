import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-results-page',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './results-page.component.html',
  styleUrl: './results-page.component.css'
})
export class ResultsPageComponent {

}
