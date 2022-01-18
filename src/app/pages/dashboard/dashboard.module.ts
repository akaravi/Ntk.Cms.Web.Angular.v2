import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardsModule } from '../../_metronic/partials/content/dashboards/dashboards.module';
import { NewsContentWidgetComponent } from 'src/app/cms-modules/news/content/widget/widget.component';
import { PublicHelper } from 'src/app/core/helpers/publicHelper';
import { ApplicationAppWidgetComponent } from 'src/app/cms-modules/application/content/widget/widget.component';
import { ApplicationMemberInfoWidgetComponent } from 'src/app/cms-modules/application/memberInfo/widget/widget.component';
import { ChartContentWidgetComponent } from 'src/app/cms-modules/chart/content/widget/widget.component';
import { ArticleContentWidgetComponent } from 'src/app/cms-modules/article/content/widget/widget.component';
import { CoreSiteWidgetCountComponent } from 'src/app/cms-modules/core-main/site/widget/count/widget.component';
import { CoreSiteWidgetStatusComponent } from 'src/app/cms-modules/core-main/site/widget/status/widget.component';
import { CoreSiteWidgetModuleComponent } from 'src/app/cms-modules/core-main/site/widget/module/widget.component';
import { CoreUserWidgetComponent } from 'src/app/cms-modules/core-main/user/widget/widget.component';
import {
  ApplicationAppService,
  ApplicationMemberInfoService,
  ArticleContentService,
  BiographyContentService,
  BlogContentService,
  ChartContentService,
  CoreSiteService,
  CoreUserClaimContentService,
  CoreUserClaimTypeService,
  CoreUserService,
  EstatePropertyService,
  NewsContentService
} from 'ntk-cms-api';
import { SharedModule } from 'src/app/shared/shared.module';
import { CmsFileManagerModule } from 'src/filemanager-api';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NewsContentWidget2Component } from 'src/app/cms-modules/news/content/widget/widget2.component';
import { CmsHtmlWidgetComponent } from 'src/app/shared/cms-html-widget/cms-html-widget.component';
import { TranslationModule } from 'src/app/core/i18n/translation.module';
import { ApplicationAppWidget2Component } from 'src/app/cms-modules/application/content/widget/widget2.component';
import { ArticleContentWidget2Component } from 'src/app/cms-modules/article/content/widget/widget2.component';
import { BiographyContentWidgetComponent } from 'src/app/cms-modules/biography/content/widget/widget.component';
import { BiographyContentWidget2Component } from 'src/app/cms-modules/biography/content/widget/widget2.component';
import { BlogContentWidgetComponent } from 'src/app/cms-modules/blog/content/widget/widget.component';
import { BlogContentWidget2Component } from 'src/app/cms-modules/blog/content/widget/widget2.component';
import { ChartContentWidget2Component } from 'src/app/cms-modules/chart/content/widget/widget2.component';
import { ApplicationMemberInfoWidget2Component } from 'src/app/cms-modules/application/memberInfo/widget/widget2.component';
import { CoreSiteWidgetCount2Component } from 'src/app/cms-modules/core-main/site/widget/count/widget2.component';
import { ApplicationAppWidgetCreateComponent } from 'src/app/cms-modules/application/content/widget/create/widget-create.component';
import { EstatePropertyWidgetComponent } from 'src/app/cms-modules/estate/property/widget/widget.component';
import { EstatePropertyWidget2Component } from 'src/app/cms-modules/estate/property/widget/widget2.component';
import { EstatePropertyWidgetAddComponent } from 'src/app/cms-modules/estate/property/widget/widget-add.component';
import { CoreUserClaimContentWidgetStatusComponent } from 'src/app/cms-modules/core-main/user-claim/content/widget/widget-status.component';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [
    DashboardComponent,
    ApplicationAppWidgetComponent,
    ApplicationAppWidget2Component,
    ApplicationAppWidgetCreateComponent,
    ApplicationMemberInfoWidgetComponent,
    ApplicationMemberInfoWidget2Component,
    NewsContentWidgetComponent,
    NewsContentWidget2Component,
    ChartContentWidgetComponent,
    ChartContentWidget2Component,
    ArticleContentWidgetComponent,
    ArticleContentWidget2Component,
    BiographyContentWidgetComponent,
    BiographyContentWidget2Component,
    BlogContentWidgetComponent,
    BlogContentWidget2Component,
    CoreSiteWidgetCountComponent,
    CoreSiteWidgetCount2Component,
    CoreSiteWidgetStatusComponent,
    CoreSiteWidgetModuleComponent,
    CoreUserWidgetComponent,
    CoreUserClaimContentWidgetStatusComponent,
    CmsHtmlWidgetComponent,
    EstatePropertyWidgetComponent,
    EstatePropertyWidget2Component,
    EstatePropertyWidgetAddComponent,
    // ForExport
  ],
  exports: [
    CmsHtmlWidgetComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    DashboardsModule,
    InlineSVGModule,
    NgApexchartsModule,
    TranslationModule,
    SharedModule.forRoot(),
    // CmsFileManagerModule
  ],
  providers: [
    PublicHelper,
    ApplicationAppService,
    ApplicationMemberInfoService,
    NewsContentService,
    BiographyContentService,
    BlogContentService,
    EstatePropertyService,
    ChartContentService,
    ArticleContentService,
    CoreSiteService,
    CoreUserService,
    CoreUserClaimContentService,
    CoreUserClaimTypeService
  ]
})
export class DashboardModule { }
