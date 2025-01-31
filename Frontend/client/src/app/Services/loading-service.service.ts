import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingServiceService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  showLoading(): void {
    this.loadingSubject.next(true);
  }

  hideLoading(): void {
    this.loadingSubject.next(false);
  }
}
