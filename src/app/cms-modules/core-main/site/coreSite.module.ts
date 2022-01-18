import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreSiteRouting } from './coreSite.routing';
import { CoreSiteComponent } from './coreSite.component';
import {
  CoreModuleService,
  CoreModuleSiteService,
  CoreSiteCategoryCmsModuleService,
  CoreSiteCategoryService,
  CoreSiteDomainAliasService,
  CoreSiteService,
  CoreSiteUserService,
  CoreUserService
} from 'ntk-cms-api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreSiteSelectionComponent } from './selection/selection.component';
import { CoreSiteAddFirstComponent } from './addFirst/addFirst.component';
import { CoreSiteResolver } from './coreSite.resolver';
import { SharedModule } from 'src/app/shared/shared.module';
import { CoreSiteTreeComponent } from './tree/tree.component';
import { CoreSiteSelectorComponent } from './selector/selector.component';
import { CoreSiteDeleteComponent } from './delete/delete.component';
import { CoreSiteEditComponent } from './edit/edit.component';
import { CoreSiteAddComponent } from './add/add.component';
import { CoreSiteListComponent } from './list/list.component';

import { AngularEditorModule } from '@kolkov/angular-editor';
import { TagInputModule } from 'ngx-chips';
import { CoreSiteCategoryCmsModule } from '../site-category/coreSiteCategory.module';
import { CoreSiteCategoryCmsModuleModule } from '../site-category-module/coreSiteCategoryCmsModule.module';
import { CoreSiteModuleListComponent } from './moduleList/moduleList.component';
import { CoreSiteModuleEditComponent } from './moduleEdit/moduleEdit.component';
import { CoreSiteModuleAddComponent } from './moduleAdd/moduleAdd.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { CoreModuleModule } from '../module/coreModule.module';
import { CoreSiteUserListComponent } from './userList/userList.component';
import { CoreSiteUserAddComponent } from './userAdd/userAdd.component';
import { CoreSiteUserEditComponent } from './userEdit/userEdit.component';
import { CoreUserModule } from '../user/coreUser.module';
import { CoreUserGroupCmsModule } from '../user-group/coreUserGroup.module';
import { CoreSiteResellerChartComponent } from './reseller-chart/reseller-chart.component';
import { CoreSiteModuleSiteInfoComponent } from './module-site-info/module-site-info.component';
import { CoreSiteModuleSiteOptimazeComponent } from './module-site-optimaze/module-site-optimaze.component';



@NgModule({
  declarations: [
    CoreSiteComponent,
    CoreSiteAddFirstComponent,
    CoreSiteSelectionComponent,
    CoreSiteListComponent,
    CoreSiteAddComponent,
    CoreSiteEditComponent,
    CoreSiteDeleteComponent,
    CoreSiteSelectorComponent,
    CoreSiteTreeComponent,
    CoreSiteModuleListComponent,
    CoreSiteModuleAddComponent,
    CoreSiteModuleEditComponent,
    CoreSiteUserListComponent,
    CoreSiteUserAddComponent,
    CoreSiteUserEditComponent,
    CoreSiteResellerChartComponent,
    CoreSiteModuleSiteInfoComponent,
    CoreSiteModuleSiteOptimazeComponent,
  ],
  exports: [
    CoreSiteComponent,
    CoreSiteAddFirstComponent,
    CoreSiteSelectionComponent,
    CoreSiteListComponent,
    CoreSiteAddComponent,
    CoreSiteEditComponent,
    CoreSiteDeleteComponent,
    CoreSiteSelectorComponent,
    CoreSiteTreeComponent,
    CoreSiteModuleListComponent,
    CoreSiteModuleAddComponent,
    CoreSiteModuleEditComponent,
    CoreSiteUserListComponent,
    CoreSiteUserAddComponent,
    CoreSiteUserEditComponent,
    CoreSiteResellerChartComponent,
    CoreSiteModuleSiteInfoComponent,
    CoreSiteModuleSiteOptimazeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreSiteRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    AngularEditorModule,
    TagInputModule,
    CoreSiteCategoryCmsModule,
    CoreSiteCategoryCmsModuleModule,
    CoreModuleModule,
    CoreUserModule,
    CoreUserGroupCmsModule,
  ],
  providers: [
    CoreSiteService,
    CoreSiteCategoryCmsModuleService,
    CoreModuleService,
    CoreSiteCategoryService,
    CoreSiteResolver,
    CoreModuleSiteService,
    CoreSiteDomainAliasService,
    CmsConfirmationDialogService,
    CoreUserService,
    CoreSiteUserService,
  ]
})
export class CoreSiteModule {
}
