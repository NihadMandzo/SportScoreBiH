/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as Sentry from "@sentry/angular";
//import {Integrations} from '@sentry/integrations';

Sentry.init({
  dsn: "https://b960eb2d502ef4534dc1af8b5819e984@o4508512212811776.ingest.de.sentry.io/4508512472727632",
  integrations: [
  ],
  tracesSampleRate: 1.0,
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) =>
   console.error(err));
