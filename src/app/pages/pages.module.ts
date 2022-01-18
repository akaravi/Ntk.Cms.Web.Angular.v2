import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages.routing';
import {
  NgbDropdownModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';
import { LayoutComponent } from './_layout/layout.component';
import { ScriptsInitComponent } from './_layout/init/scipts-init/scripts-init.component';
import { HeaderMobileComponent } from './_layout/components/header-mobile/header-mobile.component';
import { FooterComponent } from './_layout/components/footer/footer.component';
import { HeaderComponent } from './_layout/components/header/header.component';
import { TopbarComponent } from './_layout/components/topbar/topbar.component';
import { ExtrasModule } from '../_metronic/partials/layout/extras/extras.module';
import { CoreModule, DynamicAsideMenuService, DynamicHeaderMenuService } from '../_metronic/core';
import { SubheaderModule } from '../_metronic/partials/layout/subheader/subheader.module';
import { AsideDynamicComponent } from './_layout/components/aside-dynamic/aside-dynamic.component';
import { HeaderMenuDynamicComponent } from './_layout/components/header/header-menu-dynamic/header-menu-dynamic.component';
import { CoreSiteModule } from '../cms-modules/core-main/site/coreSite.module';
import { SharedModule } from '../shared/shared.module';
import { CoreAuthService, CoreConfigurationService, CoreCpMainMenuService, CoreModuleService } from 'ntk-cms-api';
import { TranslationModule } from '../core/i18n/translation.module';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [
    LayoutComponent,
    ScriptsInitComponent,
    HeaderMobileComponent,
    FooterComponent,
    HeaderComponent,
    TopbarComponent,
    AsideDynamicComponent,
    HeaderMenuDynamicComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    TranslationModule,
    InlineSVGModule,
    ExtrasModule,
    NgbDropdownModule,
    NgbProgressbarModule,
    CoreModule,
    SubheaderModule,
    CoreSiteModule,
    SharedModule.forRoot(),
  ],
  providers: [
    CoreModuleService,
    CoreCpMainMenuService,
    CoreConfigurationService,
    CoreAuthService,
    DynamicHeaderMenuService,
    DynamicAsideMenuService,

  ]
})
export class PagesModule { }
