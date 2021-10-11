import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  HyperShopConfigurationService,
  CoreModuleService,
  CoreUserGroupService,
} from 'ntk-cms-api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

// import { TreeviewModule } from 'ngx-treeview';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TagInputModule } from 'ngx-chips';
import { HyperShopConfigMainAdminComponent } from './mainAdmin/configMainAdmin.component';
import { HyperShopConfigSiteComponent } from './site/configSite.component';
import { HyperShopConfigCheckUserComponent } from './check-user/check-user.component';
import { HyperShopConfigCheckSiteComponent } from './check-site/check-site.component';
import { HyperShopConfigRouting } from './hyper-shop-config.routing';


@NgModule({
  declarations: [
    /*Config*/
    HyperShopConfigMainAdminComponent,
    HyperShopConfigSiteComponent,
    HyperShopConfigCheckUserComponent,
    HyperShopConfigCheckSiteComponent,
    /*Config*/
  ],
  exports: [
    /*Config*/
    HyperShopConfigMainAdminComponent,
    HyperShopConfigSiteComponent,
    HyperShopConfigCheckUserComponent,
    HyperShopConfigCheckSiteComponent,
    /*Config*/
  ],
  imports: [
    CommonModule,
    FormsModule,
    HyperShopConfigRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    AngularEditorModule,
  ],
  providers: [
    HyperShopConfigurationService,
  ]
})
export class HyperShopConfigModule {
}