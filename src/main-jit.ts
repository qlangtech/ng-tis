import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from "./runtime/app.module-jit";

// import 'zone.js';
// import 'reflect-metadata';

platformBrowserDynamic().bootstrapModule(AppModule);
