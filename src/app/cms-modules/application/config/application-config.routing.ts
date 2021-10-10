import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { ApplicationConfigCheckSiteComponent } from './check-site/check-site.component';
import { ApplicationConfigCheckUserComponent } from './check-user/check-user.component';
import { ApplicationConfigMainAdminComponent } from './mainAdmin/configMainAdmin.component';
import { ApplicationConfigSiteComponent } from './site/configSite.component';

const routes: Routes = [
  {
    path: '',
    children: [
      /*Config*/
      {
        path: 'mainadmin',
        component: ApplicationConfigMainAdminComponent
      },
      {
        path: 'site',
        component: ApplicationConfigSiteComponent
      },
      {
        path: 'site/:LinkSiteId',
        component: ApplicationConfigSiteComponent
      },
      {
        path: 'checkuser',
        component: ApplicationConfigCheckUserComponent
      },
      {
        path: 'checkuser/:LinkUserId',
        component: ApplicationConfigCheckUserComponent
      },
      {
        path: 'checksite',
        component: ApplicationConfigCheckSiteComponent
      },
      {
        path: 'checksite/:LinkSiteId',
        component: ApplicationConfigCheckSiteComponent
      },
      /*Config*/
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationConfigRouting {
}
