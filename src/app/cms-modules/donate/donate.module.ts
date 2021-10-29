import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonateComponent } from './donate.component';
import { DonateRoutes } from './donate.routing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TagInputModule } from 'ngx-chips';
import { CmsFileManagerModule } from 'src/filemanager-api';
import {
  CoreAuthService,
  CoreEnumService,
  CoreModuleService,
  CoreModuleTagService,
  DonateConfigurationService,
  DonateEnumService,
  DonateLogViewService,
  DonateSponsorService,
  DonateTargetCategoryService,
  DonateTargetPeriodService,
  DonateTargetPeriodSponsorService,
  DonateTargetService,
  DonateTransactionService
} from 'ntk-cms-api';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { CmsConfirmationDialogService } from 'src/app/shared/cms-confirmation-dialog/cmsConfirmationDialog.service';
import { DonateConfigMainAdminComponent } from './config/main-admin/config-main-admin.component';
import { DonateConfigSiteComponent } from './config/site/config-site.component';
import { IconPickerModule } from 'ngx-icon-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DonateTargetCategoryAddComponent } from './target-category/add/add.component';
import { DonateTargetCategoryEditComponent } from './target-category/edit/edit.component';
import { DonateTargetCategorySelectorComponent } from './target-category/selector/selector.component';
import { DonateTargetAddComponent } from './target/add/add.component';
import { DonateTargetEditComponent } from './target/edit/edit.component';
import { DonateTargetCategoryDeleteComponent } from './target-category/delete/delete.component';
import { DonateTargetDeleteComponent } from './target/delete/delete.component';
import { DonateTargetTreeComponent } from './target/tree/tree.component';
import { DonateTargetSelectorComponent } from './target/selector/selector.component';
import { DonateTargetListComponent } from './target/list/list.component';
import { DonateTargetCategoryTreeComponent } from './target-category/tree/tree.component';

@NgModule({
  declarations: [
    DonateComponent,
    /* */
    DonateTargetCategoryAddComponent,
    DonateTargetCategoryEditComponent,
    DonateTargetCategoryDeleteComponent,
    DonateTargetCategorySelectorComponent,
    DonateTargetCategoryTreeComponent,
    /* */
    DonateTargetAddComponent,
    DonateTargetEditComponent,
    DonateTargetDeleteComponent,
    DonateTargetSelectorComponent,
    DonateTargetTreeComponent,
    DonateTargetListComponent,
  ],
  imports: [
    CommonModule,
    DonateRoutes,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    
    SharedModule.forRoot(),
    AngularEditorModule,
    TagInputModule,
    
    MatIconModule,
    MatFormFieldModule,
    MatStepperModule,
    IconPickerModule,
    DragDropModule,
  ],
  providers: [
    CoreModuleService,
    CoreEnumService,
    CoreAuthService,
    /*Config*/
    DonateConfigurationService,
    /*Config*/
    /** */
    DonateEnumService,
    DonateLogViewService,
    DonateSponsorService,
    DonateTargetService,
    DonateTargetCategoryService,
    DonateTargetPeriodService,
    DonateTargetPeriodSponsorService,
    DonateTransactionService,
    /** */
    CmsConfirmationDialogService,
    CoreModuleTagService,

  ]
})
export class DonateModule { }
