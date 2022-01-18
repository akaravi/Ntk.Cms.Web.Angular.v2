import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './_layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'builder',
        loadChildren: () =>
          import('./builder/builder.module').then((m) => m.BuilderModule),
      },
  
  

      // ** cms */
      {
        path: 'core',
        loadChildren: () =>
          import('../cms-modules/core-main/core.module').then(m => m.CoreModule)
      },
      {
        path: 'coremodule',
        loadChildren: () =>
          import('../cms-modules/core-module/coreModule.module').then(m => m.CoreModuleModule)
      },
      {
        path: 'coretoken',
        loadChildren: () =>
          import('../cms-modules/core-token/coreToken.module').then(m => m.CoreTokenModule)
      },
      {
        path: 'corelog',
        loadChildren: () =>
          import('../cms-modules/core-log/coreLog.module').then(m => m.CoreLogModule)
      },
      {
        path: 'apitelegram',
        loadChildren: () =>
          import('../cms-modules/api-telegram/api-telegram.module').then(m => m.ApiTelegramModule)
      },
      {
        path: 'application',
        loadChildren: () =>
          import('../cms-modules/application/application.module').then(m => m.ApplicationModule)
      },
      {
        path: 'article',
        loadChildren: () =>
          import('../cms-modules/article/article.module').then(m => m.ArticleModule)
      },
      {
        path: 'bankpayment',
        loadChildren: () =>
          import('../cms-modules/bank-payment/bank-payment.module').then(m => m.BankPaymentModule)
      },
      {
        path: 'biography',
        loadChildren: () =>
          import('../cms-modules/biography/biography.module').then(m => m.BiographyModule)
      },
      {
        path: 'blog',
        loadChildren: () =>
          import('../cms-modules/blog/blog.module').then(m => m.BlogModule)
      },
      {
        path: 'hypershop',
        loadChildren: () =>
          import('../cms-modules/hyper-shop/hyperShop.module').then(m => m.HyperShopModule)
      },
      {
        path: 'linkmanagement',
        loadChildren: () =>
          import('../cms-modules/link-management/linkManagement.module').then(m => m.LinkManagementModule)
      },
      {
        path: 'member',
        loadChildren: () =>
          import('../cms-modules/member/member.module').then(m => m.MemberModule)
      },

      {
        path: 'news',
        loadChildren: () =>
          import('../cms-modules/news/news.module').then(m => m.NewsModule)
      },

      {
        path: 'chart',
        loadChildren: () =>
          import('../cms-modules/chart/chart.module').then(m => m.ChartModule)
      },
      {
        path: 'filemanager',
        loadChildren: () =>
          import('../cms-modules/file-manager/fileManager.module').then(m => m.FileManagerModule)
      },
      {
        path: 'polling',
        loadChildren: () =>
          import('../cms-modules/polling/polling.module').then(m => m.PollingModule)
      },
      {
        path: 'sms',
        loadChildren: () =>
          import('../cms-modules/sms/sms.module').then(m => m.SmsModule)
      },
      {
        path: 'ticketing',
        loadChildren: () =>
          import('../cms-modules/ticketing/ticketing.module').then(m => m.TicketingModule)
      },
      {
        path: 'universalmenu',
        loadChildren: () =>
          import('../cms-modules/universal-menu/universalMenu.module').then(m => m.UniversalMenuModule)
      },
      {
        path: 'webdesigner',
        loadChildren: () =>
          import('../cms-modules/web-designer/webDesigner.module').then(m => m.WebDesignerModule)
      },
      {
        path: 'estate',
        loadChildren: () =>
          import('../cms-modules/estate/estate.module').then(m => m.EstateModule)
      },
      {
        path: 'donate',
        loadChildren: () =>
          import('../cms-modules/donate/donate.module').then(m => m.DonateModule)
      },
      {
        path: 'api-telegram',
        loadChildren: () =>
          import('../cms-modules/api-telegram/api-telegram.module').then(m => m.ApiTelegramModule)
      },
      // ** cms */
      {
        path: '',
        redirectTo: 'dashboard', // dashboard // auth
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }
