import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch, HttpClient } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideLucideIcons } from '@lucide/angular';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, TRANSLATE_HTTP_LOADER_CONFIG } from '@ngx-translate/http-loader';
import {
  LucideLayoutDashboard, LucideShoppingBag, LucidePackage, LucideChartBarBig,
  LucideBell, LucideSearch, LucideSettings, LucideLogOut, LucideMenu, LucideX,
  LucideChevronLeft, LucideChevronRight, LucideCoffee, LucideTrendingUp,
  LucideUsers, LucideDollarSign, LucideShoppingCart, LucideUserCheck, LucideUserX, LucideBoxes,
  LucideArrowUp, LucideArrowDown, LucideEye, LucidePencil, LucideTrash2,
  LucideFilter, LucideDownload, LucideCalendar, LucidePlus, LucideCheckCircle,
  LucideClock, LucideXCircle, LucideAlertCircle, LucideStar, LucideSparkles, LucideLock,
  LucideMapPin, LucidePhone, LucideStore, LucideWrench, LucideShieldCheck, LucideGlobe,
  LucideToggleLeft, LucideToggleRight, LucideSave, LucideRefreshCw,
  LucideSun, LucideMoon, LucideChevronDown, LucideExternalLink, LucideMap,
  LucideDoorOpen, LucideCar, LucideUserPlus
} from '@lucide/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),

    // Translation Service Setup (ngx-translate v18 API)
    // The loader config is provided via its DI token; TranslateHttpLoader
    // self-injects HttpClient and takes no constructor arguments.
    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: { prefix: './assets/i18n/', suffix: '.json' }
    },
    provideTranslateService({
      lang: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: () => new TranslateHttpLoader()
      }
    }),
    
    provideLucideIcons(
      LucideLayoutDashboard, LucideShoppingBag, LucidePackage, LucideChartBarBig,
      LucideBell, LucideSearch, LucideSettings, LucideLogOut, LucideMenu, LucideX,
      LucideChevronLeft, LucideChevronRight, LucideCoffee, LucideTrendingUp,
      LucideUsers, LucideDollarSign, LucideShoppingCart, LucideUserCheck, LucideUserX, LucideBoxes,
      LucideArrowUp, LucideArrowDown, LucideEye, LucidePencil, LucideTrash2,
      LucideFilter, LucideDownload, LucideCalendar, LucidePlus, LucideCheckCircle,
      LucideClock, LucideXCircle, LucideAlertCircle, LucideStar, LucideSparkles, LucideLock,
      LucideMapPin, LucidePhone, LucideStore, LucideWrench, LucideShieldCheck, LucideGlobe,
      LucideToggleLeft, LucideToggleRight, LucideSave, LucideRefreshCw,
      LucideSun, LucideMoon, LucideChevronDown, LucideExternalLink, LucideMap,
      LucideDoorOpen, LucideCar, LucideUserPlus
    )
  ]
};
