import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TicketingComponent } from './ticketing.component';
import { TicketingDepartemenListComponent } from './departemen/list/list.component';
import { TicketingDepartemenEditComponent } from './departemen/edit/edit.component';
import { TicketingFaqListComponent } from './faq/list/list.component';
import { TicketingTaskEditComponent } from './task/edit/edit.component';
import { TicketingTaskListComponent } from './task/list/list.component';
import { TicketingTemplateListComponent } from './template/list/list.component';
import { TicketingConfigMainAdminComponent } from './config/main-admin/config-main-admin.component';
import { TicketingConfigSiteComponent } from './config/site/config-site.component';
import { TicketingDepartemenLogListComponent } from './departemenLog/list/list.component';
import { TicketingAnswerListComponent } from './answer/list/list.component';
import { TicketingTaskContactUsComponent } from './task/contact-us/contact-us.component';
import { TicketingFaqOriginListComponent } from './faq/origin-list/origin-list.component';

const routes: Routes = [
  {
    path: '',
    component: TicketingComponent,
    children: [
     /* Config */
     {
      path: 'config',
      loadChildren: () =>
        import('./config/ticketing-config.module').then((m) => m.TicketingConfigModule),
    },
    /* Config */
      {
        path: 'departemen',
        component: TicketingDepartemenListComponent
      },
      {
        path: 'departemen/add/',
        component: TicketingDepartemenEditComponent
      },
      {
        path: 'departemen/edit/:Id',
        component: TicketingDepartemenEditComponent
      },
      {
        path: 'departemenlog/DepartemenId/:DepartemenId',
        component: TicketingDepartemenLogListComponent
      },
      {
        path: 'departemenlog/OperatorId/:OperatorId',
        component: TicketingDepartemenLogListComponent
      },
      {
        path: 'faq',
        component: TicketingFaqOriginListComponent
      },
      {
        path: 'faq/:DepartemenId',
        component: TicketingFaqListComponent
      }
      ,
      {
        path: 'faq/list',
        component: TicketingFaqListComponent
      }
      ,
      {
        path: 'template',
        component: TicketingTemplateListComponent
      },
      {
        path: 'template/:DepartemenId',
        component: TicketingTemplateListComponent
      }
      ,
      {
        path: 'contactus',
        component: TicketingTaskContactUsComponent
      }
      ,
      {
        path: 'task',
        component: TicketingTaskListComponent
      },
      {
        path: 'task/:DepartemenId',
        component: TicketingTaskListComponent
      }
      ,
      {
        path: 'task/edit/:id',
        component: TicketingTaskEditComponent
      }
      ,
      {
        path: 'answer',
        component: TicketingAnswerListComponent
      },
      {
        path: 'answer/LinkTicketId/:LinkTicketId',
        component: TicketingAnswerListComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketingRouting {
}
