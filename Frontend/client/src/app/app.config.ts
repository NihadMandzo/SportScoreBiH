import { APP_INITIALIZER,ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import { routes } from './app.routes';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FormsModule } from '@angular/forms';
import { jwtInterceptorInterceptor } from './Interceptors/jwt-interceptor.interceptor';
import { GlobalErrorHandler } from './ErrorHandlerService/global-error-handler.service';

import * as Sentry from '@sentry/angular';


export const appConfig: ApplicationConfig = {

  providers: [
    provideHttpClient(withInterceptors([jwtInterceptorInterceptor])),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    {provide:ErrorHandler, useClass:GlobalErrorHandler}, provideAnimationsAsync(),

    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },

    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],

};
