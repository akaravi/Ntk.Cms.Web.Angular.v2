import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRouting } from './app.routing';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/_services/auth.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SplashScreenModule } from './_metronic/partials/layout/splash-screen/splash-screen.module';
import { TeardownLogic } from 'rxjs';
import { SharedModule } from './shared/shared.module';
import { ToastrModule } from 'ngx-toastr';
import { CmsStoreModule } from './core/reducers/cmsStore.module';
import { CoreAuthService, CoreEnumService, CoreModuleService } from 'ntk-cms-api';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { InlineSVGModule } from 'ng-inline-svg-2';

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise<TeardownLogic>((resolve) => {
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}
export function CreateTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SplashScreenModule,
    TranslateModule.forRoot(),
    SharedModule.forRoot(),
    ToastrModule.forRoot({
      // timeOut: 0,
      timeOut: 5000,
      enableHtml: true,
      positionClass: 'toast-bottom-right',
      // positionClass: "toast-bottom-full-width",
      preventDuplicates: true,
      closeButton: true,
      // extendedTimeOut: 0,
      extendedTimeOut: 1000,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (CreateTranslateLoader),
        deps: [HttpClient]
      }
    }),
    HttpClientModule,
    ClipboardModule,
    AppRouting,
    InlineSVGModule.forRoot(),
    CmsStoreModule.forRoot(),
    NgbModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    CoreAuthService,
    CoreEnumService,
    CoreModuleService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {

  }
}
