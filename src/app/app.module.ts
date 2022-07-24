import { NgModule, APP_INITIALIZER, OnInit, HostListener } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRouting } from './app.routing';
import { AppComponent } from './app.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TeardownLogic } from 'rxjs';
import { SharedModule } from './shared.module';
import { ToastrModule } from 'ngx-toastr';
import { CmsStoreModule } from './core/reducers/cmsStore.module';
import { CoreAuthService, CoreEnumService, CoreModuleService } from 'ntk-cms-api';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { CmsAuthService } from './core/services/cmsAuth.service';
import { MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SplashScreenComponent } from './shared/splash-screen/splash-screen.component';

function appInitializer(authService: CmsAuthService) {
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
  declarations: [
    AppComponent,
    SplashScreenComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

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
      deps: [CmsAuthService],
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA]
      }
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule implements OnInit {
  constructor(private swUpdate: SwUpdate) {
  }


  ngOnInit() {

    if (this.swUpdate.isEnabled) {

      this.swUpdate.available.subscribe(() => {

        if (confirm("New version available. Load New Version?")) {

          window.location.reload();
        }
      });
    }
  }
}
