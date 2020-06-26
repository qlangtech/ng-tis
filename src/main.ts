import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from "./runtime/app.module-jit";
import { enableProdMode } from '@angular/core';

// import 'zone.js';
// import 'reflect-metadata';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
