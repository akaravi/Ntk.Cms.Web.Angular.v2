import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  CoreModuleService,
  CoreSiteCategoryCmsModuleService,
} from 'ntk-cms-api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { CoreSiteCategoryCmsModuleTreeComponent } from './tree/tree.component';
import { CoreSiteCategoryCmsModuleSelectorComponent } from './selector/selector.component';
import { CoreSiteCategoryCmsModuleListComponent } from './list/list.component';

import { AngularEditorModule } from '@kolkov/angular-editor';

import { CoreSiteCategoryCmsModuleComponent } from './coreSiteCategoryCmsModule.component';
import { CoreSiteCategoryCmsModuleRouting } from './coreSiteCategoryCmsModule.routing';
import { CoreSiteCategoryCmsModuleListViewComponent } from './listview/listview.component';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { CoreSiteCategoryCmsModuleAddComponent } from './add/add.component';
import { CoreSiteCategoryCmsModuleEditComponent } from './edit/edit.component';
import { CoreModuleModule } from '../module/coreModule.module';
import { CoreSiteCategoryCmsModule } from '../site-category/coreSiteCategory.module';


@NgModule({
  declarations: [
    CoreSiteCategoryCmsModuleComponent,
    CoreSiteCategoryCmsModuleListComponent,
    CoreSiteCategoryCmsModuleListViewComponent,
    CoreSiteCategoryCmsModuleAddComponent,
    CoreSiteCategoryCmsModuleEditComponent,

    CoreSiteCategoryCmsModuleSelectorComponent,
    CoreSiteCategoryCmsModuleTreeComponent,
  ],
  exports: [
    CoreSiteCategoryCmsModuleComponent,
    CoreSiteCategoryCmsModuleListComponent,
    CoreSiteCategoryCmsModuleListViewComponent,
    CoreSiteCategoryCmsModuleAddComponent,
    CoreSiteCategoryCmsModuleEditComponent,

    CoreSiteCategoryCmsModuleSelectorComponent,
    CoreSiteCategoryCmsModuleTreeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreSiteCategoryCmsModuleRouting,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    SharedModule.forRoot(),
    AngularEditorModule,
    
    CoreModuleModule,
    CoreSiteCategoryCmsModule,
  ],
  providers: [
    CoreSiteCategoryCmsModuleService,
    CmsConfirmationDialogService,
    CoreModuleService,
  ]
})
export class CoreSiteCategoryCmsModuleModule {
}
