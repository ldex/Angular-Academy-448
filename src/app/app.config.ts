import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, isDevMode } from "@angular/core";
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from "@angular/router";
import { routes } from "./app.routes";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { loadingInterceptor } from "./interceptors/loading.interceptor";
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const appProviders = [
  provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor])),
  provideRouter(
    routes,
    withComponentInputBinding(),
    withPreloading(PreloadAllModules)
  ),
];

export const appConfig: ApplicationConfig = {
  providers: [
    ...appProviders,
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
],
};
