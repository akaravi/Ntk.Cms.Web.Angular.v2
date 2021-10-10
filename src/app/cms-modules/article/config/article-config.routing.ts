import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { ArticleConfigCheckSiteComponent } from './check-site/check-site.component';
import { ArticleConfigCheckUserComponent } from './check-user/check-user.component';
import { ArticleConfigMainAdminComponent } from './mainAdmin/configMainAdmin.component';
import { ArticleConfigSiteComponent } from './site/configSite.component';

const routes: Routes = [
  {
    path: '',
    children: [
      /*Config*/
      {
        path: 'mainadmin',
        component: ArticleConfigMainAdminComponent
      },
      {
        path: 'site',
        component: ArticleConfigSiteComponent
      },
      {
        path: 'site/:LinkSiteId',
        component: ArticleConfigSiteComponent
      },
      {
        path: 'checkuser',
        component: ArticleConfigCheckUserComponent
      },
      {
        path: 'checkuser/:LinkUserId',
        component: ArticleConfigCheckUserComponent
      },
      {
        path: 'checksite',
        component: ArticleConfigCheckSiteComponent
      },
      {
        path: 'checksite/:LinkSiteId',
        component: ArticleConfigCheckSiteComponent
      },
      /*Config*/
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticleConfigRouting {
}
