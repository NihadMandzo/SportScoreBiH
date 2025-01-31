import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular';


@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    Sentry.captureException(error);
    //console.error('Global Error Handler Caught:', error);
    // Ovde možete dodati dodatnu logiku, npr. slanje grešaka na server
  }
}
