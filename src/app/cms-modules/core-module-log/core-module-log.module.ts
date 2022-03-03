import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModuleLogComponent } from './core-module-log.component';
import { CoreModuleRoutes } from './core-module-log.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CmsFileManagerModule } from 'src/filemanager-api';
import { TagInputModule } from 'ngx-chips';
import { CoreModuleService, CoreModuleSiteCreditService, CoreModuleSiteUserCreditService, CoreModuleTagCategoryService, CoreModuleTagService } from 'ntk-cms-api';
import { CoreModuleLogReportAbuseListComponent } from './report-abuse/list/list.component';
import { CoreModuleLogReportAbuseEditComponent } from './report-abuse/edit/edit.component';
import { CoreModuleLogReportAbuseViewComponent } from './report-abuse/view/view.component';
import { CoreModuleLogFavoriteEditComponent } from './favorite/edit/edit.component';
import { CoreModuleLogFavoriteListComponent } from './favorite/list/list.component';
import { CoreModuleLogFavoriteViewComponent } from './favorite/view/view.component';
import { CoreModuleLogLikeEditComponent } from './like/edit/edit.component';
import { CoreModuleLogLikeListComponent } from './like/list/list.component';
import { CoreModuleLogLikeViewComponent } from './like/view/view.component';
import { CoreModuleLogScoreEditComponent } from './score/edit/edit.component';
import { CoreModuleLogScoreListComponent } from './score/list/list.component';
import { CoreModuleLogScoreViewComponent } from './score/view/view.component';
import { CoreModuleLogSiteCreditBlockedEditComponent } from './site-credit-blocked/edit/edit.component';
import { CoreModuleLogSiteCreditBlockedListComponent } from './site-credit-blocked/list/list.component';
import { CoreModuleLogSiteCreditBlockedViewComponent } from './site-credit-blocked/view/view.component';
import { CoreModuleLogSiteUserCreditBlockedEditComponent } from './site-user-credit-blocked/edit/edit.component';
import { CoreModuleLogSiteUserCreditBlockedListComponent } from './site-user-credit-blocked/list/list.component';
import { CoreModuleLogSiteUserCreditBlockedViewComponent } from './site-user-credit-blocked/view/view.component';



@NgModule({
  imports: [
    CoreModuleRoutes,
    CommonModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),

    SharedModule.forRoot(),
    AngularEditorModule,
    TagInputModule,
    CmsFileManagerModule
  ],
  declarations: [
    CoreModuleLogComponent,
    /**ReportAbuse */
    CoreModuleLogReportAbuseListComponent,
    CoreModuleLogReportAbuseEditComponent,
    CoreModuleLogReportAbuseViewComponent,
    /**Favorite */
    CoreModuleLogFavoriteListComponent,
    CoreModuleLogFavoriteEditComponent,
    CoreModuleLogFavoriteViewComponent,
    /**Like */
    CoreModuleLogLikeListComponent,
    CoreModuleLogLikeEditComponent,
    CoreModuleLogLikeViewComponent,
    /**score */
    CoreModuleLogScoreListComponent,
    CoreModuleLogScoreEditComponent,
    CoreModuleLogScoreViewComponent,
    /**SiteCreditBlocked */
    CoreModuleLogSiteCreditBlockedListComponent,
    CoreModuleLogSiteCreditBlockedEditComponent,
    CoreModuleLogSiteCreditBlockedViewComponent,
    /**SiteUserCreditBlocked */
    CoreModuleLogSiteUserCreditBlockedListComponent,
    CoreModuleLogSiteUserCreditBlockedEditComponent,
    CoreModuleLogSiteUserCreditBlockedViewComponent,
  ],
  exports: [
    CoreModuleLogComponent,
      /**ReportAbuse */
      CoreModuleLogReportAbuseListComponent,
      CoreModuleLogReportAbuseEditComponent,
      CoreModuleLogReportAbuseViewComponent,
      /**Favorite */
      CoreModuleLogFavoriteListComponent,
      CoreModuleLogFavoriteEditComponent,
      CoreModuleLogFavoriteViewComponent,
      /**Like */
      CoreModuleLogLikeListComponent,
      CoreModuleLogLikeEditComponent,
      CoreModuleLogLikeViewComponent,
      /**score */
      CoreModuleLogScoreListComponent,
      CoreModuleLogScoreEditComponent,
      CoreModuleLogScoreViewComponent,
      /**SiteCreditBlocked */
      CoreModuleLogSiteCreditBlockedListComponent,
      CoreModuleLogSiteCreditBlockedEditComponent,
      CoreModuleLogSiteCreditBlockedViewComponent,
      /**SiteUserCreditBlocked */
      CoreModuleLogSiteUserCreditBlockedListComponent,
      CoreModuleLogSiteUserCreditBlockedEditComponent,
      CoreModuleLogSiteUserCreditBlockedViewComponent,
  ],
  providers: [
    CoreModuleService,
    CoreModuleTagService,
    CoreModuleTagCategoryService,
    CoreModuleSiteCreditService,
    CoreModuleSiteUserCreditService,

  ]
})
export class CoreModuleLogModule { }